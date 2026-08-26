import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Editor } from 'ngx-editor';
import { marks as editorMarks, nodes as editorNodes } from 'ngx-editor/schema';
import { setBlockType } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Fragment, Schema } from 'prosemirror-model';
import type { DOMOutputSpec, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { Subscription } from 'rxjs';
import { Constants } from '../../../commons/constants';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { containsUnsafeRichTextMarkup, removeUnsafeRichTextElements, sanitiseRichTextDocument } from './rich-text-sanitizer';

type RichTextToolbarCommand = 'undo' | 'redo' | 'bold' | 'italic' | 'underline' | 'paragraph' | 'heading' | 'indent' | 'outdent' | 'ordered_list' | 'bullet_list';
type RichTextListStyle = '' | 'ordered_list' | 'ordered_alpha' | 'ordered_roman' | 'bullet_list';
type RichTextOrderedListStyle = 'decimal' | 'lower-alpha' | 'lower-roman';

interface WordListConversionState {
  listStack: HTMLElement[];
  listParents: Node[];
  resetListLevels: Map<string, number>;
  previousListId: string;
}

interface IndentedListBlock {
  node: ProseMirrorNode;
  position: number;
  index: number;
  indent: number;
}

interface NestedListBuildResult {
  list: ProseMirrorNode;
  nextIndex: number;
}

function orderedListStyleForType(type: string): RichTextOrderedListStyle | null {
  if (type === 'a') {
    return 'lower-alpha';
  }
  if (type === 'i') {
    return 'lower-roman';
  }
  return null;
}

function orderedListTypeForStyle(style: RichTextOrderedListStyle): string | null {
  if (style === 'lower-alpha') {
    return 'a';
  }
  if (style === 'lower-roman') {
    return 'i';
  }
  return null;
}

const WORD_COLUMN_SPACING = 12;
const MAX_INDENT = 6;
const CSS_LENGTH_UNITS = ['rem', 'px', 'pt', 'in', 'cm', 'mm', 'em'];
const BLOCK_NODE_NAMES = new Set([
  'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'
]);

const richTextNodes = {
  ...editorNodes,
  list_item: {
    ...editorNodes.list_item,
    content: '(paragraph | heading) block*'
  } as NodeSpec,
  ordered_list: {
    ...editorNodes.ordered_list,
    attrs: {
      order: { default: 1 },
      indent: { default: null },
      listStyle: { default: null }
    },
    parseDOM: [{
      tag: 'ol',
      getAttrs: (element) => {
        const list = element as HTMLElement;
        return {
          order: list.hasAttribute('start') ? Number(list.getAttribute('start')) : 1,
          indent: Number(list.dataset.indent) || null,
          listStyle: orderedListStyleForType(list.getAttribute('type'))
        };
      }
    }],
    toDOM: (node): DOMOutputSpec => ['ol', {
      start: node.attrs.order === 1 ? null : node.attrs.order,
      'data-indent': node.attrs.indent,
      type: orderedListTypeForStyle(node.attrs.listStyle)
    }, 0]
  } as NodeSpec,
  bullet_list: {
    ...editorNodes.bullet_list,
    attrs: {
      indent: { default: null },
      continuationOrder: { default: null }
    },
    parseDOM: [{
      tag: 'ul',
      getAttrs: (element) => {
        const list = element as HTMLElement;
        return {
          indent: Number(list.dataset.indent) || null
        };
      }
    }],
    toDOM: (node): DOMOutputSpec => ['ul', {
      'data-indent': node.attrs.indent
    }, 0]
  } as NodeSpec
};

const richTextSchema = new Schema({ nodes: richTextNodes, marks: editorMarks });

@Component({
  selector: 'ccd-write-rich-text-area-field',
  templateUrl: './write-rich-text-area-field.component.html',
  styleUrls: ['./write-rich-text-area-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class WriteRichTextAreaFieldComponent extends AbstractFieldWriteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorHost')
  public editorHost: ElementRef<HTMLElement>;

  public editor: Editor;
  public richTextAreaControl: FormControl;
  public activeToolbarCommands: { [key in RichTextToolbarCommand]?: boolean } = {};

  private editorUpdateSubscription: Subscription;
  private isNormalisingValue = false;
  private paragraphCommandApplied = false;
  private statusChangesSubscription: Subscription;
  private valueChangesSubscription: Subscription;

  public ngOnInit(): void {
    this.editor = new Editor({
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
      schema: richTextSchema,
      parseOptions: {
        preserveWhitespace: true
      },
      plugins: [
        new Plugin({
          props: {
            handlePaste: (_view, event) => this.handleEditorPaste(event),
            handleDOMEvents: {
              keydown: (_view, event) => this.handleEditorKeyDown(event)
            }
          }
        })
      ],
      features: {
        linkOnPaste: false
      }
    });
    this.richTextAreaControl = this.registerControl(new FormControl(this.caseField.value || '')) as FormControl;
    this.editorUpdateSubscription = this.editor.update.subscribe(() => {
      this.updateToolbarStateLater();
      this.syncAccessibilityLater();
    });
    this.statusChangesSubscription = this.richTextAreaControl.statusChanges.subscribe(() => this.syncAccessibilityLater());
    this.valueChangesSubscription = this.richTextAreaControl.valueChanges.subscribe((value) => {
      this.normaliseRichTextControlValue(value);
      this.syncAccessibilityLater();
    });
    this.normaliseRichTextControlValue(this.richTextAreaControl.value);
  }

  public ngAfterViewInit(): void {
    this.updateToolbarStateLater();
    this.syncAccessibilityLater();
  }

  public ngOnDestroy(): void {
    if (this.editorUpdateSubscription) {
      this.editorUpdateSubscription.unsubscribe();
    }
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
    }
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
    if (this.editor) {
      this.editor.destroy();
    }
  }

  public labelId(): string {
    return `${this.id()}_label`;
  }

  public hintId(): string {
    return `${this.id()}_hint`;
  }

  public errorId(): string {
    return `${this.id()}_error`;
  }

  public listStyleId(): string {
    return `${this.id()}_list_style`;
  }

  public toolbarLabel(): string {
    return `${this.caseField.label || this.caseField.id} formatting options`;
  }

  public isInvalid(): boolean {
    return !!(this.richTextAreaControl.errors && (this.richTextAreaControl.dirty || this.richTextAreaControl.touched));
  }

  public onEditorFocusOut(): void {
    this.richTextAreaControl.markAsTouched();
    this.syncAccessibilityLater();
  }

  public onToolbarButtonMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  private handleEditorKeyDown(event: KeyboardEvent): boolean {
    const isUnmodifiedEnter = event.key === 'Enter' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey;

    if (isUnmodifiedEnter && this.splitListContinuationParagraph()) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    if (event.key !== 'Tab' || !this.isNodeActive('list_item')) {
      return false;
    }

    this.executeToolbarCommand(event, event.shiftKey ? 'outdent' : 'indent');
    return true;
  }

  private splitListContinuationParagraph(): boolean {
    const { state, dispatch } = this.editor.view;
    const { $from, empty } = state.selection;
    const textBlock = $from.parent;

    if (!empty || !textBlock.isTextblock) {
      return false;
    }

    let isContinuation = false;
    for (let depth = $from.depth - 1; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'list_item') {
        continue;
      }

      isContinuation = depth < $from.depth &&
        $from.node(depth + 1) === textBlock &&
        node.firstChild !== textBlock;
      break;
    }

    if (!isContinuation) {
      return false;
    }

    const textBlockStart = $from.before($from.depth);
    const before = textBlock.type.create(
      textBlock.attrs,
      textBlock.content.cut(0, $from.parentOffset),
      textBlock.marks
    );
    const after = textBlock.type.create(
      textBlock.attrs,
      textBlock.content.cut($from.parentOffset),
      textBlock.marks
    );
    const transaction = state.tr.replaceWith(
      textBlockStart,
      $from.after($from.depth),
      Fragment.fromArray([before, after])
    );
    transaction.setSelection(TextSelection.create(transaction.doc, textBlockStart + before.nodeSize + 1));
    transaction.setStoredMarks(state.storedMarks || $from.marks());
    dispatch(transaction.scrollIntoView());
    return true;
  }

  public executeToolbarCommand(event: Event, command: RichTextToolbarCommand): void {
    event.preventDefault();
    event.stopPropagation();

    switch (command) {
      case 'undo':
        undo(this.editor.view.state, this.editor.view.dispatch);
        break;
      case 'redo':
        redo(this.editor.view.state, this.editor.view.dispatch);
        break;
      case 'bold':
        this.editor.commands.toggleBold().exec();
        break;
      case 'italic':
        this.editor.commands.toggleItalics().exec();
        break;
      case 'underline':
        this.editor.commands.toggleUnderline().exec();
        break;
      case 'paragraph':
        this.toggleParagraph();
        break;
      case 'heading':
        this.toggleHeading();
        break;
      case 'indent':
        this.changeIndent(true);
        break;
      case 'outdent':
        this.changeIndent(false);
        break;
      case 'ordered_list':
        this.toggleOrderedList();
        break;
      case 'bullet_list':
        this.toggleBulletList();
        this.paragraphCommandApplied = false;
        break;
      default:
        break;
    }

    this.richTextAreaControl.markAsDirty();
    this.editor.view.focus();
    this.updateToolbarState();
    this.syncAccessibilityLater();
  }

  public isToolbarCommandActive(command: RichTextToolbarCommand): boolean {
    return !!this.activeToolbarCommands[command];
  }

  public currentListStyle(): RichTextListStyle {
    const activeList = this.activeListNode();
    if (activeList?.type.name === 'ordered_list') {
      const orderedListStyle = activeList.attrs.listStyle || 'decimal';
      if (orderedListStyle === 'lower-alpha') {
        return 'ordered_alpha';
      }
      if (orderedListStyle === 'lower-roman') {
        return 'ordered_roman';
      }
      return 'ordered_list';
    }
    if (activeList?.type.name === 'bullet_list') {
      return 'bullet_list';
    }
    return '';
  }

  public currentListSelectValue(): RichTextListStyle {
    const currentListStyle = this.currentListStyle();
    return currentListStyle === 'bullet_list' ? '' : currentListStyle;
  }

  public isOrderedListActive(): boolean {
    return this.listType(this.currentListStyle()) === 'ordered_list';
  }

  public onListStyleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const listStyle = select.value as RichTextListStyle;
    if (!listStyle) {
      select.value = this.currentListSelectValue();
      return;
    }
    this.applyListStyleSelection(listStyle);

    this.richTextAreaControl.markAsDirty();
    this.editor.view.focus();
    this.updateToolbarState();
    this.syncAccessibilityLater();
  }

  private applyListStyleSelection(listStyle: RichTextListStyle): void {
    const currentListStyle = this.currentListStyle();
    if (listStyle === currentListStyle) {
      if (listStyle === 'ordered_list') {
        this.changeActiveListType('ordered_list', 'decimal');
      }
      return;
    }

    const currentListType = this.listType(currentListStyle);
    const nextListType = this.listType(listStyle);
    if (currentListType && nextListType && currentListType !== nextListType) {
      this.changeActiveListType(nextListType, this.orderedListStyle(listStyle));
    } else if (nextListType === 'ordered_list') {
      if (currentListType !== 'ordered_list') {
        const rebuiltIndentedList = this.rebuildSelectedIndentedBlocksAsList(
          'ordered_list',
          this.orderedListStyle(listStyle)
        );
        if (!rebuiltIndentedList) {
          this.editor.commands.toggleOrderedList().exec();
        }
      }
      this.applyOrderedListStyle(this.orderedListStyle(listStyle));
    } else if (listStyle === 'bullet_list') {
      if (currentListType !== 'bullet_list') {
        this.editor.commands.toggleBulletList().exec();
      }
    } else {
      this.applyParagraph();
      this.paragraphCommandApplied = true;
    }
  }

  private changeActiveListType(
    listType: 'ordered_list' | 'bullet_list',
    orderedListStyle: RichTextOrderedListStyle
  ): void {
    const { state, dispatch } = this.editor.view;
    const { $from } = state.selection;
    const targetType = state.schema.nodes[listType];

    if (this.changeFullySelectedListHierarchy(listType, orderedListStyle)) {
      return;
    }

    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'ordered_list' && node.type.name !== 'bullet_list') {
        continue;
      }

      const transaction = state.tr;
      let nextOrder = 1;
      this.contiguousListPositions(depth, listType).forEach(({ position, list }) => {
        const indent = Number(list.attrs.indent) || null;
        const attrs = listType === 'ordered_list'
          ? {
            order: nextOrder,
            indent,
            listStyle: orderedListStyle === 'decimal' ? null : orderedListStyle
          }
          : {
            indent,
            continuationOrder: Number(list.attrs.order) || null
          };
        transaction.setNodeMarkup(position, targetType, attrs);
        nextOrder += list.childCount;
      });
      dispatch(transaction);
      return;
    }
  }

  private changeFullySelectedListHierarchy(
    listType: 'ordered_list' | 'bullet_list',
    rootStyle: RichTextOrderedListStyle
  ): boolean {
    const { state, dispatch } = this.editor.view;
    const { $from, $to, empty, from, to } = state.selection;
    const targetListType = state.schema.nodes[listType];

    if (empty || !targetListType) {
      return false;
    }

    for (let depth = 1; depth <= $from.depth; depth++) {
      const list = $from.node(depth);
      if (!this.isListNode(list) || $to.depth < depth || $to.node(depth) !== list ||
        $from.index(depth) !== 0 || $to.indexAfter(depth) !== list.childCount) {
        continue;
      }

      const listPosition = $from.before(depth);
      if (!this.selectionCoversListContent(list, listPosition, from, to)) {
        continue;
      }

      const transaction = state.tr;
      const changeListHierarchy = (node: ProseMirrorNode, position: number, listDepth: number): void => {
        const orderedStyle = this.orderedListStyleAtDepth(rootStyle, listDepth);
        const indent = Number(node.attrs.indent) || null;
        const attrs = listType === 'ordered_list'
          ? {
            order: 1,
            indent,
            listStyle: orderedStyle === 'decimal' ? null : orderedStyle
          }
          : {
            indent,
            continuationOrder: Number(node.attrs.order) || null
          };
        transaction.setNodeMarkup(position, targetListType, attrs);

        node.forEach((child, childOffset) => {
          const childPosition = position + 1 + childOffset;
          if (this.isListNode(child)) {
            changeListHierarchy(child, childPosition, listDepth + 1);
            return;
          }

          child.descendants((descendant, descendantOffset) => {
            if (!this.isListNode(descendant)) {
              return true;
            }

            changeListHierarchy(descendant, childPosition + descendantOffset + 1, listDepth + 1);
            return false;
          });
        });
      };

      changeListHierarchy(list, listPosition, 0);
      dispatch(transaction.scrollIntoView());
      return true;
    }

    return false;
  }

  private contiguousListPositions(
    depth: number,
    targetListType: 'ordered_list' | 'bullet_list'
  ): Array<{ position: number; list: ProseMirrorNode }> {
    const { $from } = this.editor.view.state.selection;
    const parentDepth = depth - 1;
    const parent = $from.node(parentDepth);
    const activeList = $from.node(depth);
    const activeIndex = $from.index(parentDepth);
    const includedIndexes = new Set([activeIndex]);

    this.collectContiguousListIndexes(parent, activeList, activeIndex, -1, targetListType, includedIndexes);
    this.collectContiguousListIndexes(parent, activeList, activeIndex, 1, targetListType, includedIndexes);

    const positions = [];
    parent.forEach((child, childOffset, index) => {
      if (includedIndexes.has(index) && this.isList(child)) {
        positions.push({ position: $from.start(parentDepth) + childOffset, list: child });
      }
    });
    return positions;
  }

  private collectContiguousListIndexes(
    parent: ProseMirrorNode,
    activeList: ProseMirrorNode,
    activeIndex: number,
    direction: -1 | 1,
    targetListType: 'ordered_list' | 'bullet_list',
    includedIndexes: Set<number>
  ): void {
    let adjacentList = activeList;
    let crossedContent = false;
    let crossedSectionHeading = false;
    for (let index = activeIndex + direction; index >= 0 && index < parent.childCount; index += direction) {
      const child = parent.child(index);
      if (this.isEmptyParagraph(child)) {
        continue;
      }

      const matchesActiveList = this.hasMatchingListType(child, activeList);
      const isMixedListToRepair = crossedSectionHeading && this.isList(child) &&
        child.type.name !== activeList.type.name && targetListType === activeList.type.name;
      if (matchesActiveList || isMixedListToRepair) {
        const isHeadingSeparatedBulletList = activeList.type.name === 'bullet_list';
        if (matchesActiveList && crossedContent && !isHeadingSeparatedBulletList &&
          !this.isSequentialList(child, adjacentList, direction)) {
          return;
        }
        includedIndexes.add(index);
        adjacentList = child;
        crossedContent = false;
        crossedSectionHeading = false;
        continue;
      }

      if (this.isList(child)) {
        return;
      }
      if (activeList.type.name === 'bullet_list') {
        if (!this.isListSectionHeading(child)) {
          return;
        }
      } else if (!this.hasListContinuation(activeList)) {
        return;
      }
      crossedContent = true;
      crossedSectionHeading = crossedSectionHeading || this.isListSectionHeading(child);
    }
  }

  private isSequentialList(
    candidateList: ProseMirrorNode,
    adjacentList: ProseMirrorNode,
    direction: -1 | 1
  ): boolean {
    const candidateOrder = this.listContinuationOrder(candidateList);
    const adjacentOrder = this.listContinuationOrder(adjacentList);
    if (!candidateOrder || !adjacentOrder) {
      return false;
    }
    return direction === 1
      ? candidateOrder === adjacentOrder + adjacentList.childCount
      : candidateOrder + candidateList.childCount === adjacentOrder;
  }

  private hasListContinuation(list: ProseMirrorNode): boolean {
    return list.type.name === 'ordered_list' || Boolean(list.attrs.continuationOrder);
  }

  private listContinuationOrder(list: ProseMirrorNode): number {
    return Number(list.type.name === 'ordered_list' ? list.attrs.order : list.attrs.continuationOrder) || null;
  }

  private isList(node: ProseMirrorNode): boolean {
    return node.type.name === 'ordered_list' || node.type.name === 'bullet_list';
  }

  private hasMatchingListType(node: ProseMirrorNode, activeList: ProseMirrorNode): boolean {
    if (node.type !== activeList.type) {
      return false;
    }
    return node.type.name !== 'ordered_list' ||
      (node.attrs.listStyle || 'decimal') === (activeList.attrs.listStyle || 'decimal');
  }

  private isEmptyParagraph(node: ProseMirrorNode): boolean {
    return node.type.name === 'paragraph' && !node.textContent.trim();
  }

  private isListSectionHeading(node: ProseMirrorNode): boolean {
    if (!node.textContent.trim()) {
      return false;
    }
    if (node.type.name === 'heading') {
      return true;
    }
    if (node.type.name !== 'paragraph') {
      return false;
    }

    let hasText = false;
    let allTextIsBold = true;
    node.descendants((child) => {
      if (child.isText && child.textContent.trim()) {
        hasText = true;
        allTextIsBold = allTextIsBold && child.marks.some((mark) => mark.type.name === 'strong');
      }
    });
    return hasText && allTextIsBold;
  }

  private toggleBulletList(): void {
    const currentListStyle = this.currentListStyle();
    const currentListType = this.listType(currentListStyle);

    if (currentListType === 'ordered_list') {
      this.changeActiveListType('bullet_list', 'decimal');
      return;
    }

    if (currentListType === 'bullet_list') {
      this.applyParagraph();
      this.paragraphCommandApplied = false;
      return;
    }

    if (!this.rebuildSelectedIndentedBlocksAsList('bullet_list', 'decimal')) {
      this.editor.commands.toggleBulletList().exec();
    }
    this.joinAdjacentLists('bullet_list');
    this.paragraphCommandApplied = false;
  }

  private toggleOrderedList(): void {
    if (this.isOrderedListActive()) {
      const continuation = this.orderedListContinuationAfterSelection();
      this.applyParagraph();
      this.restoreOrderedListContinuation(continuation);
      this.paragraphCommandApplied = false;
      return;
    }

    this.applyListStyleSelection('ordered_list');
    this.joinAdjacentLists('ordered_list');
    this.paragraphCommandApplied = false;
  }

  private orderedListContinuationAfterSelection(): { text: string; order: number; listStyle: string | null } | null {
    const { state } = this.editor.view;
    const { $from, $to } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
      const list = $from.node(depth);
      if (list.type.name !== 'ordered_list') {
        continue;
      }

      const fromIndex = $from.index(depth);
      const toIndex = $to.depth >= depth && $to.node(depth) === list
        ? $to.indexAfter(depth)
        : fromIndex + 1;
      if (toIndex >= list.childCount) {
        return null;
      }

      return {
        text: list.child(toIndex).textContent,
        order: (Number(list.attrs.order) || 1) + fromIndex,
        listStyle: list.attrs.listStyle || null
      };
    }

    return null;
  }

  private restoreOrderedListContinuation(
    continuation: { text: string; order: number; listStyle: string | null } | null
  ): void {
    if (!continuation) {
      return;
    }

    const { state, dispatch } = this.editor.view;
    let listPosition: number | null = null;
    let listNode: ProseMirrorNode | null = null;
    state.doc.descendants((node, position) => {
      if (listPosition !== null || node.type.name !== 'ordered_list' || !node.childCount) {
        return listPosition === null;
      }
      if (node.firstChild.textContent === continuation.text &&
        (node.attrs.listStyle || null) === continuation.listStyle) {
        listPosition = position;
        listNode = node;
        return false;
      }
      return true;
    });

    if (listPosition !== null && listNode && Number(listNode.attrs.order) !== continuation.order) {
      dispatch(state.tr.setNodeMarkup(listPosition, listNode.type, {
        ...listNode.attrs,
        order: continuation.order
      }));
    }
  }

  private joinAdjacentLists(listType: 'ordered_list' | 'bullet_list'): void {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { state, dispatch } = this.editor.view;
      const { $from } = state.selection;
      let joined = false;

      for (let depth = $from.depth; depth > 0; depth--) {
        const activeList = $from.node(depth);
        if (activeList.type.name !== listType) {
          continue;
        }

        const parent = $from.node(depth - 1);
        const index = $from.index(depth - 1);
        const before = index > 0 ? parent.child(index - 1) : null;
        const after = index + 1 < parent.childCount ? parent.child(index + 1) : null;
        const hasSameStyle = (list: ProseMirrorNode | null): boolean => Boolean(list &&
          list.type === activeList.type &&
          (list.attrs.listStyle || null) === (activeList.attrs.listStyle || null));

        if (hasSameStyle(before)) {
          dispatch(state.tr.join($from.before(depth)));
          joined = true;
        } else if (hasSameStyle(after)) {
          dispatch(state.tr.join($from.after(depth)));
          joined = true;
        }
        break;
      }

      if (!joined) {
        return;
      }
    }
  }

  private listType(listStyle: RichTextListStyle): '' | 'ordered_list' | 'bullet_list' {
    if (listStyle === 'bullet_list') {
      return 'bullet_list';
    }
    return listStyle ? 'ordered_list' : '';
  }

  private orderedListStyle(listStyle: RichTextListStyle): RichTextOrderedListStyle {
    if (listStyle === 'ordered_alpha') {
      return 'lower-alpha';
    }
    if (listStyle === 'ordered_roman') {
      return 'lower-roman';
    }
    return 'decimal';
  }

  private activeListNode(): ProseMirrorNode | null {
    const { $from } = this.editor.view.state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'list_item') {
        continue;
      }

      const list = $from.node(depth - 1);
      if (!this.isList(list)) {
        return null;
      }

      // A lifted nested item remains inside its parent list item to retain its
      // indentation, but only the first block owns that parent's list marker.
      return depth < $from.depth && node.firstChild === $from.node(depth + 1) ? list : null;
    }
    return null;
  }

  private applyOrderedListStyle(listStyle: RichTextOrderedListStyle): void {
    const { state, dispatch } = this.editor.view;
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'ordered_list') {
        continue;
      }

      dispatch(state.tr.setNodeMarkup($from.before(depth), node.type, {
        ...node.attrs,
        listStyle: listStyle === 'decimal' ? null : listStyle
      }));
      return;
    }
  }

  public onPaste(event: ClipboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }
    this.handleEditorPaste(event);
  }

  public handleEditorPaste(event: ClipboardEvent): boolean {
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain');
    if (!html && !text) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    if (html) {
      this.editor.commands.insertHTML(this.normalisePastedHtml(html)).exec();
    } else {
      this.editor.commands.insertText(this.normalisePlainTextValue(text)).exec();
    }
    this.richTextAreaControl.markAsDirty();
    this.normaliseRichTextControlValue(this.richTextAreaControl.value);
    this.syncAccessibilityLater();
    return true;
  }

  public onEditorKeyDown(event: KeyboardEvent): void {
    const isUnmodifiedEnter = event.key === 'Enter' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey;

    if (!isUnmodifiedEnter) {
      return;
    }

    const markNames = [
      this.activeToolbarCommands.bold ? 'strong' : null,
      this.activeToolbarCommands.italic ? 'em' : null,
      this.activeToolbarCommands.underline ? 'u' : null
    ].filter((markName) => !!markName);

    if (markNames.length === 0) {
      return;
    }

    const state = this.editor.view.state;
    const marks = markNames
      .map((markName) => state.schema.marks[markName])
      .filter((markType) => !!markType)
      .map((markType) => markType.create());

    this.editor.view.dispatch(state.tr.setStoredMarks(marks));
    this.updateToolbarState();
    this.syncAccessibilityLater();
  }

  public normalisePastedHtml(html: string): string {
    const documentElement = new DOMParser().parseFromString(html, 'text/html');
    removeUnsafeRichTextElements(documentElement);
    this.normaliseWordStylesheetFormatting(documentElement);
    this.normaliseOrderedListStyles(documentElement);
    this.removeWordNoise(documentElement);
    this.normaliseWordSpacing(documentElement);
    this.normaliseWordTables(documentElement);
    this.normaliseWordSemanticBlocks(documentElement);
    this.convertWordLists(documentElement);
    this.normaliseNestedListStructure(documentElement);
    this.normaliseSupportedInlineFormatting(documentElement);
    this.normaliseBlockFormatting(documentElement);
    this.normalisePastedListSpacing(documentElement);
    this.removeUnsupportedMarkup(documentElement);
    this.normaliseDateRangeSpacing(documentElement);
    this.removeUnsupportedAttributes(documentElement);
    return this.normalisePlainTextValue(sanitiseRichTextDocument(documentElement));
  }

  public normaliseRichTextValue(value: string): string {
    if (!value) {
      return value;
    }

    const documentElement = new DOMParser().parseFromString(value, 'text/html');
    removeUnsafeRichTextElements(documentElement);
    this.normaliseWordStylesheetFormatting(documentElement);
    this.normaliseOrderedListStyles(documentElement);
    this.normaliseWordSpacing(documentElement);
    this.normaliseWordTables(documentElement);
    this.normaliseWordSemanticBlocks(documentElement);
    this.normaliseSupportedInlineFormatting(documentElement);
    this.normaliseBlockFormatting(documentElement);
    this.removeUnsupportedMarkup(documentElement);
    this.normaliseDateRangeSpacing(documentElement);
    this.removeUnsupportedAttributes(documentElement);
    return this.normalisePlainTextValue(sanitiseRichTextDocument(documentElement));
  }

  public syncAccessibilityLater(): void {
    setTimeout(() => this.syncAccessibilityState());
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    super.addValidators(caseField, control);

    const existingValidator = control.validator;
    const validators: ValidatorFn[] = [this.unsafeHtmlTextValidator()];
    if (caseField.display_context === Constants.MANDATORY) {
      validators.unshift(this.richTextRequiredValidator());
    }
    if (existingValidator) {
      validators.push(existingValidator);
    }
    control.setValidators(validators);
  }

  private syncAccessibilityState(): void {
    const editorElement = this.getEditableElement();
    if (!editorElement) {
      return;
    }

    editorElement.id = this.id();
    editorElement.setAttribute('role', 'textbox');
    editorElement.setAttribute('aria-multiline', 'true');
    editorElement.setAttribute('aria-labelledby', this.labelId());
    editorElement.setAttribute('aria-required', `${this.caseField.display_context === Constants.MANDATORY}`);
    editorElement.setAttribute('aria-invalid', `${this.isInvalid()}`);

    const describedBy = this.describedBy();
    if (describedBy) {
      editorElement.setAttribute('aria-describedby', describedBy);
    } else {
      editorElement.removeAttribute('aria-describedby');
    }

    this.syncToolbarAccessibility();
  }

  private describedBy(): string {
    const ids = [];
    if (this.caseField.hint_text) {
      ids.push(this.hintId());
    }
    if (this.isInvalid()) {
      ids.push(this.errorId());
    }
    return ids.join(' ');
  }

  private syncToolbarAccessibility(): void {
    if (!this.editorHost) {
      return;
    }

    const shortcutLabels = {
      Undo: 'Control+Z',
      Redo: 'Control+Y',
      Bold: 'Control+B',
      Italic: 'Control+I',
      Underline: 'Control+U'
    };
    const toggleCommands: Record<string, RichTextToolbarCommand> = {
      Bold: 'bold',
      Italic: 'italic',
      Underline: 'underline',
      Paragraph: 'paragraph',
      'Heading level 1': 'heading',
      'Bullet List': 'bullet_list',
      'Numbered List': 'ordered_list'
    };
    const buttons = this.editorHost.nativeElement.querySelectorAll('button');

    buttons.forEach((button: HTMLButtonElement) => {
      const label = button.getAttribute('aria-label') || button.title;
      if (shortcutLabels[label]) {
        button.setAttribute('aria-keyshortcuts', shortcutLabels[label]);
      }
      if (toggleCommands[label]) {
        const isActive = label === 'Numbered List'
          ? this.isOrderedListActive()
          : this.isToolbarCommandActive(toggleCommands[label]);
        button.setAttribute('aria-pressed', `${isActive}`);
      }
    });
  }

  private getEditableElement(): HTMLElement {
    if (!this.editorHost) {
      return null;
    }
    return this.editorHost.nativeElement.querySelector('.ProseMirror');
  }

  private normaliseRichTextControlValue(value: string): void {
    if (this.isNormalisingValue) {
      return;
    }

    const normalisedValue = this.normaliseRichTextValue(value);
    if (normalisedValue === value) {
      return;
    }

    this.isNormalisingValue = true;
    try {
      this.richTextAreaControl.setValue(normalisedValue, { emitEvent: false });
      this.editor.setContent(normalisedValue || '');
    } finally {
      this.isNormalisingValue = false;
    }
  }

  private richTextRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const textValue = this.htmlToText(control.value);
      return textValue.length === 0 ? { required: {} } : null;
    };
  }

  private unsafeHtmlTextValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const visibleText = this.htmlToText(control.value);
      return containsUnsafeRichTextMarkup(visibleText) ? { unsafeRichText: {} } : null;
    };
  }

  private htmlToText(value: string): string {
    const container = document.createElement('div');
    container.innerHTML = value || '';
    return (container.textContent || '').replaceAll('\u00a0', ' ').trim();
  }

  private isWordHtml(html: string): boolean {
    return /(class="?Mso|mso-|urn:schemas-microsoft-com:office:word|xmlns:o)/i.test(html);
  }

  private removeWordNoise(documentElement: Document): void {
    const noiseElements = documentElement.querySelectorAll('style, meta, link, xml');
    noiseElements.forEach((element) => element.remove());

    const officeParagraphs = Array.prototype.slice.call(documentElement.getElementsByTagName('o:p'));
    officeParagraphs.forEach((element: HTMLElement) => element.remove());
  }

  private normaliseWordStylesheetFormatting(documentElement: Document): void {
    const styleElements = Array.prototype.slice.call(documentElement.querySelectorAll('style')) as HTMLStyleElement[];

    styleElements.forEach((styleElement) => {
      const stylesheet = (styleElement.textContent || '').replace(/<!--|-->/g, '');
      const rules = this.stylesheetRules(stylesheet);

      rules.forEach(([selectors, declarations]) => {
        const hasBoldStyle = this.hasBoldStyle(declarations);
        const headingLevel = this.wordOutlineLevel(declarations);
        const orderedListType = this.orderedListTypeFromStyle(declarations);
        if (!hasBoldStyle && !headingLevel && !orderedListType) {
          return;
        }

        selectors.split(',').forEach((selector) => {
          const normalisedSelector = selector.trim();
          if (!normalisedSelector || normalisedSelector.startsWith('@')) {
            return;
          }

          try {
            const matchingElements = documentElement.body.querySelectorAll(normalisedSelector);
            matchingElements.forEach((element: HTMLElement) => {
              if (orderedListType && element.tagName.toLowerCase() === 'ol') {
                element.setAttribute('type', orderedListType);
              }
              if (headingLevel) {
                element.dataset.wordHeadingLevel = headingLevel.toString();
              }
              if (hasBoldStyle) {
                this.wrapBoldInlineContents(documentElement, element);
              }
            });
          } catch {
            // Ignore Microsoft Office selectors that are not valid browser CSS selectors.
          }
        });
      });
    });
  }

  private normaliseOrderedListStyles(documentElement: Document): void {
    const orderedLists = documentElement.body.querySelectorAll('ol');

    orderedLists.forEach((list: HTMLOListElement) => {
      const listType = this.orderedListTypeFromStyle(list.getAttribute('style') || '');
      if (listType) {
        list.setAttribute('type', listType);
      }
    });
  }

  private orderedListTypeFromStyle(style: string): string | null {
    const listStyle = (this.cssStyleValue(style, 'list-style-type') || '').toLowerCase();
    const wordListStyle = (this.cssStyleValue(style, 'mso-level-number-format') || '').toLowerCase();

    if (listStyle === 'lower-alpha' || listStyle === 'lower-latin' || wordListStyle === 'alpha-lower') {
      return 'a';
    }
    if (listStyle === 'lower-roman' || wordListStyle === 'roman-lower') {
      return 'i';
    }
    return null;
  }

  private stylesheetRules(stylesheet: string): Array<[string, string]> {
    const rules: Array<[string, string]> = [];
    let searchFrom = 0;
    let openingBrace = stylesheet.indexOf('{', searchFrom);

    while (openingBrace !== -1) {
      const closingBrace = stylesheet.indexOf('}', openingBrace + 1);
      if (closingBrace === -1) {
        break;
      }

      rules.push([
        stylesheet.slice(searchFrom, openingBrace),
        stylesheet.slice(openingBrace + 1, closingBrace)
      ]);
      searchFrom = closingBrace + 1;
      openingBrace = stylesheet.indexOf('{', searchFrom);
    }

    return rules;
  }

  private normaliseWordSpacing(documentElement: Document): void {
    const spacerElements = Array.prototype.slice.call(documentElement.body.querySelectorAll('[style*="mso-spacerun"]')) as HTMLElement[];

    spacerElements.forEach((spacerElement) => {
      const spacingLength = Math.max(4, (spacerElement.textContent || '').length);
      spacerElement.textContent = '\u00a0'.repeat(spacingLength);
    });

    const paragraphs = Array.prototype.slice.call(documentElement.body.querySelectorAll('p')) as HTMLElement[];
    paragraphs.forEach((paragraph) => {
      const visibleText = (paragraph.textContent || '').replace(/[\u200b-\u200d\ufeff\u00a0]/g, ' ').trim();
      if (!visibleText) {
        paragraph.textContent = '';
      }
    });
  }

  private normaliseWordTables(documentElement: Document): void {
    const tables = Array.prototype.slice.call(documentElement.body.querySelectorAll('table')) as HTMLElement[];

    tables.forEach((table) => {
      if (!table.parentNode) {
        return;
      }

      const rows = Array.prototype.slice.call(table.querySelectorAll('tr')) as HTMLElement[];
      rows.forEach((row) => {
        const cells = Array.prototype.slice.call(row.children)
          .filter((child: HTMLElement) => /^(td|th)$/i.test(child.tagName) && !!(child.textContent || '').trim()) as HTMLElement[];
        if (cells.length === 0) {
          return;
        }

        const paragraph = documentElement.createElement('p');
        cells.forEach((cell, index) => {
          if (index > 0) {
            paragraph.appendChild(documentElement.createTextNode('\u00a0'.repeat(WORD_COLUMN_SPACING)));
          }
          this.appendWordTableCellContents(documentElement, cell, paragraph);
        });
        table.parentNode.insertBefore(paragraph, table);
      });

      table.remove();
    });
  }

  private appendWordTableCellContents(documentElement: Document, cell: HTMLElement, paragraph: HTMLElement): void {
    const childNodes = Array.prototype.slice.call(cell.childNodes) as Node[];

    childNodes.forEach((childNode, index) => {
      if (childNode instanceof HTMLElement && /^(div|p)$/i.test(childNode.tagName)) {
        if (index > 0 && paragraph.lastChild) {
          paragraph.appendChild(documentElement.createElement('br'));
        }
        const inlineContainer = documentElement.createElement('span');
        const style = childNode.getAttribute('style');
        if (style) {
          inlineContainer.setAttribute('style', style);
        }
        while (childNode.firstChild) {
          inlineContainer.appendChild(childNode.firstChild);
        }
        paragraph.appendChild(inlineContainer);
        return;
      }

      paragraph.appendChild(childNode);
    });
  }

  private normaliseWordSemanticBlocks(documentElement: Document): void {
    const blocks = Array.prototype.slice.call(
      documentElement.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6')
    ) as HTMLElement[];

    blocks.forEach((block) => {
      const namedHeadingLevel = this.namedWordHeadingLevel(block);
      const existingHeadingLevel = /^h([1-6])$/i.exec(block.tagName)?.[1];
      if (existingHeadingLevel) {
        const heading = existingHeadingLevel === '1'
          ? block
          : this.replaceElementTag(documentElement, block, 'h1');
        if (namedHeadingLevel) {
          this.removeRedundantHeadingBold(heading);
        }
        return;
      }

      const headingLevel = this.wordHeadingLevel(block);
      if (headingLevel) {
        const heading = this.replaceElementTag(documentElement, block, 'h1');
        if (namedHeadingLevel) {
          this.removeRedundantHeadingBold(heading);
        }
      }
    });
  }

  private removeRedundantHeadingBold(heading: HTMLElement): void {
    const boldElements = Array.prototype.slice.call(heading.querySelectorAll('strong, b')) as HTMLElement[];
    boldElements.reverse().forEach((element) => this.unwrapElement(element));
  }

  private wordHeadingLevel(element: HTMLElement): number {
    const namedHeadingLevel = this.namedWordHeadingLevel(element);
    if (namedHeadingLevel) {
      return namedHeadingLevel;
    }
    if (/MsoTitle/i.test(element.className || '')) {
      return 1;
    }

    const styledElements = [element].concat(Array.prototype.slice.call(element.querySelectorAll('[style]')) as HTMLElement[]);
    const largestFontSize = styledElements.reduce((largestSize, styledElement) => {
      const fontSize = this.cssLengthToPixels(this.cssStyleLength(styledElement.getAttribute('style') || '', 'font-size'));
      return Math.max(largestSize, fontSize);
    }, 0);
    return largestFontSize >= 24 ? 1 : null;
  }

  private namedWordHeadingLevel(element: HTMLElement): number {
    const styledElements = [element].concat(Array.prototype.slice.call(element.querySelectorAll('*')) as HTMLElement[]);
    for (const styledElement of styledElements) {
      const storedHeadingLevel = Number(styledElement.dataset.wordHeadingLevel);
      if (storedHeadingLevel >= 1 && storedHeadingLevel <= 6) {
        return storedHeadingLevel;
      }

      const className = styledElement.className || '';
      const style = styledElement.getAttribute('style') || '';
      const headingDescription = `${className} ${style}`;
      const namedHeadingLevel = /(?:Mso)?Heading\s*([1-6])(?:Char)?/i.exec(headingDescription);
      if (namedHeadingLevel) {
        return Number(namedHeadingLevel[1]);
      }
      if (/heading/i.test(headingDescription)) {
        return 1;
      }

      const outlineLevel = this.wordOutlineLevel(style);
      if (outlineLevel) {
        return outlineLevel;
      }
    }

    return null;
  }

  private wordOutlineLevel(style: string): number {
    const outlineLevel = /mso-outline-level\s*:\s*([1-6])/i.exec(style || '');
    return outlineLevel ? Number(outlineLevel[1]) : null;
  }

  private replaceElementTag(documentElement: Document, element: HTMLElement, tagName: string): HTMLElement {
    const replacement = documentElement.createElement(tagName);
    Array.prototype.slice.call(element.attributes).forEach((attribute: Attr) => {
      replacement.setAttribute(attribute.name, attribute.value);
    });
    while (element.firstChild) {
      replacement.appendChild(element.firstChild);
    }
    element.parentNode.replaceChild(replacement, element);
    return replacement;
  }

  private removeUnsupportedMarkup(documentElement: Document): void {
    const links = documentElement.querySelectorAll('a');
    links.forEach((link) => this.unwrapElement(link));

    const images = documentElement.querySelectorAll('img');
    images.forEach((image) => image.remove());

    const inlineContainers = documentElement.querySelectorAll('span, font');
    inlineContainers.forEach((element) => this.unwrapElement(element));
  }

  private normaliseDateRangeSpacing(documentElement: Document): void {
    const boldElements = Array.prototype.slice.call(documentElement.body.querySelectorAll('strong, b')) as HTMLElement[];
    const dateRangePattern = /(?:19|20)(?:\d{2}|XX)\s*[\u2013\u2014-]\s*(?:19|20)(?:\d{2}|XX)\s*$/i;

    boldElements.forEach((boldElement) => {
      if (!boldElement.parentNode || boldElement.parentElement.closest('strong, b')) {
        return;
      }

      const block = boldElement.closest('p, li, h1, h2, h3, h4, h5, h6');
      if (!block) {
        return;
      }

      const range = documentElement.createRange();
      range.setStart(block, 0);
      range.setEndBefore(boldElement);
      const precedingText = range.cloneContents().textContent || '';
      const comparableText = precedingText.replace(/[\u200b-\u200d\ufeff]/g, '');
      if (dateRangePattern.test(comparableText)) {
        const existingSpacing = this.trailingCharacterCount(precedingText, '\u00a0');
        const spacingToAdd = Math.max(0, WORD_COLUMN_SPACING - existingSpacing);
        if (spacingToAdd > 0) {
          boldElement.parentNode.insertBefore(documentElement.createTextNode('\u00a0'.repeat(spacingToAdd)), boldElement);
        }
      }
    });
  }

  private removeUnsupportedAttributes(documentElement: Document): void {
    const elements = documentElement.body.querySelectorAll('*');

    elements.forEach((element: HTMLElement) => {
      const dataIndent = this.normaliseDataIndent(element.dataset.indent);
      const align = this.normaliseAlign(element.getAttribute('align'));
      const listStart = element.tagName.toLowerCase() === 'ol'
        ? this.normaliseListStart(element.getAttribute('start'))
        : null;
      const listType = element.tagName.toLowerCase() === 'ol' && /^[ai]$/.test(element.getAttribute('type') || '')
        ? element.getAttribute('type')
        : null;

      while (element.attributes.length > 0) {
        element.removeAttribute(element.attributes[0].name);
      }

      if (dataIndent) {
        element.dataset.indent = dataIndent;
      }
      if (align) {
        element.setAttribute('align', align);
      }
      if (listStart) {
        element.setAttribute('start', listStart);
      }
      if (listType) {
        element.setAttribute('type', listType);
      }
    });
  }

  private normaliseListStart(value: string): string {
    if (!/^\d{1,6}$/.test(value || '')) {
      return null;
    }

    const listStart = Number(value);
    return listStart > 1 ? listStart.toString() : null;
  }

  private normaliseSupportedInlineFormatting(documentElement: Document): void {
    const elements = documentElement.body.querySelectorAll('*');

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const style = htmlElement.getAttribute('style') || '';
      if (!style || this.isWordLayoutContainer(htmlElement)) {
        return;
      }

      if (this.hasBoldStyle(style)) {
        this.wrapBoldInlineContents(documentElement, htmlElement);
      }
      if (this.hasItalicStyle(style)) {
        this.wrapInlineContents(documentElement, htmlElement, 'em');
      }
      if (this.hasUnderlineStyle(style)) {
        this.wrapInlineContents(documentElement, htmlElement, 'u');
      }
    });
  }

  private isWordLayoutContainer(element: HTMLElement): boolean {
    return /^(col|colgroup|table|tbody|td|tfoot|th|thead|tr)$/i.test(element.tagName);
  }

  private normaliseBlockFormatting(documentElement: Document): void {
    const blockElements = Array.prototype.slice.call(documentElement.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote'));

    blockElements.forEach((element: HTMLElement, index: number) => {
      const style = element.getAttribute('style') || '';
      const existingIndent = this.normaliseDataIndent(element.dataset.indent);
      const styleIndent = this.indentLevelFromStyle(style);
      const tabIndent = this.indentLevelFromWordTab(element);
      const indent = this.maximumIndent(existingIndent, styleIndent, tabIndent);
      const align = this.normaliseAlign(element.getAttribute('align')) || this.normaliseAlign(this.cssStyleValue(style, 'text-align'));

      if (/text-transform\s*:\s*uppercase/i.test(style)) {
        this.transformTextNodes(element, (value) => value.toUpperCase());
      }
      if (this.hasVisibleBottomBorder(style)) {
        const hasText = !!(element.textContent || '').replace(/[\u200b-\u200d\ufeff\u00a0]/g, ' ').trim();
        const heading = hasText ? element : this.previousTextBlock(blockElements, index);
        if (heading) {
          this.wrapInlineContents(documentElement, heading, 'strong');
        }
        const horizontalRule = documentElement.createElement('hr');
        element.parentNode.insertBefore(horizontalRule, hasText ? element.nextSibling : element);
        if (!hasText) {
          element.remove();
          return;
        }
      }
      if (indent) {
        element.dataset.indent = indent;
        this.removeLeadingIndentWhitespace(element);
      }
      if (align) {
        element.setAttribute('align', align);
      }
    });
  }

  private normalisePastedListSpacing(documentElement: Document): void {
    const listItems = Array.prototype.slice.call(documentElement.body.querySelectorAll('li')) as HTMLElement[];

    listItems.forEach((listItem) => {
      const paragraphs = Array.prototype.slice.call(listItem.querySelectorAll('p')) as HTMLElement[];
      paragraphs.forEach((paragraph) => {
        delete paragraph.dataset.indent;
        this.removeLeadingIndentWhitespace(paragraph);
      });
      this.removeLeadingIndentWhitespace(listItem);
    });
  }

  private transformTextNodes(element: HTMLElement, transform: (value: string) => string): void {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (textNode) {
      textNode.textContent = transform(textNode.textContent || '');
      textNode = walker.nextNode();
    }
  }

  private hasVisibleBottomBorder(style: string): boolean {
    const border = this.cssStyleValue(style, 'border-bottom') || this.cssStyleValue(style, 'mso-border-bottom-alt');
    return !!border && !/^(?:none|0(?:px|pt)?)(?:\s|$)/i.test(border) && !/transparent/i.test(border);
  }

  private previousTextBlock(blockElements: HTMLElement[], index: number): HTMLElement {
    for (let blockIndex = index - 1; blockIndex >= 0; blockIndex--) {
      const block = blockElements[blockIndex];
      if (block.parentNode && (block.textContent || '').replace(/[\u200b-\u200d\ufeff\u00a0]/g, ' ').trim()) {
        return block;
      }
    }
    return null;
  }

  private hasBoldStyle(style: string): boolean {
    const fontWeightMatch = /(?:mso-bidi-)?font-weight\s*:\s*([^;]+)/i.exec(style);
    if (!fontWeightMatch) {
      return /(?:^|;)\s*font\s*:[^;]*\bbold\b/i.test(style);
    }

    const fontWeight = fontWeightMatch[1].trim().toLowerCase();
    return fontWeight === 'bold' || fontWeight === 'bolder' || Number(fontWeight) >= 600;
  }

  private hasNormalFontWeight(element: HTMLElement): boolean {
    const fontWeight = this.cssStyleValue(element.getAttribute('style') || '', 'font-weight');
    if (!fontWeight) {
      return false;
    }

    const normalisedWeight = fontWeight.toLowerCase();
    return normalisedWeight === 'normal' || Number(normalisedWeight) < 600;
  }

  private wrapBoldInlineContents(documentElement: Document, element: HTMLElement): void {
    const walker = documentElement.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes: Node[] = [];
    let textNode = walker.nextNode();

    while (textNode) {
      textNodes.push(textNode);
      textNode = walker.nextNode();
    }

    textNodes.forEach((node) => {
      if (!node.parentNode || this.hasFormattingBoundary(node, element)) {
        return;
      }

      const wrapper = documentElement.createElement('strong');
      node.parentNode.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    });
  }

  private hasFormattingBoundary(node: Node, root: HTMLElement): boolean {
    let parent = node.parentElement;

    while (parent && parent !== root) {
      if (this.hasNormalFontWeight(parent) || this.isBlockNode(parent) || /^(b|strong)$/i.test(parent.tagName)) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  private hasItalicStyle(style: string): boolean {
    return /(?:mso-bidi-)?font-style\s*:\s*italic/i.test(style);
  }

  private hasUnderlineStyle(style: string): boolean {
    return /text-decoration(?:-line)?[^;]*underline/i.test(style);
  }

  private wrapInlineContents(documentElement: Document, element: HTMLElement, tagName: string): void {
    let wrapper: HTMLElement = null;
    let childNode = element.firstChild;

    while (childNode) {
      const nextChildNode = childNode.nextSibling;

      if (this.isBlockNode(childNode)) {
        wrapper = null;
      } else if (childNode.nodeType === Node.TEXT_NODE || childNode instanceof HTMLElement) {
        if (!wrapper) {
          wrapper = documentElement.createElement(tagName);
          (childNode as ChildNode).before(wrapper);
        }
        wrapper.appendChild(childNode);
      }

      childNode = nextChildNode;
    }
  }

  private isBlockNode(node: Node): boolean {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    return BLOCK_NODE_NAMES.has(node.tagName.toLowerCase());
  }

  private indentLevelFromStyle(style: string): string {
    if (!style) {
      return null;
    }

    const indentLength = Math.max(
      this.cssLengthToPixels(this.cssStyleLength(style, 'margin-left')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'margin-inline-start')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'mso-para-margin-left')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'mso-margin-left-alt')),
      this.cssLengthToPixels(this.cssMarginLeftLength(style)),
      this.cssLengthToPixels(this.cssStyleLength(style, 'text-indent'))
    );

    if (indentLength < 20) {
      return null;
    }

    return `${Math.min(6, Math.max(1, Math.round(indentLength / 40)))}`;
  }

  private cssStyleLength(style: string, property: string): string {
    const value = this.cssStyleValue(style, property);
    return this.parseCssLength(value) ? value : null;
  }

  private cssMarginLeftLength(style: string): string {
    const margin = /(?:^|;)\s*margin\s*:\s*([^;]+)/i.exec(style);
    if (!margin) {
      return null;
    }

    const marginValues = margin[1].trim().split(/\s+/);
    return marginValues[3] || marginValues[1] || marginValues[0] || null;
  }

  private cssLengthToPixels(value: string): number {
    if (!value) {
      return 0;
    }

    const parsedLength = this.parseCssLength(value);
    if (!parsedLength) {
      return 0;
    }

    const { amount, unit } = parsedLength;
    if (amount <= 0) {
      return 0;
    }

    switch (unit) {
      case 'pt':
        return amount * (96 / 72);
      case 'in':
        return amount * 96;
      case 'cm':
        return amount * (96 / 2.54);
      case 'mm':
        return amount * (96 / 25.4);
      case 'em':
      case 'rem':
        return amount * 16;
      case 'px':
      default:
        return amount;
    }
  }

  private parseCssLength(value: string): { amount: number; unit: string } {
    if (!value) {
      return null;
    }

    const normalisedValue = value.trim().toLowerCase();
    const unit = CSS_LENGTH_UNITS.find((candidate) => normalisedValue.endsWith(candidate)) || 'px';
    const numericValue = unit === 'px' && !normalisedValue.endsWith('px')
      ? normalisedValue
      : normalisedValue.slice(0, -unit.length).trim();

    if (!this.isCssDecimal(numericValue)) {
      return null;
    }

    return { amount: Number(numericValue), unit };
  }

  private isCssDecimal(value: string): boolean {
    let digitCount = 0;
    let decimalPointSeen = false;

    for (let index = value.startsWith('-') ? 1 : 0; index < value.length; index++) {
      const character = value[index];
      if (character === '.') {
        if (decimalPointSeen || index === value.length - 1) {
          return false;
        }
        decimalPointSeen = true;
      } else if (character >= '0' && character <= '9') {
        digitCount++;
      } else {
        return false;
      }
    }

    return digitCount > 0;
  }

  private indentLevelFromWordTab(element: HTMLElement): string {
    const tabElements = Array.prototype.slice.call(element.querySelectorAll('[style*="mso-tab-count"]')) as HTMLElement[];
    let tabIndent = 0;

    tabElements.forEach((tabElement) => {
      const tabCountMatch = /mso-tab-count\s*:\s*(\d+)/i.exec(tabElement.getAttribute('style') || '');
      const tabCount = tabCountMatch ? Number(tabCountMatch[1]) : 1;
      if (this.isLeadingWordTab(element, tabElement)) {
        tabIndent = Math.max(tabIndent, tabCount);
        tabElement.remove();
      } else {
        tabElement.textContent = '\u00a0'.repeat(tabCount * 4);
      }
    });

    if (tabIndent > 0) {
      return this.normaliseDataIndent(`${tabIndent}`);
    }

    const textNode = this.firstTextNode(element);
    if (!textNode?.textContent) {
      return null;
    }

    const leadingTabs = /^\t+/.exec(textNode.textContent);
    if (leadingTabs) {
      return this.normaliseDataIndent(`${leadingTabs[0].length}`);
    }

    const leadingSpaces = /^[\u00a0 ]{4,}/.exec(textNode.textContent);
    return leadingSpaces ? this.normaliseDataIndent(`${Math.round(leadingSpaces[0].length / 4)}`) : null;
  }

  private isLeadingWordTab(block: HTMLElement, tabElement: HTMLElement): boolean {
    const range = block.ownerDocument.createRange();
    range.setStart(block, 0);
    range.setEndBefore(tabElement);
    const precedingText = (range.cloneContents().textContent || '').replace(/[\u200b-\u200d\ufeff\u00a0]/g, ' ').trim();
    return precedingText.length === 0;
  }

  private maximumIndent(...indentValues: string[]): string {
    const indents = indentValues
      .map((indent) => Number(this.normaliseDataIndent(indent)))
      .filter((indent) => indent > 0);

    return indents.length ? `${Math.max.apply(null, indents)}` : null;
  }

  private normaliseDataIndent(value: string): string {
    if (!value || !/^\d+$/.test(value)) {
      return null;
    }

    const indentValue = Number(value);
    if (indentValue <= 0) {
      return null;
    }

    const indent = Math.min(6, indentValue);
    return `${indent}`;
  }

  private normaliseAlign(value: string): string {
    if (!value || !/^(center|right|justify)$/i.test(value)) {
      return null;
    }

    return value.toLowerCase();
  }

  private cssStyleValue(style: string, property: string): string {
    const normalisedProperty = property.trim().toLowerCase();

    for (const declaration of style.split(';')) {
      const separatorIndex = declaration.indexOf(':');
      if (separatorIndex < 0) {
        continue;
      }

      const declarationProperty = declaration.slice(0, separatorIndex).trim().toLowerCase();
      if (declarationProperty === normalisedProperty) {
        return declaration.slice(separatorIndex + 1).trim() || null;
      }
    }

    return null;
  }

  private removeLeadingIndentWhitespace(element: HTMLElement): void {
    while (element.firstChild && this.isLeadingIndentNode(element.firstChild)) {
      (element.firstChild as ChildNode).remove();
    }

    const textNode = this.firstTextNode(element);
    if (textNode?.textContent) {
      textNode.textContent = textNode.textContent.replace(/^[\s\u00a0]+/, '');
    }
  }

  private isLeadingIndentNode(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      return /^[\s\u00a0]*$/.test(node.textContent || '');
    }
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    const style = node.getAttribute('style') || '';
    return /mso-tab-count/i.test(style) && !((node.textContent || '').replace(/[\t\u00a0 ]/g, '').trim());
  }

  private normalisePlainTextValue(value: string): string {
    if (!value) {
      return value;
    }

    return value
      .replace(/!?\[([^\]]{0,500})\]\(([^)]{0,500})\)/g, (_match: string, text: string, url: string) => text || url)
      .replace(/!?\[((?:[^[\]\\]|\\.){0,500})\]\s*\[[^\]]{0,100}\]/g, '$1');
  }

  private unwrapElement(element: Element): void {
    const parentNode = element.parentNode;
    if (!parentNode) {
      return;
    }

    while (element.firstChild) {
      parentNode.insertBefore(element.firstChild, element);
    }
    element.remove();
  }

  private convertWordLists(documentElement: Document): void {
    const childNodes = Array.prototype.slice.call(documentElement.body.querySelectorAll('p'));
    const wordListIndents = this.wordListIndents(childNodes);
    const orderedListTypes = this.wordOrderedListTypes(childNodes);
    const state: WordListConversionState = {
      listStack: [],
      listParents: [],
      resetListLevels: new Map<string, number>(),
      previousListId: null
    };

    childNodes.forEach((node: Node) => {
      this.convertWordListParagraph(documentElement, node, wordListIndents, orderedListTypes, state);
    });
  }

  private convertWordListParagraph(documentElement: Document, node: Node, wordListIndents: number[],
    orderedListTypes: Map<string, string>, state: WordListConversionState): void {
    if (!this.isWordListParagraph(node)) {
      this.resetWordListConversionState(state);
      return;
    }

    const paragraph = node as HTMLElement;
    const listType = this.wordListType(paragraph);
    const orderedListType = listType === 'ol' ? orderedListTypes.get(this.wordListLevelKey(paragraph)) || null : null;
    const listId = this.wordListId(paragraph);
    const requestedLevel = this.wordListRequestedLevel(paragraph, listId, wordListIndents, state);
    const level = Math.min(requestedLevel, state.listStack.length + 1);
    const currentList = this.wordListForParagraph(documentElement, paragraph, listType, orderedListType, level, state);
    const listItem = documentElement.createElement('li');

    this.copyListItemContents(documentElement, paragraph, listItem);
    currentList.appendChild(listItem);
    paragraph.remove();
    state.previousListId = listId;
  }

  private resetWordListConversionState(state: WordListConversionState): void {
    state.listStack.length = 0;
    state.listParents.length = 0;
    state.resetListLevels.clear();
    state.previousListId = null;
  }

  private wordListRequestedLevel(paragraph: HTMLElement, listId: string, wordListIndents: number[],
    state: WordListConversionState): number {
    const declaredLevel = this.wordListDeclaredLevel(paragraph);
    let requestedLevel = this.wordListLevel(paragraph, wordListIndents);
    const rememberedResetLevel = declaredLevel === 1 ? state.resetListLevels.get(listId) : null;

    if (rememberedResetLevel) {
      return Math.max(requestedLevel, rememberedResetLevel);
    }
    if (declaredLevel === 1 && listId !== state.previousListId && state.listStack.length > 1 && requestedLevel === state.listStack.length) {
      requestedLevel++;
      state.resetListLevels.set(listId, requestedLevel);
    } else if (declaredLevel === 1 && listId) {
      state.resetListLevels.set(listId, requestedLevel);
    }

    return requestedLevel;
  }

  private wordListForParagraph(documentElement: Document, paragraph: HTMLElement, listType: string,
    orderedListType: string, level: number, state: WordListConversionState): HTMLElement {
    const stackIndex = level - 1;
    const parentListItem = stackIndex > 0 ? state.listStack[stackIndex - 1]?.lastElementChild : null;
    const listParent = parentListItem || paragraph.parentNode;
    let currentList = state.listStack[stackIndex];

    if (currentList?.tagName.toLowerCase() !== listType || currentList?.getAttribute('type') !== orderedListType ||
      state.listParents[stackIndex] !== listParent) {
      currentList = this.createWordList(documentElement, paragraph, listType, orderedListType, parentListItem);
      state.listStack[stackIndex] = currentList;
      state.listParents[stackIndex] = listParent;
    }

    state.listStack.length = level;
    state.listParents.length = level;
    return currentList;
  }

  private createWordList(documentElement: Document, paragraph: HTMLElement, listType: string,
    orderedListType: string, parentListItem: Element): HTMLElement {
    const list = documentElement.createElement(listType);
    const listStart = this.wordListStart(paragraph);

    if (listType === 'ol' && listStart > 1) {
      list.setAttribute('start', listStart.toString());
    }
    if (orderedListType) {
      list.setAttribute('type', orderedListType);
    }
    if (parentListItem) {
      parentListItem.appendChild(list);
    } else {
      paragraph.parentNode.insertBefore(list, paragraph);
    }

    return list;
  }

  private normaliseNestedListStructure(documentElement: Document): void {
    const orphanedNestedLists = Array.prototype.slice.call(
      documentElement.body.querySelectorAll('ol > ol, ol > ul, ul > ol, ul > ul')
    ) as HTMLElement[];

    orphanedNestedLists.forEach((nestedList) => {
      const previousListItem = nestedList.previousElementSibling;
      if (previousListItem?.tagName.toLowerCase() === 'li') {
        previousListItem.appendChild(nestedList);
      }
    });
  }

  private isWordListParagraph(node: Node): boolean {
    if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() !== 'p') {
      return false;
    }

    return /MsoListParagraph/i.test(node.className) || /mso-list/i.test(node.getAttribute('style') || '');
  }

  private wordListType(paragraph: HTMLElement): string {
    return /^\(?(?:\d+|[a-z]+)[.)]/i.test(this.wordListMarker(paragraph)) ? 'ol' : 'ul';
  }

  private wordOrderedListTypes(nodes: Node[]): Map<string, string> {
    const markersByLevel = new Map<string, string[]>();

    nodes.filter((node) => this.isWordListParagraph(node)).forEach((node: HTMLElement) => {
      const marker = this.wordListMarker(node);
      if (!/^\(?(?:\d+|[a-z]+)[.)]/i.test(marker)) {
        return;
      }

      const key = this.wordListLevelKey(node);
      markersByLevel.set(key, [...(markersByLevel.get(key) || []), marker]);
    });

    const listTypes = new Map<string, string>();
    markersByLevel.forEach((markers, key) => {
      const markerPattern = /^\(?([a-z]+|\d+)[.)]/i;
      const markerTokens = markers.map((marker) => markerPattern.exec(marker)?.[1]?.toLowerCase());
      if (markers.some((marker) => /^\([ivxlcdm]+\)/i.test(marker)) ||
        markerTokens.some((token) => token?.length > 1 && /^[ivxlcdm]+$/.test(token))) {
        listTypes.set(key, 'i');
      } else if (markerTokens.every((token) => /^[a-z]$/.test(token || ''))) {
        listTypes.set(key, 'a');
      }
    });

    return listTypes;
  }

  private wordListLevelKey(paragraph: HTMLElement): string {
    return `${this.wordListId(paragraph) || ''}:${this.wordListDeclaredLevel(paragraph)}`;
  }

  private wordListMarker(paragraph: HTMLElement): string {
    const markerElement = Array.prototype.slice.call(paragraph.querySelectorAll('[style]'))
      .find((element: HTMLElement) => /mso-list:\s*Ignore/i.test(element.getAttribute('style') || ''));
    return (markerElement ? markerElement.textContent : paragraph.textContent).trim();
  }

  private wordListLevel(paragraph: HTMLElement, wordListIndents: number[]): number {
    const declaredLevel = this.wordListDeclaredLevel(paragraph);
    const indent = this.wordListIndent(paragraph);
    const visualLevel = wordListIndents.indexOf(indent) + 1;

    return Math.max(declaredLevel, visualLevel || 1);
  }

  private wordListDeclaredLevel(paragraph: HTMLElement): number {
    const match = (paragraph.getAttribute('style') || '').match(/mso-list:[^;]*\blevel(\d+)/i);
    return match ? Math.max(1, Number(match[1])) : 1;
  }

  private wordListId(paragraph: HTMLElement): string {
    const match = (paragraph.getAttribute('style') || '').match(/mso-list:\s*([^;\s]+)/i);
    return match ? match[1] : null;
  }

  private wordListIndents(nodes: Node[]): number[] {
    const indents = nodes
      .filter((node) => this.isWordListParagraph(node))
      .map((node: HTMLElement) => this.wordListIndent(node));

    return Array.from(new Set(indents)).sort((left, right) => left - right);
  }

  private wordListIndent(paragraph: HTMLElement): number {
    const style = paragraph.getAttribute('style') || '';
    const indent = Math.max(
      this.cssLengthToPixels(this.cssStyleLength(style, 'margin-left')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'margin-inline-start')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'mso-para-margin-left')),
      this.cssLengthToPixels(this.cssStyleLength(style, 'mso-margin-left-alt')),
      this.cssLengthToPixels(this.cssMarginLeftLength(style))
    );

    return Math.round(indent);
  }

  private wordListStart(paragraph: HTMLElement): number {
    const match = /^(\d+)[.)]/.exec(this.wordListMarker(paragraph));

    return match ? Number(match[1]) : 1;
  }

  private copyListItemContents(documentElement: Document, paragraph: HTMLElement, listItem: HTMLElement): void {
    Array.prototype.slice.call(paragraph.childNodes).forEach((childNode: Node) => {
      if (this.isWordListMarker(childNode)) {
        return;
      }

      const clonedNode = childNode.cloneNode(true);
      this.removeNestedWordListMarkers(clonedNode);
      if (clonedNode instanceof HTMLElement && !clonedNode.textContent?.trim() && !clonedNode.querySelector('br')) {
        return;
      }
      listItem.appendChild(clonedNode);
    });

    this.removeLeadingListMarker(listItem);
    this.trimListItemWhitespace(listItem);
  }

  private isWordListMarker(node: Node): boolean {
    if (node.nodeType === Node.COMMENT_NODE) {
      return true;
    }
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    return /mso-list:\s*Ignore/i.test(node.getAttribute('style') || '');
  }

  private removeNestedWordListMarkers(node: Node): void {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    Array.prototype.slice.call(node.querySelectorAll('[style]'))
      .filter((element: HTMLElement) => /mso-list:\s*Ignore/i.test(element.getAttribute('style') || ''))
      .forEach((element: HTMLElement) => element.remove());
  }

  private removeLeadingListMarker(listItem: HTMLElement): void {
    const textNode = this.firstTextNode(listItem);
    if (!textNode?.textContent) {
      return;
    }

    textNode.textContent = textNode.textContent.replace(/^\s*(?:[\u2022\u00b7o-]|\d+\.|[a-z]\.|[ivxlcdm]+\.)\s*/i, '');
  }

  private firstTextNode(node: Node): Text {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }

    for (const childNode of Array.from(node.childNodes)) {
      const textNode = this.firstTextNode(childNode);
      if (textNode) {
        return textNode;
      }
    }

    return null;
  }

  private updateToolbarState(): void {
    if (!this.editor?.view) {
      return;
    }

    const activeListType = this.activeListNode()?.type.name;
    this.activeToolbarCommands = {
      bold: this.isMarkActive('strong'),
      italic: this.isMarkActive('em'),
      underline: this.isMarkActive('u'),
      paragraph: this.paragraphCommandApplied && this.isPlainParagraphActive(),
      heading: this.isHeadingOneActive(),
      ordered_list: activeListType === 'ordered_list',
      bullet_list: activeListType === 'bullet_list'
    };
  }

  private updateToolbarStateLater(): void {
    setTimeout(() => this.updateToolbarState());
  }

  private isMarkActive(markName: string): boolean {
    const state = this.editor.view.state;
    const markType = state.schema.marks[markName];
    if (!markType) {
      return false;
    }

    const { empty, from, to, $from } = state.selection;
    if (empty) {
      return !!markType.isInSet(state.storedMarks || $from.marks());
    }

    return state.doc.rangeHasMark(from, to, markType);
  }

  private applyParagraph(): void {
    const { state, dispatch } = this.editor.view;
    const paragraphType = state.schema.nodes.paragraph;
    const listItemType = state.schema.nodes.list_item;

    if (!paragraphType) {
      return;
    }

    if (this.flattenSelectedNestedListItems()) {
      return;
    }

    if (this.flattenFullySelectedList()) {
      return;
    }

    if (listItemType && this.isNodeActive('list_item')) {
      liftListItem(listItemType)(state, dispatch);
    }

    setBlockType(paragraphType)(this.editor.view.state, this.editor.view.dispatch);
  }

  private flattenSelectedNestedListItems(): boolean {
    const { state, dispatch } = this.editor.view;
    const { $from, $to } = state.selection;
    const paragraphType = state.schema.nodes.paragraph;

    if (!paragraphType) {
      return false;
    }

    for (let depth = $from.depth; depth > 1; depth--) {
      const list = $from.node(depth);
      if (!this.isListNode(list) || $from.node(depth - 1).type.name !== 'list_item' ||
        $to.depth < depth || $to.node(depth) !== list) {
        continue;
      }

      const fromIndex = $from.index(depth);
      const toIndex = $to.indexAfter(depth);
      const replacement: ProseMirrorNode[] = [];
      const beforeItems = this.listItemsBetween(list, 0, fromIndex);
      const afterItems = this.listItemsBetween(list, toIndex, list.childCount);
      const sourceTextBlock = state.selection.empty && $from.parent.isTextblock ? $from.parent : null;
      const sourceCaretOffset = $from.parentOffset;
      const replacementStart = $from.before(depth);
      let caretPosition: number | null = null;

      if (beforeItems.length) {
        replacement.push(list.copy(Fragment.fromArray(beforeItems)));
      }

      const paragraphIndent = Number(list.attrs.indent) || 0;
      this.listItemsBetween(list, fromIndex, toIndex).forEach((listItem) => {
        listItem.forEach((child) => {
          if (child.isTextblock) {
            const indent = Math.min(MAX_INDENT, paragraphIndent + (Number(child.attrs.indent) || 0));
            const paragraph = paragraphType.create({
              ...child.attrs,
              indent: indent || null
            }, child.content);
            if (child === sourceTextBlock) {
              const precedingSize = replacement.reduce((size, node) => size + node.nodeSize, 0);
              caretPosition = replacementStart + precedingSize + 1 +
                Math.min(sourceCaretOffset, paragraph.content.size);
            }
            replacement.push(paragraph);
          } else if (this.isListNode(child)) {
            replacement.push(child);
          }
        });
      });

      if (afterItems.length) {
        const afterListAttrs = list.type.name === 'ordered_list'
          ? { ...list.attrs, order: (Number(list.attrs.order) || 1) + toIndex }
          : { ...list.attrs };
        replacement.push(list.type.create(afterListAttrs, Fragment.fromArray(afterItems)));
      }

      const transaction = state.tr.replaceWith(
        replacementStart,
        $from.after(depth),
        Fragment.fromArray(replacement)
      );
      if (caretPosition !== null) {
        transaction.setSelection(TextSelection.create(transaction.doc, caretPosition));
      }
      dispatch(transaction.scrollIntoView());
      return true;
    }

    return false;
  }

  private listItemsBetween(list: ProseMirrorNode, fromIndex: number, toIndex: number): ProseMirrorNode[] {
    const items: ProseMirrorNode[] = [];
    for (let index = fromIndex; index < toIndex; index++) {
      items.push(list.child(index));
    }
    return items;
  }

  private flattenFullySelectedList(): boolean {
    const { state, dispatch } = this.editor.view;
    const { $from, $to, empty } = state.selection;
    const paragraphType = state.schema.nodes.paragraph;

    if (empty || !paragraphType) {
      return false;
    }

    for (let depth = 1; depth <= $from.depth; depth++) {
      const list = $from.node(depth);
      if (!this.isListNode(list) || $to.depth < depth || $to.node(depth) !== list) {
        continue;
      }

      const selectionStartsInFirstItem = $from.index(depth) === 0;
      const selectionEndsInLastItem = $to.indexAfter(depth) === list.childCount;
      const selectionCoversListContent = this.selectionCoversListContent(
        list,
        $from.before(depth),
        state.selection.from,
        state.selection.to
      );
      if (!selectionStartsInFirstItem || !selectionEndsInLastItem ||
        !selectionCoversListContent) {
        continue;
      }

      const paragraphs = this.flattenListToParagraphs(list, 0);
      const transaction = state.tr.replaceWith(
        $from.before(depth),
        $from.after(depth),
        Fragment.fromArray(paragraphs)
      );
      dispatch(transaction.scrollIntoView());
      return true;
    }

    return false;
  }

  private selectionCoversListContent(list: ProseMirrorNode, listPosition: number, from: number, to: number): boolean {
    let firstTextBlockStart: number | null = null;
    let lastTextBlockEnd: number | null = null;

    list.descendants((node, position) => {
      if (!node.isTextblock) {
        return true;
      }

      const textBlockStart = listPosition + position + 2;
      firstTextBlockStart ??= textBlockStart;
      lastTextBlockEnd = textBlockStart + node.content.size;
      return false;
    });

    return firstTextBlockStart !== null && lastTextBlockEnd !== null &&
      from <= firstTextBlockStart && to >= lastTextBlockEnd;
  }

  private flattenListToParagraphs(list: ProseMirrorNode, nestingIndent: number): ProseMirrorNode[] {
    const paragraphType = this.editor.view.state.schema.nodes.paragraph;
    const listIndent = Number(list.attrs.indent) || 0;
    const itemIndent = Math.min(MAX_INDENT, nestingIndent + listIndent);
    const paragraphs: ProseMirrorNode[] = [];

    list.forEach((listItem) => {
      listItem.forEach((child) => {
        if (this.isListNode(child)) {
          paragraphs.push(...this.flattenListToParagraphs(child, itemIndent + 1));
          return;
        }

        if (child.isTextblock) {
          const existingIndent = Number(child.attrs.indent) || 0;
          const indent = Math.min(MAX_INDENT, itemIndent + existingIndent);
          paragraphs.push(paragraphType.create({
            ...child.attrs,
            indent: indent || null
          }, child.content));
        }
      });
    });

    return paragraphs;
  }

  private rebuildSelectedIndentedBlocksAsList(
    listType: 'ordered_list' | 'bullet_list',
    orderedListStyle: RichTextOrderedListStyle
  ): boolean {
    const { state, dispatch } = this.editor.view;
    const { from, to } = state.selection;
    const selectedBlocks: IndentedListBlock[] = [];

    state.doc.forEach((node, position, index) => {
      if (!node.isTextblock) {
        return;
      }

      const contentStart = position + 1;
      const contentEnd = contentStart + node.content.size;
      if (from <= contentEnd && to >= contentStart) {
        selectedBlocks.push({
          node,
          position,
          index,
          indent: Number(node.attrs.indent) || 0
        });
      }
    });

    if (selectedBlocks.length === 1 && selectedBlocks[0].indent > 0) {
      const block = selectedBlocks[0];
      const { schema } = state;
      const listItemType = schema.nodes.list_item;
      const listNodeType = schema.nodes[listType];
      const textBlock = block.node.type.create({
        ...block.node.attrs,
        indent: null
      }, block.node.content, block.node.marks);
      const orderedStyle = this.orderedListStyleAtDepth(orderedListStyle, 0);
      const attrs = listType === 'ordered_list'
        ? {
          order: 1,
          indent: block.indent,
          listStyle: orderedStyle === 'decimal' ? null : orderedStyle
        }
        : {
          indent: block.indent,
          continuationOrder: null
        };
      const list = listNodeType.create(attrs, listItemType.create(null, textBlock));
      const transaction = state.tr.replaceWith(block.position, block.position + block.node.nodeSize, list);

      transaction.setSelection(TextSelection.create(transaction.doc, from + 2, to + 2));
      dispatch(transaction.scrollIntoView());
      return true;
    }

    if (selectedBlocks.length < 2 ||
      selectedBlocks[selectedBlocks.length - 1].index - selectedBlocks[0].index + 1 !== selectedBlocks.length) {
      return false;
    }

    const firstBlock = selectedBlocks[0];
    const lastBlock = selectedBlocks[selectedBlocks.length - 1];
    const selectionCoversBlocks = from <= firstBlock.position + 1 &&
      to >= lastBlock.position + 1 + lastBlock.node.content.size;
    const baseIndent = Math.min(...selectedBlocks.map((block) => block.indent));
    const normalisedBlocks = selectedBlocks.map((block) => ({
      ...block,
      indent: Math.max(0, block.indent - baseIndent)
    }));

    if (!selectionCoversBlocks || (baseIndent === 0 && !normalisedBlocks.some((block) => block.indent > 0))) {
      return false;
    }

    const rebuilt = this.buildNestedList(normalisedBlocks, 0, 0, listType, orderedListStyle);
    if (rebuilt.nextIndex !== normalisedBlocks.length) {
      return false;
    }

    const rootList = baseIndent > 0
      ? rebuilt.list.type.create({ ...rebuilt.list.attrs, indent: baseIndent }, rebuilt.list.content)
      : rebuilt.list;

    const transaction = state.tr.replaceWith(
      firstBlock.position,
      lastBlock.position + lastBlock.node.nodeSize,
      rootList
    );
    dispatch(transaction.scrollIntoView());
    return true;
  }

  private buildNestedList(
    blocks: IndentedListBlock[],
    startIndex: number,
    depth: number,
    listType: 'ordered_list' | 'bullet_list',
    rootOrderedListStyle: RichTextOrderedListStyle
  ): NestedListBuildResult {
    const { schema } = this.editor.view.state;
    const listItemType = schema.nodes.list_item;
    const listNodeType = schema.nodes[listType];
    const listItems: ProseMirrorNode[] = [];
    let index = startIndex;

    while (index < blocks.length) {
      const block = blocks[index];
      if (block.indent < depth) {
        break;
      }

      if (block.indent > depth && listItems.length) {
        const nested = this.buildNestedList(blocks, index, depth + 1, listType, rootOrderedListStyle);
        const parentItem = listItems[listItems.length - 1];
        listItems[listItems.length - 1] = parentItem.copy(
          parentItem.content.append(Fragment.from(nested.list))
        );
        index = nested.nextIndex;
        continue;
      }

      const textBlock = block.node.type.create({
        ...block.node.attrs,
        indent: null
      }, block.node.content, block.node.marks);
      listItems.push(listItemType.create(null, textBlock));
      index++;
    }

    const orderedStyle = this.orderedListStyleAtDepth(rootOrderedListStyle, depth);
    const attrs = listType === 'ordered_list'
      ? {
        order: 1,
        indent: null,
        listStyle: orderedStyle === 'decimal' ? null : orderedStyle
      }
      : {
        indent: null,
        continuationOrder: null
      };

    return {
      list: listNodeType.create(attrs, Fragment.fromArray(listItems)),
      nextIndex: index
    };
  }

  private orderedListStyleAtDepth(
    rootStyle: RichTextOrderedListStyle,
    depth: number
  ): RichTextOrderedListStyle {
    let listStyle = rootStyle;
    for (let currentDepth = 0; currentDepth < depth; currentDepth++) {
      listStyle = this.nextNestedOrderedListStyle(listStyle);
    }
    return listStyle;
  }

  private isListNode(node: ProseMirrorNode): boolean {
    return node.type.name === 'ordered_list' || node.type.name === 'bullet_list';
  }

  private changeIndent(increase: boolean): void {
    const { state, dispatch } = this.editor.view;
    const listItemType = state.schema.nodes.list_item;

    if (listItemType && this.isNodeActive('list_item')) {
      if (!increase && this.changeListIndent(false, state, dispatch)) {
        return;
      }

      const listCommand = increase ? sinkListItem(listItemType) : liftListItem(listItemType);
      if (listCommand(state, dispatch)) {
        this.applyOrderedListStyleForCurrentDepth();
        return;
      }

      if (increase && this.changeListIndent(true, state, dispatch)) {
        return;
      }
    }

    if (increase) {
      this.editor.commands.indent().exec();
    } else {
      this.editor.commands.outdent().exec();
    }
  }

  private applyOrderedListStyleForCurrentDepth(): void {
    const { state, dispatch } = this.editor.view;
    const { $from } = state.selection;
    const orderedListDepths: number[] = [];
    let activeOrderedListDepth: number | null = null;

    for (let depth = 1; depth <= $from.depth; depth++) {
      if ($from.node(depth).type.name === 'ordered_list') {
        orderedListDepths.push(depth);
        activeOrderedListDepth = depth;
      }
    }

    if (activeOrderedListDepth === null || orderedListDepths.length < 2) {
      return;
    }

    const activeList = $from.node(activeOrderedListDepth);
    const parentListDepth = orderedListDepths[orderedListDepths.length - 2];
    const parentListStyle = $from.node(parentListDepth).attrs.listStyle || 'decimal';
    const listStyle = this.nextNestedOrderedListStyle(parentListStyle);

    dispatch(state.tr.setNodeMarkup($from.before(activeOrderedListDepth), activeList.type, {
      ...activeList.attrs,
      listStyle: listStyle === 'decimal' ? null : listStyle
    }));
  }

  private nextNestedOrderedListStyle(parentListStyle: RichTextOrderedListStyle): RichTextOrderedListStyle {
    if (parentListStyle === 'decimal') {
      return 'lower-alpha';
    }
    return 'lower-roman';
  }

  private changeListIndent(increase: boolean, state: EditorState, dispatch: Editor['view']['dispatch']): boolean {
    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'ordered_list' && node.type.name !== 'bullet_list') {
        continue;
      }

      const currentIndent = Number(node.attrs.indent) || 0;
      const nextIndent = Math.min(MAX_INDENT, Math.max(0, currentIndent + (increase ? 1 : -1)));
      if (nextIndent === currentIndent) {
        return false;
      }

      dispatch(state.tr.setNodeMarkup($from.before(depth), node.type, {
        ...node.attrs,
        indent: nextIndent || null
      }));
      return true;
    }

    return false;
  }

  private toggleParagraph(): void {
    if (this.paragraphCommandApplied && this.isPlainParagraphActive()) {
      this.paragraphCommandApplied = false;
      return;
    }

    this.applyParagraph();
    this.paragraphCommandApplied = true;
  }

  private toggleHeading(): void {
    if (this.isHeadingOneActive()) {
      const paragraphType = this.editor.view.state.schema.nodes.paragraph;
      if (paragraphType) {
        setBlockType(paragraphType)(this.editor.view.state, this.editor.view.dispatch);
      }
      this.paragraphCommandApplied = false;
      return;
    }

    const headingType = this.editor.view.state.schema.nodes.heading;
    if (headingType) {
      setBlockType(headingType, { level: 1 })(this.editor.view.state, this.editor.view.dispatch);
    }
    this.paragraphCommandApplied = false;
  }

  private isHeadingOneActive(): boolean {
    const state = this.editor.view.state;
    const headingType = state.schema.nodes.heading;
    if (!headingType) {
      return false;
    }

    const { $from, from, to } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type === headingType && node.attrs.level === 1) {
        return true;
      }
    }

    let isActive = false;
    state.doc.nodesBetween(from, to, (node) => {
      if (node.type === headingType && node.attrs.level === 1) {
        isActive = true;
        return false;
      }
      return true;
    });
    return isActive;
  }

  private isPlainParagraphActive(): boolean {
    return this.isNodeActive('paragraph') &&
      !this.isNodeActive('list_item') &&
      !this.isNodeActive('ordered_list') &&
      !this.isNodeActive('bullet_list');
  }

  private isNodeActive(nodeName: string): boolean {
    const state = this.editor.view.state;
    const nodeType = state.schema.nodes[nodeName];
    if (!nodeType) {
      return false;
    }

    const { $from, from, to } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type === nodeType) {
        return true;
      }
    }

    let isActive = false;
    state.doc.nodesBetween(from, to, (node) => {
      if (node.type === nodeType) {
        isActive = true;
        return false;
      }
      return true;
    });

    return isActive;
  }

  private lastTextNode(node: Node): Text {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }

    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const textNode = this.lastTextNode(node.childNodes[i]);
      if (textNode) {
        return textNode;
      }
    }

    return null;
  }

  private trimListItemWhitespace(listItem: HTMLElement): void {
    let firstChild = listItem.firstChild;
    while (firstChild?.nodeType === Node.TEXT_NODE && !firstChild.textContent?.trim()) {
      (firstChild as ChildNode).remove();
      firstChild = listItem.firstChild;
    }

    let lastChild = listItem.lastChild;
    while (lastChild?.nodeType === Node.TEXT_NODE && !lastChild.textContent?.trim()) {
      (lastChild as ChildNode).remove();
      lastChild = listItem.lastChild;
    }

    const firstTextNode = this.firstTextNode(listItem);
    if (firstTextNode?.textContent) {
      firstTextNode.textContent = firstTextNode.textContent.trimStart();
    }

    const lastTextNode = this.lastTextNode(listItem);
    if (lastTextNode?.textContent) {
      lastTextNode.textContent = lastTextNode.textContent.trimEnd();
    }
  }

  private trailingCharacterCount(value: string, character: string): number {
    let index = value.length - 1;
    while (index >= 0 && value[index] === character) {
      index--;
    }
    return value.length - index - 1;
  }
}

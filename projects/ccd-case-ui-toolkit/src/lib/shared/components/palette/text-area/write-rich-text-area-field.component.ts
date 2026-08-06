import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Editor } from 'ngx-editor';
import { setBlockType } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { liftListItem } from 'prosemirror-schema-list';
import { Plugin } from 'prosemirror-state';
import { Subscription } from 'rxjs';
import { Constants } from '../../../commons/constants';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { containsUnsafeRichTextMarkup, removeUnsafeRichTextElements, sanitiseRichTextDocument } from './rich-text-sanitizer';

type RichTextToolbarCommand = 'undo' | 'redo' | 'bold' | 'italic' | 'underline' | 'paragraph' | 'indent' | 'outdent' | 'ordered_list' | 'bullet_list';

const WORD_COLUMN_SPACING = 12;
const CSS_LENGTH_UNITS = ['rem', 'px', 'pt', 'in', 'cm', 'mm', 'em'];
const BLOCK_NODE_NAMES = new Set([
  'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'
]);

@Component({
  selector: 'ccd-write-text-area-field',
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
      plugins: [
        new Plugin({
          props: {
            handlePaste: (_view, event) => this.handleEditorPaste(event)
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
      case 'indent':
        this.editor.commands.indent().exec();
        break;
      case 'outdent':
        this.editor.commands.outdent().exec();
        break;
      case 'ordered_list':
        this.editor.commands.toggleOrderedList().exec();
        this.paragraphCommandApplied = false;
        break;
      case 'bullet_list':
        this.editor.commands.toggleBulletList().exec();
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
    this.removeWordNoise(documentElement);
    this.normaliseWordSpacing(documentElement);
    this.normaliseWordTables(documentElement);
    this.normaliseWordSemanticBlocks(documentElement);
    this.convertWordLists(documentElement);
    this.normaliseSupportedInlineFormatting(documentElement);
    this.normaliseBlockFormatting(documentElement);
    this.removeUnsupportedMarkup(documentElement);
    this.normaliseDateRangeSpacing(documentElement);
    this.collapseRepeatedEmptyParagraphs(documentElement);
    this.removeUnsupportedAttributes(documentElement);
    return this.normalisePlainTextValue(sanitiseRichTextDocument(documentElement));
  }

  public normaliseRichTextValue(value: string): string {
    if (!value) {
      return value;
    }

    const documentElement = new DOMParser().parseFromString(value, 'text/html');
    removeUnsafeRichTextElements(documentElement);
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
    const toggleLabels = new Set(['Bold', 'Italic', 'Underline', 'Paragraph', 'Ordered List', 'Bullet List']);
    const buttons = this.editorHost.nativeElement.querySelectorAll('button');

    buttons.forEach((button: HTMLButtonElement) => {
      const label = button.getAttribute('aria-label') || button.title;
      if (shortcutLabels[label]) {
        button.setAttribute('aria-keyshortcuts', shortcutLabels[label]);
      }
      if (toggleLabels.has(label)) {
        button.setAttribute('aria-pressed', `${button.classList.contains('ccd-rich-text-area__toolbar-button--active')}`);
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

  private normaliseWordSpacing(documentElement: Document): void {
    const spacerElements = Array.prototype.slice.call(documentElement.body.querySelectorAll('[style*="mso-spacerun"]')) as HTMLElement[];

    spacerElements.forEach((spacerElement) => {
      const spacingLength = Math.max(4, (spacerElement.textContent || '').length);
      spacerElement.textContent = '\u00a0'.repeat(spacingLength);
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
    const paragraphs = Array.prototype.slice.call(documentElement.body.querySelectorAll('p')) as HTMLElement[];

    paragraphs.forEach((paragraph) => {
      const headingLevel = this.wordHeadingLevel(paragraph);
      if (headingLevel) {
        this.replaceElementTag(documentElement, paragraph, `h${headingLevel}`);
      }
    });
  }

  private wordHeadingLevel(element: HTMLElement): number {
    const headingClass = /MsoHeading([1-6])/i.exec(element.className || '');
    if (headingClass) {
      return Number(headingClass[1]);
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

  private collapseRepeatedEmptyParagraphs(documentElement: Document): void {
    const paragraphs = Array.prototype.slice.call(documentElement.body.querySelectorAll('p')) as HTMLElement[];
    let previousParagraphWasEmpty = false;

    paragraphs.forEach((paragraph) => {
      const isEmpty = !(paragraph.textContent || '').replace(/[\u200b-\u200d\ufeff\u00a0]/g, ' ').trim();
      if (!isEmpty) {
        previousParagraphWasEmpty = false;
        return;
      }

      if (previousParagraphWasEmpty) {
        paragraph.remove();
        return;
      }
      previousParagraphWasEmpty = true;
    });
  }

  private hasBoldStyle(style: string): boolean {
    const fontWeightMatch = /(?:mso-bidi-)?font-weight\s*:\s*([^;]+)/i.exec(style);
    if (!fontWeightMatch) {
      return false;
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
    let lastChild = element.lastChild;
    while (lastChild?.nodeType === Node.TEXT_NODE && /^[\s\u00a0]*$/.test(lastChild.textContent || '')) {
      (lastChild as ChildNode).remove();
      lastChild = element.lastChild;
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
    let currentList: HTMLElement = null;
    let currentListParent: Node = null;

    childNodes.forEach((node: Node) => {
      if (!this.isWordListParagraph(node)) {
        currentList = null;
        currentListParent = null;
        return;
      }

      const paragraph = node as HTMLElement;
      const listType = this.wordListType(paragraph);
      const listItem = documentElement.createElement('li');
      this.copyListItemContents(documentElement, paragraph, listItem);

      if (currentList?.tagName.toLowerCase() !== listType || currentListParent !== paragraph.parentNode) {
        currentList = documentElement.createElement(listType);
        const listStart = this.wordListStart(paragraph);
        if (listType === 'ol' && listStart > 1) {
          currentList.setAttribute('start', listStart.toString());
        }
        paragraph.parentNode.insertBefore(currentList, paragraph);
        currentListParent = paragraph.parentNode;
      }

      currentList.appendChild(listItem);
      paragraph.remove();
    });
  }

  private isWordListParagraph(node: Node): boolean {
    if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() !== 'p') {
      return false;
    }

    return /MsoListParagraph/i.test(node.className) || /mso-list/i.test(node.getAttribute('style') || '');
  }

  private wordListType(paragraph: HTMLElement): string {
    const marker = paragraph.textContent.trim();
    return /^(\d+|[a-z]|[ivxlcdm]+)[.)]/i.test(marker) ? 'ol' : 'ul';
  }

  private wordListStart(paragraph: HTMLElement): number {
    const markerElement = Array.prototype.slice.call(paragraph.querySelectorAll('[style]'))
      .find((element: HTMLElement) => /mso-list:\s*Ignore/i.test(element.getAttribute('style') || ''));
    const marker = (markerElement ? markerElement.textContent : paragraph.textContent).trim();
    const match = marker.match(/^(\d+)[.)]/);

    return match ? Number(match[1]) : 1;
  }

  private copyListItemContents(documentElement: Document, paragraph: HTMLElement, listItem: HTMLElement): void {
    Array.prototype.slice.call(paragraph.childNodes).forEach((childNode: Node) => {
      if (this.isWordListMarker(childNode)) {
        return;
      }
      listItem.appendChild(childNode.cloneNode(true));
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

    this.activeToolbarCommands = {
      bold: this.isMarkActive('strong'),
      italic: this.isMarkActive('em'),
      underline: this.isMarkActive('u'),
      paragraph: this.paragraphCommandApplied && this.isPlainParagraphActive(),
      ordered_list: this.isNodeActive('ordered_list'),
      bullet_list: this.isNodeActive('bullet_list')
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

    if (listItemType && this.isNodeActive('list_item')) {
      liftListItem(listItemType)(state, dispatch);
    }

    setBlockType(paragraphType)(this.editor.view.state, this.editor.view.dispatch);
  }

  private toggleParagraph(): void {
    if (this.paragraphCommandApplied && this.isPlainParagraphActive()) {
      this.paragraphCommandApplied = false;
      return;
    }

    this.applyParagraph();
    this.paragraphCommandApplied = true;
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

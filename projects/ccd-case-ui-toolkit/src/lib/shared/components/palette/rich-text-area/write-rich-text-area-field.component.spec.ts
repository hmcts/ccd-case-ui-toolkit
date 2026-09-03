import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgxEditorComponent } from 'ngx-editor';
import { TextSelection } from 'prosemirror-state';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { WriteRichTextAreaFieldComponent } from './write-rich-text-area-field.component';

const FIELD_ID = 'OrderPreamble';
const FIELD_TYPE: FieldType = {
  id: 'RichTextArea',
  type: 'RichTextArea'
};
const VALUE = '<p><strong>Initial value</strong></p>';

@Pipe({
  name: 'ccdFirstError',
  standalone: false
})
class MockFirstErrorPipe implements PipeTransform {
  transform(value: ValidationErrors, label?: string): string {
    return value.required ? `${label} is required` : 'Invalid value';
  }
}

describe('WriteRichTextAreaFieldComponent', () => {
  let fixture: ComponentFixture<WriteRichTextAreaFieldComponent>;
  let component: WriteRichTextAreaFieldComponent;
  let formGroup: FormGroup;

  const clickToolbarButton = (label: string): void => {
    const button = fixture.nativeElement.querySelector(`button[aria-label="${label}"]`);
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
  };

  const selectListStyle = (listStyle: string): void => {
    const select = fixture.nativeElement.querySelector(`#${component.listStyleId()}`) as HTMLSelectElement;
    select.value = listStyle;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const selectEditorText = (text: string): void => {
    let textPosition = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (node.isText && node.text && node.text.indexOf(text) !== -1) {
        textPosition = position + node.text.indexOf(text);
        return false;
      }
      return true;
    });

    component.editor.view.dispatch(
      component.editor.view.state.tr.setSelection(TextSelection.create(
        component.editor.view.state.doc,
        textPosition,
        textPosition + text.length
      ))
    );
  };

  const selectEditorTextRange = (fromText: string, toText: string): void => {
    let fromPosition = null;
    let toPosition = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (!node.isText || !node.text) {
        return true;
      }
      if (fromPosition === null && node.text.includes(fromText)) {
        fromPosition = position + node.text.indexOf(fromText);
      }
      if (node.text.includes(toText)) {
        toPosition = position + node.text.indexOf(toText) + toText.length;
      }
      return true;
    });

    component.editor.view.dispatch(
      component.editor.view.state.tr.setSelection(TextSelection.create(
        component.editor.view.state.doc,
        fromPosition,
        toPosition
      ))
    );
  };

  const expectTextToHaveAncestorTags = (html: string, text: string, tagNames: string[]): void => {
    const container = document.createElement('div');
    container.innerHTML = html;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();

    while (textNode && textNode.textContent.trim() !== text) {
      textNode = walker.nextNode();
    }

    expect(textNode).toBeTruthy();

    const ancestorTags = [];
    let parentNode = textNode.parentElement;
    while (parentNode && parentNode !== container) {
      ancestorTags.push(parentNode.tagName.toLowerCase());
      parentNode = parentNode.parentElement;
    }

    tagNames.forEach((tagName) => expect(ancestorTags).toContain(tagName));
  };

  const expectElementToRenderBold = (element: HTMLElement): void => {
    const fontWeight = window.getComputedStyle(element).fontWeight;
    expect(fontWeight === 'bold' || Number(fontWeight) >= 700).toBe(true);
  };

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxEditorComponent
        ],
        declarations: [
          WriteRichTextAreaFieldComponent,
          MockRpxTranslatePipe,
          MockFieldLabelPipe,
          MockFirstErrorPipe
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteRichTextAreaFieldComponent);
    component = fixture.componentInstance;
    formGroup = new FormGroup({});

    component.caseField = ({
      id: FIELD_ID,
      label: 'Add recitals or preamble',
      hint_text: 'Add formatted text',
      display_context: 'MANDATORY',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    component.formGroup = formGroup;
    fixture.detectChanges();
  }));

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
  });

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(formGroup.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided HTML value', () => {
    expect(formGroup.controls[FIELD_ID].value).toBe(VALUE);
  });

  it('should reject unsafe HTML tags entered as visible editor text', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(true);
  }));

  it('should reject unsafe HTML tags obfuscated with whitespace', fakeAsync(() => {
    const unsafeValues = [
      '<p>&lt; script&gt;alert("xss")&lt; / script&gt;</p>',
      '<p>&lt;s c r i p t&gt;alert("xss")&lt;/s c r i p t&gt;</p>',
      '<p>&lt;\tiframe&gt;unsafe&lt;\n/ iframe&gt;</p>',
      '<p>&lt;s\u2003v\u2003g&gt;unsafe&lt;/s\u2003v\u2003g&gt;</p>',
      '<p>&lt; a href="https://example.com"&gt;unsafe link&lt; / a&gt;</p>',
      '<p>&lt; defendent onclick="alert(1)"&gt;unsafe&lt; / defendent&gt;</p>'
    ];

    unsafeValues.forEach((value) => {
      formGroup.controls[FIELD_ID].setValue(value);
      tick();
      expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(true);
    });
  }));

  it('should allow non-dangerous tag-like text', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>&lt;defendent&gt;Test&lt;/defendent&gt;</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(false);
  }));

  it('should allow non-dangerous tag-like text containing whitespace', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>&lt; defendent&gt;Test&lt; / defendent&gt;</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(false);
  }));

  it('should reject event handler attributes entered as visible editor text', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>&lt;defendent onclick="alert(1)"&gt;Test&lt;/defendent&gt;</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(true);
  }));

  it('should reject unsafe URL schemes entered as visible editor text', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>&lt;a href="javascript:alert(1)"&gt;Test&lt;/a&gt;</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(true);
  }));

  it('should allow supported HTML generated by the rich-text editor', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p><strong>Safe formatted text</strong></p>');
    tick();

    expect(formGroup.controls[FIELD_ID].hasError('unsafeRichText')).toBe(false);
  }));

  it('should disable automatic link creation for pasted URLs', () => {
    expect(component.editor.features.linkOnPaste).toBe(false);
  });

  it('should intercept rich URL paste before the editor inserts link markup', fakeAsync(() => {
    component.editor.setContent('<p></p>');
    tick();
    component.editor.view.focus();

    const clipboardData = new DataTransfer();
    clipboardData.setData('text/html', '<p><a href="https://someurl.com">https://someurl.com</a></p>');
    clipboardData.setData('text/plain', 'https://someurl.com');

    const editorElement = fixture.nativeElement.querySelector('.ProseMirror');
    editorElement.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData
    }));
    tick();

    const value = formGroup.controls[FIELD_ID].value;
    expect((value.match(/https:\/\/someurl\.com/g) || []).length).toBe(1);
    expect(value).not.toContain('<a');
    expect(value).not.toContain('href=');
  }));

  it('should render the required rich text toolbar commands', () => {
    const toolbarButtonLabels = Array.prototype.slice.call(fixture.nativeElement.querySelectorAll('.ccd-rich-text-area__toolbar-button'))
      .map((button: HTMLButtonElement) => button.getAttribute('aria-label'));

    expect(toolbarButtonLabels).toEqual([
      'Undo',
      'Redo',
      'Bold',
      'Italic',
      'Underline',
      'Paragraph',
      'Heading level 1',
      'Bullet List',
      'Numbered List',
      'Decrease Indent',
      'Increase Indent'
    ]);
  });

  it('should separate paragraph and list controls from adjacent toolbar groups', () => {
    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]') as HTMLButtonElement;
    const headingButton = paragraphButton.nextElementSibling as HTMLButtonElement;
    const paragraphSeparator = headingButton.nextElementSibling as HTMLSpanElement;
    const bulletListButton = paragraphSeparator.nextElementSibling as HTMLButtonElement;
    const numberedListButton = bulletListButton.nextElementSibling as HTMLButtonElement;
    const listStyle = numberedListButton.nextElementSibling as HTMLDivElement;
    const listStyleSeparator = listStyle.nextElementSibling as HTMLSpanElement;

    expect(headingButton.getAttribute('aria-label')).toBe('Heading level 1');
    expect(paragraphSeparator.classList).toContain('ccd-rich-text-area__toolbar-separator');
    expect(bulletListButton.getAttribute('aria-label')).toBe('Bullet List');
    expect(numberedListButton.getAttribute('aria-label')).toBe('Numbered List');
    expect(listStyle.classList).toContain('ccd-rich-text-area__list-style');
    expect(listStyleSeparator.classList).toContain('ccd-rich-text-area__toolbar-separator');
    expect(listStyleSeparator.nextElementSibling.getAttribute('aria-label')).toBe('Decrease Indent');
  });

  it('should render toolbar icons as decorative SVGs without changing accessible button names', () => {
    const iconButtonLabels = [
      'Undo',
      'Redo',
      'Bold',
      'Italic',
      'Underline',
      'Bullet List',
      'Numbered List',
      'Decrease Indent',
      'Increase Indent'
    ];

    iconButtonLabels.forEach((label) => {
      const button = fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
      const icon = button.querySelector('svg') as SVGElement;

      expect(icon).toBeTruthy();
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.getAttribute('focusable')).toBe('false');
    });
  });

  it('should expose all supported list styles with an associated label', () => {
    const label = fixture.nativeElement.querySelector(`label[for="${component.listStyleId()}"]`) as HTMLLabelElement;
    const select = fixture.nativeElement.querySelector(`#${component.listStyleId()}`) as HTMLSelectElement;

    expect(label.textContent.trim()).toBe('List style');
    expect(Array.from(select.options).map((option) => [option.value, option.text])).toEqual([
      ['', 'No list'],
      ['ordered_list', 'Numbers (1, 2, 3)'],
      ['ordered_alpha', 'Letters (a, b, c)'],
      ['ordered_roman', 'Roman numerals (i), (ii), (iii)']
    ]);
  });

  it('should hide the No list option while an ordered list style is active', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol type="i"><li><p>First item</p></li></ol>');
    selectEditorText('First item');
    tick();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector(`#${component.listStyleId()}`) as HTMLSelectElement;

    expect(Array.from(select.options).map((option) => option.text)).toEqual([
      'Numbers (1, 2, 3)',
      'Letters (a, b, c)',
      'Roman numerals (i), (ii), (iii)'
    ]);
    expect(select.value).toBe('ordered_roman');
  }));

  it('should render the editor and toolbar with accessible labels', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const toolbar = fixture.debugElement.query(By.css('.ccd-rich-text-area__toolbar')).nativeElement;
    const editor = fixture.nativeElement.querySelector('.ProseMirror');

    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Add recitals or preamble formatting options');
    expect(editor.getAttribute('role')).toBe('textbox');
    expect(editor.getAttribute('aria-multiline')).toBe('true');
    expect(editor.getAttribute('aria-labelledby')).toBe(component.labelId());
    expect(editor.getAttribute('aria-describedby')).toBe(component.hintId());
    expect(editor.getAttribute('aria-required')).toBe('true');
    expect(editor.getAttribute('aria-invalid')).toBe('false');
  }));

  it('should not add the editor label to the keyboard tab order', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector(`#${component.labelId()}`) as HTMLElement;

    expect(label.tabIndex).toBe(-1);
    expect(label.hasAttribute('tabindex')).toBe(false);
  }));

  it('should allow the editor to be resized while wrapping and scrolling long text', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const editorWrapper = fixture.nativeElement.querySelector('.NgxEditor__Wrapper') as HTMLElement;
    const editorContent = fixture.nativeElement.querySelector('.NgxEditor__Content') as HTMLElement;
    const editorWrapperStyle = window.getComputedStyle(editorWrapper);
    const editorContentStyle = window.getComputedStyle(editorContent);

    expect(editorWrapperStyle.height).toBe('255px');
    expect(editorWrapperStyle.minHeight).toBe('255px');
    expect(editorWrapperStyle.resize).toBe('both');
    expect(editorContentStyle.height).toBe(`${editorWrapper.clientHeight}px`);
    expect(editorContentStyle.overflowX).toBe('hidden');
    expect(editorContentStyle.overflowY).toBe('auto');
    expect(editorContentStyle.overflowWrap).toBe('anywhere');
    expect(editorContentStyle.wordBreak).toBe('normal');
  }));

  it('should keep the same vertical spacing when a list item is indented', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>Parent item</p><ul><li><p>Indented item</p></li></ul></li></ul>'
    );
    fixture.detectChanges();

    const nestedList = fixture.nativeElement.querySelector('.ProseMirror li > ul') as HTMLElement;

    expect(getComputedStyle(nestedList).marginTop).toBe('5px');
  }));

  it('should keep list-item spacing after list content is converted to paragraphs', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>First item</p><p data-indent="1">Nested item</p>');
    fixture.detectChanges();

    const paragraphs = fixture.nativeElement.querySelectorAll('.ProseMirror p') as NodeListOf<HTMLElement>;

    expect(getComputedStyle(paragraphs[0]).marginBottom).toBe('5px');
    expect(getComputedStyle(paragraphs[1]).marginBottom).toBe('5px');
  }));

  it('should use the standard text-field border and accessible focus indicator', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.NgxEditor__Wrapper') as HTMLElement;
    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;

    expect(window.getComputedStyle(wrapper).borderColor).toBe('rgb(0, 0, 0)');
    expect(window.getComputedStyle(wrapper).borderWidth).toBe('1px');

    editor.focus();
    fixture.detectChanges();

    expect(window.getComputedStyle(wrapper).outlineColor).toBe('rgb(255, 221, 0)');
    expect(window.getComputedStyle(wrapper).outlineWidth).toBe('3px');
    expect(window.getComputedStyle(editor).boxShadow).toBe('none');
  }));

  it('should add error information to the editor accessible description', fakeAsync(() => {
    component.richTextAreaControl.setValue('<p></p>');
    component.richTextAreaControl.markAsTouched();
    component.richTextAreaControl.updateValueAndValidity();
    fixture.detectChanges();
    tick();

    const editor = fixture.nativeElement.querySelector('.ProseMirror');
    expect(component.richTextAreaControl.errors.required).toBeTruthy();
    expect(editor.getAttribute('aria-invalid')).toBe('true');
    expect(editor.getAttribute('aria-describedby')).toContain(component.hintId());
    expect(editor.getAttribute('aria-describedby')).toContain(component.errorId());
  }));

  it('should identify toolbar shortcuts and toggle button state for assistive technology', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const boldButton = fixture.nativeElement.querySelector('button[aria-label="Bold"]');
    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]');
    const headingButton = fixture.nativeElement.querySelector('button[aria-label="Heading level 1"]');
    const undoButton = fixture.nativeElement.querySelector('button[aria-label="Undo"]');

    expect(boldButton.getAttribute('aria-keyshortcuts')).toBe('Control+B');
    expect(boldButton.getAttribute('aria-pressed')).toBe('true');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('false');
    expect(headingButton.getAttribute('aria-pressed')).toBe('false');
    expect(undoButton.getAttribute('aria-keyshortcuts')).toBe('Control+Z');
  }));

  it('should only show paragraph as active after the paragraph command is applied', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]');
    expect(paragraphButton.classList).not.toContain('ccd-rich-text-area__toolbar-button--active');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('false');

    clickToolbarButton('Paragraph');
    tick();
    fixture.detectChanges();

    expect(paragraphButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should deselect paragraph when the paragraph command is applied again', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]');

    clickToolbarButton('Paragraph');
    tick();
    fixture.detectChanges();

    expect(paragraphButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('true');

    clickToolbarButton('Paragraph');
    tick();
    fixture.detectChanges();

    expect(paragraphButton.classList).not.toContain('ccd-rich-text-area__toolbar-button--active');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('false');
  }));

  it('should return focus to the editor after a toolbar mouse command', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    spyOn(component.editor.view, 'focus');

    clickToolbarButton('Bold');
    tick();

    expect(component.editor.view.focus).toHaveBeenCalled();
  }));

  it('should apply bold formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    clickToolbarButton('Bold');
    tick();

    component.editor.commands.insertText('Bold text').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<strong>Bold text</strong>');
  }));

  it('should apply bold and underline formatting together from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    clickToolbarButton('Bold');
    clickToolbarButton('Underline');
    tick();

    component.editor.commands.insertText('Bold underlined text').exec();
    tick();

    const value = formGroup.controls[FIELD_ID].value;
    expectTextToHaveAncestorTags(value, 'Bold underlined text', ['strong', 'u']);
  }));

  it('should retain inline formatting after Enter', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    clickToolbarButton('Bold');
    clickToolbarButton('Italic');
    clickToolbarButton('Underline');
    component.editor.commands.insertText('Formatted text').exec();
    tick();

    const editorElement = fixture.nativeElement.querySelector('.ProseMirror');
    editorElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    }));
    tick();
    fixture.detectChanges();

    ['Bold', 'Italic', 'Underline'].forEach((label) => {
      const button = fixture.nativeElement.querySelector(`button[aria-label="${label}"]`);
      expect(button.classList).toContain('ccd-rich-text-area__toolbar-button--active');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    component.editor.commands.insertText('More formatted text').exec();
    tick();

    const value = formGroup.controls[FIELD_ID].value;
    expectTextToHaveAncestorTags(value, 'Formatted text', ['strong', 'em', 'u']);
    expectTextToHaveAncestorTags(value, 'More formatted text', ['strong', 'em', 'u']);
  }));

  it('should apply bold formatting to selected editor text from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>Selected text</p>');
    selectEditorText('Selected text');

    clickToolbarButton('Bold');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<strong>Selected text</strong>');
  }));

  it('should apply bold and underline formatting together to selected editor text from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>Selected text</p>');
    selectEditorText('Selected text');

    clickToolbarButton('Bold');
    clickToolbarButton('Underline');
    tick();

    const value = formGroup.controls[FIELD_ID].value;
    expectTextToHaveAncestorTags(value, 'Selected text', ['strong', 'u']);
  }));

  it('should render bold underline text as visibly bold when underline is nested inside strong', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p><strong><u>Bold underlined text</u></strong></p>');
    tick();
    fixture.detectChanges();

    const underlinedElement = fixture.nativeElement.querySelector('.ProseMirror u') as HTMLElement;

    expect(underlinedElement.textContent).toBe('Bold underlined text');
    expectElementToRenderBold(underlinedElement);
  }));

  it('should render bold underline text as visibly bold when strong is nested inside underline', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p><u><strong>Bold underlined text</strong></u></p>');
    tick();
    fixture.detectChanges();

    const boldElement = fixture.nativeElement.querySelector('.ProseMirror strong') as HTMLElement;

    expect(boldElement.textContent).toBe('Bold underlined text');
    expectElementToRenderBold(boldElement);
  }));

  it('should apply paragraph formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<h1>Heading 1</h1>');
    selectEditorText('Heading 1');

    clickToolbarButton('Paragraph');
    tick();
    fixture.detectChanges();

    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]');

    expect(formGroup.controls[FIELD_ID].value).toContain('<p>Heading 1</p>');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('<h1>');
    expect(paragraphButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should keep paragraph and heading controls beside each other', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const paragraphButton = fixture.nativeElement.querySelector('button[aria-label="Paragraph"]');
    const headingButton = fixture.nativeElement.querySelector('button[aria-label="Heading level 1"]');

    expect(paragraphButton).toBeTruthy();
    expect(paragraphButton.nextElementSibling).toBe(headingButton);
  }));

  it('should toggle heading level 1 formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>Section heading</p>');
    selectEditorText('Section heading');

    clickToolbarButton('Heading level 1');
    tick();
    fixture.detectChanges();

    const headingButton = fixture.nativeElement.querySelector('button[aria-label="Heading level 1"]');
    expect(formGroup.controls[FIELD_ID].value).toContain('<h1>Section heading</h1>');
    expect(headingButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
    expect(headingButton.getAttribute('aria-pressed')).toBe('true');

    clickToolbarButton('Heading level 1');
    tick();
    fixture.detectChanges();

    expect(formGroup.controls[FIELD_ID].value).toContain('<p>Section heading</p>');
    expect(headingButton.classList).not.toContain('ccd-rich-text-area__toolbar-button--active');
    expect(headingButton.getAttribute('aria-pressed')).toBe('false');
  }));

  it('should allow heading level 1 formatting inside an ordered list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>Heading item</p></li></ol>');
    selectEditorText('Heading item');

    clickToolbarButton('Heading level 1');
    tick();
    fixture.detectChanges();

    const headingButton = fixture.nativeElement.querySelector('button[aria-label="Heading level 1"]');
    const numberedListButton = fixture.nativeElement.querySelector('button[aria-label="Numbered List"]');

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol><li><h1>Heading item</h1></li></ol>');
    expect(headingButton.getAttribute('aria-pressed')).toBe('true');
    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should allow ordered list formatting to be applied to a heading', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<h1>Heading item</h1>');
    selectEditorText('Heading item');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const headingButton = fixture.nativeElement.querySelector('button[aria-label="Heading level 1"]');
    const numberedListButton = fixture.nativeElement.querySelector('button[aria-label="Numbered List"]');

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol><li><h1>Heading item</h1></li></ol>');
    expect(headingButton.getAttribute('aria-pressed')).toBe('true');
    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should remove list formatting when paragraph formatting is applied inside a list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ul><li><p>List item</p></li></ul>');
    selectEditorText('List item');

    clickToolbarButton('Paragraph');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<p>List item</p>');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('<ul>');
  }));

  it('should apply ordered list formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    selectListStyle('ordered_list');
    tick();

    component.editor.commands.insertText('First item').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol>');
    expect(formGroup.controls[FIELD_ID].value).toContain('<li><p>First item</p></li>');
    expect(component.currentListStyle()).toBe('ordered_list');
  }));

  it('should apply numbered list formatting from the numbered list button and update the list style', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const numberedListButton = fixture.nativeElement.querySelector(
      'button[aria-label="Numbered List"]'
    ) as HTMLButtonElement;
    const listStyleSelect = fixture.nativeElement.querySelector(`#${component.listStyleId()}`) as HTMLSelectElement;

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol>');
    expect(component.currentListStyle()).toBe('ordered_list');
    expect(listStyleSelect.value).toBe('ordered_list');
    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should select the numbered list button when Numbers is selected from the list style dropdown', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    selectListStyle('ordered_list');
    tick();
    fixture.detectChanges();

    const numberedListButton = fixture.nativeElement.querySelector(
      'button[aria-label="Numbered List"]'
    ) as HTMLButtonElement;

    expect(numberedListButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');
  }));

  it('should keep the numbered list button selected for lettered and Roman numeral lists', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol type="a"><li><p>First item</p></li></ol>');
    selectEditorText('First item');
    tick();
    fixture.detectChanges();

    const numberedListButton = fixture.nativeElement.querySelector(
      'button[aria-label="Numbered List"]'
    ) as HTMLButtonElement;

    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');

    selectListStyle('ordered_roman');
    tick();
    fixture.detectChanges();

    expect(numberedListButton.getAttribute('aria-pressed')).toBe('true');
    expect(numberedListButton.classList).toContain('ccd-rich-text-area__toolbar-button--active');
  }));

  it('should remove any ordered list style when the numbered list button is unselected', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol type="a"><li><p>First item</p></li></ol>');
    selectEditorText('First item');
    tick();

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    expect(formGroup.controls[FIELD_ID].value).toContain('<p>First item</p>');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('<ol');
    expect(component.currentListStyle()).toBe('');
    expect((fixture.nativeElement.querySelector('button[aria-label="Numbered List"]') as HTMLButtonElement)
      .getAttribute('aria-pressed')).toBe('false');
    const paragraphButton = fixture.nativeElement.querySelector(
      'button[aria-label="Paragraph"]'
    ) as HTMLButtonElement;
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('false');
    expect(paragraphButton.classList).not.toContain('ccd-rich-text-area__toolbar-button--active');
  }));

  it('should preserve and restore numbering when a single list item is toggled', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>One</p></li><li><p>Two</p></li><li><p>Three</p></li><li><p>Four</p></li></ol>'
    );
    selectEditorText('Three');

    clickToolbarButton('Numbered List');
    tick();

    let orderedLists = Array.from(fixture.nativeElement.querySelectorAll('.ProseMirror > ol')) as HTMLOListElement[];
    expect(orderedLists.length).toBe(2);
    expect(orderedLists[0].start).toBe(1);
    expect(orderedLists[1].start).toBe(3);
    expect(orderedLists[1].textContent).toBe('Four');

    selectEditorText('Three');
    clickToolbarButton('Numbered List');
    tick();

    orderedLists = Array.from(fixture.nativeElement.querySelectorAll('.ProseMirror > ol')) as HTMLOListElement[];
    expect(orderedLists.length).toBe(1);
    expect(Array.from(orderedLists[0].querySelectorAll(':scope > li')).map((item) => item.textContent))
      .toEqual(['One', 'Two', 'Three', 'Four']);

    selectEditorTextRange('One', 'Four');
    clickToolbarButton('Numbered List');
    tick();

    expect(fixture.nativeElement.querySelector('.ProseMirror > ol')).toBeNull();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.ProseMirror > p')).map((item: HTMLElement) => item.textContent))
      .toEqual(['One', 'Two', 'Three', 'Four']);
  }));

  it('should remove all selected nested list levels while preserving paragraph indentation', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>One</p></li><li><p>Two</p>'
      + '<ol type="a"><li><p>Nested one</p></li><li><p>Nested two</p>'
      + '<ol type="i"><li><p>Roman one</p></li><li><p>Roman two</p></li></ol>'
      + '</li></ol></li><li><p>Three</p></li></ol>'
    );
    selectEditorTextRange('One', 'Three');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ProseMirror ol, .ProseMirror ul')).toBeNull();
    const paragraphs = Array.from(
      fixture.nativeElement.querySelectorAll('.ProseMirror > p')
    ) as HTMLParagraphElement[];
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      'One', 'Two', 'Nested one', 'Nested two', 'Roman one', 'Roman two', 'Three'
    ]);
    expect(paragraphs.map((paragraph) => paragraph.dataset.indent || null)).toEqual([
      null, null, '1', '1', '2', '2', null
    ]);
  }));

  it('should restore selected indented paragraphs as a nested numbered list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>One</p></li><li><p>Two</p>'
      + '<ol type="a"><li><p>Nested one</p></li><li><p>Nested two</p>'
      + '<ol type="i"><li><p>Roman one</p></li><li><p>Roman two</p></li></ol>'
      + '</li></ol></li><li><p>Three</p></li></ol>'
    );
    selectEditorTextRange('One', 'Three');
    clickToolbarButton('Numbered List');
    tick();

    selectEditorTextRange('One', 'Three');
    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const rootList = fixture.nativeElement.querySelector('.ProseMirror > ol') as HTMLOListElement;
    expect(rootList).not.toBeNull();
    expect(Array.from(rootList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['One', 'Two', 'Three']);
    const letteredList = rootList.querySelector(':scope > li:nth-child(2) > ol[type="a"]') as HTMLOListElement;
    expect(letteredList).not.toBeNull();
    expect(Array.from(letteredList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Nested one', 'Nested two']);
    const romanList = letteredList.querySelector(':scope > li:nth-child(2) > ol[type="i"]') as HTMLOListElement;
    expect(romanList).not.toBeNull();
    expect(Array.from(romanList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Roman one', 'Roman two']);
  }));

  it('should restore selected indented paragraphs as nested bullet lists at every level', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>One</p></li><li><p>Two</p>'
      + '<ol type="a"><li><p>Nested one</p></li><li><p>Nested two</p>'
      + '<ol type="i"><li><p>Roman one</p></li><li><p>Roman two</p></li></ol>'
      + '</li></ol></li><li><p>Three</p></li></ol>'
    );
    selectEditorTextRange('One', 'Three');
    clickToolbarButton('Numbered List');
    tick();

    selectEditorTextRange('One', 'Three');
    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const rootList = fixture.nativeElement.querySelector('.ProseMirror > ul') as HTMLUListElement;
    expect(rootList).not.toBeNull();
    expect(Array.from(rootList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['One', 'Two', 'Three']);
    const nestedList = rootList.querySelector(':scope > li:nth-child(2) > ul') as HTMLUListElement;
    expect(nestedList).not.toBeNull();
    expect(Array.from(nestedList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Nested one', 'Nested two']);
    const deepestList = nestedList.querySelector(':scope > li:nth-child(2) > ul') as HTMLUListElement;
    expect(deepestList).not.toBeNull();
    expect(Array.from(deepestList.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Roman one', 'Roman two']);
    expect(rootList.querySelector('ol')).toBeNull();
  }));

  it('should align a numbered-list marker with a single indented paragraph', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p>Test1</p><p>Test2</p><p data-indent="1">Test3</p><p data-indent="1">Test4</p>'
      + '<p data-indent="2">Test5</p><p data-indent="2">Test6</p><p data-indent="1">Test7</p><p>Test8</p>'
    );
    selectEditorText('Test5');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ProseMirror > ol') as HTMLOListElement;
    expect(list.dataset.indent).toBe('2');
    expect(list.textContent).toBe('Test5');
    expect((list.querySelector('p') as HTMLParagraphElement).hasAttribute('data-indent')).toBe(false);
  }));

  it('should align numbered-list markers with multiple paragraphs at the same indentation', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p>Test1</p><p>Test2</p><p data-indent="1">Test3</p><p data-indent="1">Test4</p>'
      + '<p data-indent="2">Test5</p><p data-indent="2">Test6</p><p data-indent="1">Test7</p><p>Test8</p>'
    );
    selectEditorTextRange('Test5', 'Test6');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ProseMirror > ol') as HTMLOListElement;
    expect(list.dataset.indent).toBe('2');
    expect(Array.from(list.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Test5', 'Test6']);
    expect(Array.from(list.querySelectorAll('p')).every((paragraph) => !paragraph.hasAttribute('data-indent')))
      .toBe(true);
  }));

  it('should align bullet-list markers with multiple paragraphs at the same indentation', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p>Test1</p><p>Test2</p><p data-indent="1">Test3</p><p data-indent="1">Test4</p>'
      + '<p data-indent="2">Test5</p><p data-indent="2">Test6</p><p data-indent="1">Test7</p><p>Test8</p>'
    );
    selectEditorTextRange('Test3', 'Test4');

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ProseMirror > ul') as HTMLUListElement;
    const listStyle = getComputedStyle(list);
    expect(list.dataset.indent).toBe('1');
    expect(Array.from(list.querySelectorAll(':scope > li > p')).map((item) => item.textContent))
      .toEqual(['Test3', 'Test4']);
    expect(Array.from(list.querySelectorAll('p')).every((paragraph) => !paragraph.hasAttribute('data-indent')))
      .toBe(true);
    expect(listStyle.marginLeft).toBe('40px');
    expect(listStyle.paddingLeft).toBe('25px');
  }));

  it('should align a bullet-list marker when the cursor is in a single indented paragraph', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p data-indent="2">Test5</p>');
    let textPosition = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (node.isText && node.text === 'Test5') {
        textPosition = position + 2;
        return false;
      }
      return true;
    });
    component.editor.view.dispatch(component.editor.view.state.tr.setSelection(
      TextSelection.create(component.editor.view.state.doc, textPosition)
    ));

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ProseMirror > ul') as HTMLUListElement;
    expect(list.dataset.indent).toBe('2');
    expect(list.textContent).toBe('Test5');
    expect((list.querySelector('p') as HTMLParagraphElement).hasAttribute('data-indent')).toBe(false);
  }));

  it('should keep the cursor on a nested item when removing it from a list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>Parent</p><ol type="a"><li><p>Nested item</p></li></ol></li></ol>'
    );

    let textPosition: number | null = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (node.isText && node.text === 'Nested item') {
        textPosition = position + 4;
        return false;
      }
      return true;
    });
    component.editor.view.dispatch(component.editor.view.state.tr.setSelection(
      TextSelection.create(component.editor.view.state.doc, textPosition)
    ));

    clickToolbarButton('Numbered List');
    tick();

    const { $from } = component.editor.view.state.selection;
    expect(component.editor.view.state.selection.empty).toBe(true);
    expect($from.parent.textContent).toBe('Nested item');
    expect($from.parentOffset).toBe(4);
  }));

  it('should clear the list toolbar state after removing a nested Roman item', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>Parent</p><ol type="a"><li><p>Letter item</p><ol type="i">'
      + '<li><p>First Roman item</p></li><li><p>Second Roman item</p></li>'
      + '</ol></li></ol></li></ul>'
    );

    let textPosition: number | null = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (node.isText && node.text === 'First Roman item') {
        textPosition = position + 4;
        return false;
      }
      return true;
    });
    component.editor.view.dispatch(component.editor.view.state.tr.setSelection(
      TextSelection.create(component.editor.view.state.doc, textPosition)
    ));

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    expect(component.editor.view.state.selection.$from.parent.textContent).toBe('First Roman item');
    expect(component.currentListStyle()).toBe('');
    expect(component.isOrderedListActive()).toBe(false);
    expect((fixture.nativeElement.querySelector('.ccd-rich-text-area__list-style-select') as HTMLSelectElement).value)
      .toBe('');
  }));

  it('should keep Enter on a removed nested list item as plain indented text', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>Parent</p><ol type="a"><li><p>Letter item</p><ol type="i">'
      + '<li><p>First Roman item</p></li><li><p>Second Roman item</p></li>'
      + '</ol></li></ol></li></ol>'
    );

    let textPosition: number | null = null;
    component.editor.view.state.doc.descendants((node, position) => {
      if (node.isText && node.text === 'First Roman item') {
        textPosition = position + node.nodeSize;
        return false;
      }
      return true;
    });
    component.editor.view.dispatch(component.editor.view.state.tr.setSelection(
      TextSelection.create(component.editor.view.state.doc, textPosition)
    ));

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const editorElement = fixture.nativeElement.querySelector('.ProseMirror');
    editorElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    }));
    tick();
    fixture.detectChanges();

    const { $from } = component.editor.view.state.selection;
    const letteredList = editorElement.querySelector(':scope > ol > li > ol[type="a"]') as HTMLOListElement;
    expect($from.parent.type.name).toBe('paragraph');
    expect($from.parent.textContent).toBe('');
    expect(component.currentListStyle()).toBe('');
    expect(letteredList.querySelectorAll(':scope > li').length).toBe(1);
    expect(letteredList.querySelectorAll(':scope > li > ol[type="i"] > li').length).toBe(1);
  }));

  it('should not flatten ancestor lists when removing a selected nested Roman list item', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>The issues that the court needed to decide were as follows:</p>'
      + '<ol type="a"><li><p>with whom the child should live;</p></li>'
      + '<li><p>whether they should spend time with the other parent and, if so,</p></li>'
      + '<li><p>how often;</p><ol type="i">'
      + '<li><p>whether there should be overnight stays and longer stays;</p></li>'
      + '<li><p>whether it should be supervised or supported;</p></li>'
      + '<li><p>whether it should be limited to indirect contact;</p></li>'
      + '</ol></li><li><p>the child’s education;</p></li></ol></li></ul>'
    );
    selectEditorText('whether there should be overnight stays and longer stays;');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editor.querySelector(':scope > ul')).not.toBeNull();
    const letteredList = editor.querySelector(':scope > ul > li > ol[type="a"]') as HTMLOListElement;
    expect(letteredList).not.toBeNull();
    expect(letteredList.querySelectorAll(':scope > li').length).toBe(4);
    const selectedParagraph = Array.from(letteredList.querySelectorAll('p'))
      .find((paragraph) => paragraph.textContent.includes('overnight stays'));
    expect(selectedParagraph?.hasAttribute('data-indent')).toBe(false);
    const remainingRomanList = letteredList.querySelector('ol[type="i"]') as HTMLOListElement;
    expect(remainingRomanList.querySelectorAll(':scope > li').length).toBe(2);
    expect(remainingRomanList.start).toBe(1);
  }));

  it('should apply and retain lettered list formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    selectListStyle('ordered_alpha');
    tick();
    component.editor.commands.insertText('First item').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol type="a">');
    expect(component.currentListStyle()).toBe('ordered_alpha');
  }));

  it('should change only a nested bullet list to letters', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>First item</p></li><li><p>Second item</p>'
      + '<ul><li><p>Nested first item</p></li><li><p>Nested second item</p></li></ul></li></ol>'
    );
    selectEditorText('Nested first item');
    tick();
    fixture.detectChanges();

    expect(component.currentListStyle()).toBe('bullet_list');
    expect((fixture.nativeElement.querySelector('button[aria-label="Bullet List"]') as HTMLButtonElement)
      .getAttribute('aria-pressed')).toBe('true');
    expect((fixture.nativeElement.querySelector('button[aria-label="Numbered List"]') as HTMLButtonElement)
      .getAttribute('aria-pressed')).toBe('false');

    selectListStyle('ordered_alpha');
    tick();
    fixture.detectChanges();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>First item</p></li><li><p>Second item</p>'
      + '<ol type="a"><li><p>Nested first item</p></li><li><p>Nested second item</p></li></ol></li></ol>'
    );
    expect(component.currentListStyle()).toBe('ordered_alpha');
  }));

  it('should apply and retain parenthesised Roman numeral list formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    selectListStyle('ordered_roman');
    tick();
    component.editor.commands.insertText('First item').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol type="i">');
    expect(component.currentListStyle()).toBe('ordered_roman');
  }));

  it('should switch ordered list marker style without removing its items', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>First item</p></li><li><p>Second item</p></li></ol>');
    selectEditorText('First item');
    tick();

    selectListStyle('ordered_roman');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol type="i">');
    expect(formGroup.controls[FIELD_ID].value).toContain('<li><p>First item</p></li><li><p>Second item</p></li>');
    expect(component.currentListStyle()).toBe('ordered_roman');
  }));

  it('should apply bullet list formatting from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p></p>');

    clickToolbarButton('Bullet List');
    tick();

    component.editor.commands.insertText('First item').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ul>');
    expect(formGroup.controls[FIELD_ID].value).toContain('<li><p>First item</p></li>');
    expect(component.currentListStyle()).toBe('bullet_list');
    expect(component.currentListSelectValue()).toBe('');
    expect((fixture.nativeElement.querySelector('button[aria-label="Bullet List"]') as HTMLButtonElement)
      .getAttribute('aria-pressed')).toBe('true');
  }));

  it('should restore a middle bullet item and remove the complete restored list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>One</p></li><li><p>Two</p></li><li><p>Three</p></li></ul>'
    );
    selectEditorText('Two');

    clickToolbarButton('Bullet List');
    tick();

    selectEditorText('Two');
    clickToolbarButton('Bullet List');
    tick();

    expect(fixture.nativeElement.querySelectorAll('.ProseMirror > ul').length).toBe(1);

    selectEditorTextRange('One', 'Three');
    clickToolbarButton('Bullet List');
    tick();

    expect(fixture.nativeElement.querySelector('.ProseMirror > ul')).toBeNull();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.ProseMirror > p')).map((item: HTMLElement) => item.textContent))
      .toEqual(['One', 'Two', 'Three']);
  }));

  it('should leave list formatting unchanged when no list is selected from the dropdown', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>First item</p></li></ol>');
    selectEditorText('First item');
    tick();

    selectListStyle('');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol><li><p>First item</p></li></ol>');
    expect(component.currentListStyle()).toBe('ordered_list');
  }));

  it('should switch directly between numbered and bullet list styles', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>First item</p></li></ol>');
    selectEditorText('First item');
    tick();

    clickToolbarButton('Bullet List');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ul>');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('<ol>');
    expect(component.currentListStyle()).toBe('bullet_list');
  }));

  it('should convert a fully selected nested bullet hierarchy to the default ordered list styles', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>Top one</p></li><li><p>Top two</p>'
      + '<ul><li><p>Nested one</p></li><li><p>Nested two</p>'
      + '<ul><li><p>Deep one</p></li><li><p>Deep two</p></li></ul>'
      + '</li><li><p>Nested three</p></li></ul></li><li><p>Top three</p></li></ul>'
    );
    selectEditorTextRange('Top one', 'Top three');

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const rootList = fixture.nativeElement.querySelector('.ProseMirror > ol') as HTMLOListElement;
    expect(rootList).not.toBeNull();
    const letteredList = rootList.querySelector(':scope > li:nth-child(2) > ol[type="a"]') as HTMLOListElement;
    expect(letteredList).not.toBeNull();
    expect(letteredList.querySelector(':scope > li:nth-child(2) > ol[type="i"]')).not.toBeNull();
    expect(rootList.querySelector('ul')).toBeNull();
  }));

  it('should convert a fully selected nested ordered hierarchy to bullets at every level', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>Top one</p></li><li><p>Top two</p>'
      + '<ol type="a"><li><p>Nested one</p></li><li><p>Nested two</p>'
      + '<ol type="i"><li><p>Deep one</p></li><li><p>Deep two</p></li></ol>'
      + '</li><li><p>Nested three</p></li></ol></li><li><p>Top three</p></li></ol>'
    );
    selectEditorTextRange('Top one', 'Top three');

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const rootList = fixture.nativeElement.querySelector('.ProseMirror > ul') as HTMLUListElement;
    expect(rootList).not.toBeNull();
    const nestedList = rootList.querySelector(':scope > li:nth-child(2) > ul') as HTMLUListElement;
    expect(nestedList).not.toBeNull();
    expect(nestedList.querySelector(':scope > li:nth-child(2) > ul')).not.toBeNull();
    expect(rootList.querySelector('ol')).toBeNull();
  }));

  it('should preserve nested lettered and Roman lists when switching the parent list to bullets', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>Top item</p><ol type="a"><li><p>Letter item</p>'
      + '<ol type="i"><li><p>Roman item</p></li></ol></li></ol></li></ol>'
    );
    selectEditorText('Top item');
    tick();

    clickToolbarButton('Bullet List');
    tick();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editor.querySelector(':scope > ul > li > ol[type="a"] > li > ol[type="i"]')).not.toBeNull();
    expect(formGroup.controls[FIELD_ID].value).toContain('<ol type="a">');
    expect(formGroup.controls[FIELD_ID].value).toContain('<ol type="i">');
    expect(component.currentListStyle()).toBe('bullet_list');
  }));

  it('should switch a pasted list group split by blank Word paragraphs to bullets', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>Top item</p><ol type="a"><li><p>Letter item</p>'
      + '<ol type="i"><li><p>Roman item</p></li></ol></li></ol></li></ol>'
      + '<p></p><ol start="2"><li><p>Second top item</p></li></ol>'
    );
    selectEditorText('Top item');
    tick();

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editor.querySelectorAll(':scope > ul').length).toBe(2);
    expect(editor.querySelector(':scope > ol')).toBeNull();
    expect(editor.querySelector(':scope > ul > li > ol[type="a"] > li > ol[type="i"]')).not.toBeNull();
    expect(formGroup.controls[FIELD_ID].value).toContain('<p></p><ul>');
  }));

  it('should switch a continued Word list sequence between numbers and bullets across headings', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p><strong>Issues</strong></p>'
      + '<ol start="4"><li><p>First section</p><ol type="a"><li><p>Nested item</p></li></ol></li></ol>'
      + '<p></p><ol start="5"><li><p>Second section</p></li></ol>'
      + '<p><strong>Parental responsibility</strong></p>'
      + '<ol start="6"><li><p>Third section</p></li></ol>'
      + '<p><strong>Other recitals</strong></p>'
      + '<ol start="7"><li><p>Fourth section</p></li></ol>'
    );
    selectEditorText('First section');
    tick();

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editor.querySelectorAll(':scope > ul').length).toBe(4);
    expect(editor.querySelector(':scope > ol')).toBeNull();
    expect(editor.querySelector(':scope > ul > li > ol[type="a"]')).not.toBeNull();

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const orderedLists = editor.querySelectorAll(':scope > ol');
    expect(orderedLists.length).toBe(4);
    expect(orderedLists[0].getAttribute('start')).toBeNull();
    expect(orderedLists[1].getAttribute('start')).toBe('2');
    expect(orderedLists[2].getAttribute('start')).toBe('3');
    expect(orderedLists[3].getAttribute('start')).toBe('4');
    expect(editor.querySelector(':scope > ol > li > ol[type="a"]')).not.toBeNull();
  }));

  it('should continue numbering across pasted bullet lists split by blank Word paragraphs', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ul><li><p>First top item</p></li><li><p>Second top item</p></li></ul>'
      + '<p></p><ul><li><p>Third top item</p></li></ul>'
    );
    selectEditorText('First top item');
    tick();

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    const orderedLists = editor.querySelectorAll(':scope > ol');
    expect(orderedLists.length).toBe(2);
    expect(orderedLists[0].getAttribute('start')).toBeNull();
    expect(orderedLists[1].getAttribute('start')).toBe('3');
    expect(formGroup.controls[FIELD_ID].value).toContain('<p></p><ol start="3">');
  }));

  it('should continue numbering across pasted bullet lists separated by bold Word headings', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p><strong>Issues</strong></p>'
      + '<ul><li><p>First section</p></li><li><p>Second section</p></li></ul>'
      + '<h2>Parental responsibility</h2>'
      + '<ul><li><p>Third section</p></li></ul>'
      + '<h2>Other recitals</h2>'
      + '<ul><li><p>Fourth section</p></li></ul>'
    );
    selectEditorText('First section');
    tick();

    clickToolbarButton('Numbered List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    const orderedLists = editor.querySelectorAll(':scope > ol');
    expect(orderedLists.length).toBe(3);
    expect(editor.querySelector(':scope > ul')).toBeNull();
    expect(orderedLists[0].getAttribute('start')).toBeNull();
    expect(orderedLists[1].getAttribute('start')).toBe('3');
    expect(orderedLists[2].getAttribute('start')).toBe('4');
  }));

  it('should repair later bullet sections when the active section is already numbered', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<p><strong>Issues</strong></p>'
      + '<ol><li><p>First section</p></li><li><p>Second section</p></li></ol>'
      + '<h2>Parental responsibility</h2>'
      + '<ul><li><p>Third section</p></li></ul>'
      + '<h2>Other recitals</h2>'
      + '<ul><li><p>Fourth section</p></li></ul>'
    );
    selectEditorText('First section');
    tick();

    selectListStyle('ordered_list');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    const orderedLists = editor.querySelectorAll(':scope > ol');
    expect(orderedLists.length).toBe(3);
    expect(editor.querySelector(':scope > ul')).toBeNull();
    expect(orderedLists[0].getAttribute('start')).toBeNull();
    expect(orderedLists[1].getAttribute('start')).toBe('3');
    expect(orderedLists[2].getAttribute('start')).toBe('4');
  }));

  it('should not switch a separate list after a non-empty paragraph', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>First list item</p></li></ol>'
      + '<p>Separate content</p>'
      + '<ol><li><p>Second list item</p></li></ol>'
    );
    selectEditorText('First list item');
    tick();

    clickToolbarButton('Bullet List');
    tick();
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editor.querySelectorAll(':scope > ul').length).toBe(1);
    expect(editor.querySelectorAll(':scope > ol').length).toBe(1);
  }));

  it('should indent and outdent a bullet list item from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>');
    selectEditorText('Second item');

    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<li><p>First item</p><ul><li><p>Second item</p></li></ul></li>'
    );

    clickToolbarButton('Decrease Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>'
    );
  }));

  it('should indent and outdent a numbered list item from the toolbar', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>First item</p></li><li><p>Second item</p></li></ol>');
    selectEditorText('Second item');

    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<li><p>First item</p><ol type="a"><li><p>Second item</p></li></ol></li>'
    );

    clickToolbarButton('Decrease Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>First item</p></li><li><p>Second item</p></li></ol>'
    );
  }));

  it('should use lettered and Roman markers as numbered list items are nested', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>First item</p></li><li><p>Second item</p></li><li><p>Third item</p></li></ol>'
    );

    selectEditorText('Second item');
    clickToolbarButton('Increase Indent');
    tick();

    selectEditorText('Third item');
    clickToolbarButton('Increase Indent');
    tick();
    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>First item</p><ol type="a"><li><p>Second item</p>'
      + '<ol type="i"><li><p>Third item</p></li></ol></li></ol></li></ol>'
    );
    expect(component.currentListStyle()).toBe('ordered_roman');
  }));

  it('should use Roman markers when lettered list items are nested', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol type="a"><li><p>First item</p></li><li><p>Second item</p></li></ol>'
    );

    selectEditorText('Second item');
    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol type="a"><li><p>First item</p><ol type="i"><li><p>Second item</p></li></ol></li></ol>'
    );
    expect(component.currentListStyle()).toBe('ordered_roman');
  }));

  it('should use lettered and Roman markers when numbered list items are indented with Tab', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>First item</p></li><li><p>Second item</p></li><li><p>Third item</p></li></ol>'
    );
    const editorElement = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;

    selectEditorText('Second item');
    tick();
    const secondItemTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    editorElement.dispatchEvent(secondItemTab);
    tick();

    selectEditorText('Third item');
    tick();
    editorElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    tick();
    editorElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    tick();

    expect(secondItemTab.defaultPrevented).toBe(true);
    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>First item</p><ol type="a"><li><p>Second item</p>'
      + '<ol type="i"><li><p>Third item</p></li></ol></li></ol></li></ol>'
    );
    expect(component.currentListStyle()).toBe('ordered_roman');
  }));

  it('should outdent a nested list item with Shift and Tab', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent(
      '<ol><li><p>First item</p><ol type="a"><li><p>Second item</p></li></ol></li></ol>'
    );
    const editorElement = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;

    selectEditorText('Second item');
    tick();
    const shiftTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });
    editorElement.dispatchEvent(shiftTab);
    tick();

    expect(shiftTab.defaultPrevented).toBe(true);
    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>First item</p></li><li><p>Second item</p></li></ol>'
    );
  }));

  it('should leave Tab available for focus navigation outside a list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>Paragraph text</p>');
    const editorElement = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;

    selectEditorText('Paragraph text');
    tick();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    editorElement.dispatchEvent(tab);
    tick();

    expect(tab.defaultPrevented).toBe(false);
    expect(formGroup.controls[FIELD_ID].value).toContain('<p>Paragraph text</p>');
  }));

  it('should indent and outdent a bullet list when the item cannot be nested', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ul><li><p>Only item</p></li></ul>');
    selectEditorText('Only item');

    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ul data-indent="1"><li><p>Only item</p></li></ul>'
    );

    clickToolbarButton('Decrease Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ul><li><p>Only item</p></li></ul>'
    );
  }));

  it('should indent and outdent a numbered list when the item cannot be nested', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<ol><li><p>Only item</p></li></ol>');
    selectEditorText('Only item');

    clickToolbarButton('Increase Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol data-indent="1"><li><p>Only item</p></li></ol>'
    );

    clickToolbarButton('Decrease Indent');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain(
      '<ol><li><p>Only item</p></li></ol>'
    );
  }));

  it('should retain a typed space after formatted text in an indented paragraph', () => {
    const normalisedHtml = component.normaliseRichTextValue(
      '<p data-indent="1"><strong>Indented text</strong> </p>'
    );

    expect(normalisedHtml).toContain('<strong>Indented text</strong> </p>');
  });

  it('should insert spaces after indenting existing text', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.editor.setContent('<p>Indented text</p>');

    const documentEnd = component.editor.view.state.doc.content.size - 1;
    component.editor.view.dispatch(component.editor.view.state.tr.setSelection(
      TextSelection.create(component.editor.view.state.doc, documentEnd)
    ));
    clickToolbarButton('Increase Indent');
    tick();

    component.editor.commands.insertText(' ').exec();
    tick();
    component.editor.commands.insertText('more').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<p data-indent="1">Indented text more</p>');
  }));

  it('should retain supported formatting when normalising Word list HTML', () => {
    const wordHtml = `
      <html>
        <body>
          <div class="WordSection1">
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span><strong>First item</strong>
            </p>
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">2.<span>&nbsp;&nbsp;</span></span><em>Second item</em>
            </p>
          </div>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<ol>');
    expect(normalisedHtml).toContain('<li><strong>First item</strong></li>');
    expect(normalisedHtml).toContain('<li><em>Second item</em></li>');
  });

  it('should remove duplicate Word indentation between bullet markers and list text', () => {
    const wordHtml = `
      <ul>
        <li>
          <p style="margin-left: 72pt;">
            <span style="mso-tab-count: 1">&nbsp;&nbsp;&nbsp;&nbsp;</span>Test1
          </p>
        </li>
        <li><p style="margin-left: 72pt;">Test2</p></li>
      </ul>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const listParagraphs = Array.prototype.slice.call(normalisedDocument.querySelectorAll('li > p')) as HTMLElement[];

    expect(listParagraphs.map((paragraph) => paragraph.textContent.trim())).toEqual(['Test1', 'Test2']);
    expect(listParagraphs.every((paragraph) => !paragraph.hasAttribute('data-indent'))).toBe(true);
    expect(normalisedHtml).not.toContain('data-indent');
    expect(normalisedHtml).not.toContain('&nbsp;');
  });

  it('should remove spacing contained in a nested Word list marker', () => {
    const wordHtml = `
      <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
        <span style="font-family: Symbol">
          <span style="mso-list: Ignore">&#8226;<span>&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
        </span>Test1
      </p>
      <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
        <span style="font-family: Symbol">
          <span style="mso-list: Ignore">&#8226;<span>&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
        </span>Test2
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<ul><li>Test1</li><li>Test2</li></ul>');
    expect(normalisedHtml).not.toContain('&nbsp;');
  });

  it('should retain supported Word formatting and remove Word layout styling', () => {
    const wordHtml = `
      <html>
        <body>
          <p class="MsoNormal" style="font-weight: 700;">Test Bold</p>
          <p class="MsoNormal" style="margin-left: 36pt; border-left: 1pt solid #bfbfbf; font-weight: bold; text-decoration: underline;">Test Indent</p>
          <p class="MsoNormal" style="border-left: 1pt solid #bfbfbf;">&nbsp;</p>
          <p class="MsoNormal"><span style="font-style: italic;">Test Italic</span></p>
          <p class="MsoNormal"><span style="text-decoration: underline;">Test Underline</span></p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraphs = Array.prototype.slice.call(normalisedDocument.querySelectorAll('p')) as HTMLElement[];
    const indentedParagraph = paragraphs.find((paragraph) => paragraph.textContent.trim() === 'Test Indent');

    expect(indentedParagraph.getAttribute('data-indent')).toBe('1');
    expectTextToHaveAncestorTags(normalisedHtml, 'Test Bold', ['strong']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Test Indent', ['strong', 'u']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Test Italic', ['em']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Test Underline', ['u']);
    expect(normalisedHtml).not.toContain('MsoNormal');
    expect(normalisedHtml).not.toContain('border-left');
    expect(normalisedHtml).not.toContain('style=');
    expect(normalisedHtml).not.toContain('class=');
  });

  it('should not apply Word table layout bold styling to a regular-weight date', () => {
    const wordHtml = `
      <html>
        <body>
          <table style="font-weight: bold;">
            <tbody>
              <tr style="font-weight: bold;">
                <td style="font-weight: bold;">20XX – 20XX</td>
                <td style="font-weight: bold;"><span style="font-weight: bold;">Senior Editor, Surat, Gujarat</span></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const boldText = Array.prototype.slice.call(normalisedDocument.querySelectorAll('strong'))
      .map((element: HTMLElement) => element.textContent);
    const rowText = normalisedDocument.querySelector('p').textContent;

    expect(boldText).not.toContain('20XX – 20XX');
    expectTextToHaveAncestorTags(normalisedHtml, 'Senior Editor, Surat, Gujarat', ['strong']);
    expect(rowText).toMatch(/20XX – 20XX\u00a0{12}Senior Editor, Surat, Gujarat/);
    expect(normalisedHtml).not.toContain('<table');
    expect(normalisedHtml).not.toContain('<td');
  });

  it('should retain Word title and section-heading semantics', () => {
    const wordHtml = `
      <html>
        <body>
          <p class="MsoTitle">ANEELA MOHAN</p>
          <p style="text-transform: uppercase; border-bottom: solid #bfbfbf 1pt;">Objective</p>
          <p>Resume objective text</p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<h1>ANEELA MOHAN</h1>');
    expect(normalisedHtml).toContain('<p><strong>OBJECTIVE</strong></p><hr>');
    expect(normalisedHtml).not.toContain('MsoTitle');
    expect(normalisedHtml).not.toContain('style=');
  });

  it('should convert a Word heading style without retaining a redundant bold mark', () => {
    const wordHtml = `
      <html>
        <body>
          <p class="MsoNormal"><span class="Heading2Char">Parental responsibility</span></p>
          <p>Regular paragraph text</p>
          <p class="Heading2">Other recitals</p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const regularParagraph = Array.prototype.slice.call(normalisedDocument.querySelectorAll('p'))
      .find((paragraph: HTMLElement) => paragraph.textContent === 'Regular paragraph text');

    expectTextToHaveAncestorTags(normalisedHtml, 'Parental responsibility', ['h1']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Other recitals', ['h1']);
    expect(normalisedDocument.querySelector('h1 strong, h1 b')).toBeNull();
    expect(regularParagraph.querySelector('strong')).toBeNull();

    component.editor.setContent(normalisedHtml);
    fixture.detectChanges();

    const renderedHeadings = Array.prototype.slice.call(
      fixture.nativeElement.querySelectorAll('.ProseMirror h1')
    ).map((heading: HTMLElement) => heading.textContent);
    expect(renderedHeadings).toEqual(['Parental responsibility', 'Other recitals']);
  });

  it('should convert a Word clipboard heading without retaining a redundant bold mark', () => {
    const wordHtml = `
      <html>
        <head>
          <style>
            p.word-heading { font: bold 12pt Times; }
            p.word-body { font: 12pt Times; }
          </style>
        </head>
        <body>
          <p class="word-heading">Parental responsibility</p>
          <p class="word-body">Regular paragraph text</p>
          <p class="word-heading">Other recitals</p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expectTextToHaveAncestorTags(normalisedHtml, 'Parental responsibility', ['h1']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Other recitals', ['h1']);
    expect(normalisedHtml).not.toContain('<strong>');
    expect(normalisedHtml).not.toContain('<style');
    expect(normalisedHtml).not.toContain('class=');
  });

  it('should retain a Word heading identified by its outline level', () => {
    const wordHtml = `
      <html>
        <head>
          <style>
            h2 { mso-outline-level: 2; }
            p.word-body { font: 12pt Times; }
          </style>
        </head>
        <body>
          <h2>Contact centre</h2>
          <p class="word-body">Such contact is to be supervised at the contact centre.</p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expectTextToHaveAncestorTags(normalisedHtml, 'Contact centre', ['h1']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Such contact is to be supervised at the contact centre.', ['p']);

    component.editor.setContent(normalisedHtml);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ProseMirror h1').textContent).toBe('Contact centre');
  });

  it('should infer a Word title from its large font size', () => {
    const normalisedHtml = component.normalisePastedHtml('<p><span style="font-size: 26pt;">ANEELA MOHAN</span></p>');

    expect(normalisedHtml).toContain('<h1>ANEELA MOHAN</h1>');
  });

  it('should convert an empty bordered Word paragraph into a section divider', () => {
    const wordHtml = `
      <p>OBJECTIVE</p>
      <p style="border-bottom: solid #bfbfbf 1pt;">&nbsp;</p>
      <p>Resume objective text</p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<p><strong>OBJECTIVE</strong></p>');
    expect(normalisedHtml).toContain('<hr>');
    expect(normalisedHtml).not.toContain('<p></p>');
  });

  it('should preserve repeated empty Word paragraphs', () => {
    const wordHtml = `
      <p>Contact details</p>
      <div><p>&nbsp;</p></div>
      <div><p>\u200b</p></div>
      <div><p>&nbsp;</p></div>
      <p>Objective</p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const emptyParagraphs = Array.prototype.slice.call(normalisedDocument.querySelectorAll('p'))
      .filter((paragraph: HTMLElement) => !(paragraph.textContent || '').replace(/\u00a0/g, ' ').trim());

    expect(emptyParagraphs.length).toBe(3);
  });

  it('should preserve repeated empty paragraphs entered in the editor', () => {
    const editorHtml = '<p>First line</p><p></p><p></p><p>Fourth line</p>';

    const normalisedHtml = component.normaliseRichTextValue(editorHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraphs = normalisedDocument.querySelectorAll('p');

    expect(paragraphs.length).toBe(4);
    expect(paragraphs[1].textContent).toBe('');
    expect(paragraphs[2].textContent).toBe('');
  });

  it('should retain Word paragraph indentation from shorthand margin styles', () => {
    const wordHtml = `
      <html>
        <body>
          <p style="margin: 0cm 0cm 0cm 72pt;">Test Indent</p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<p data-indent="2">Test Indent</p>');
  });

  it('should retain Word tab indentation as editor paragraph indentation', () => {
    const wordHtml = `
      <html>
        <body>
          <p>
            <span style="mso-tab-count: 1">&nbsp;&nbsp;&nbsp;&nbsp;</span><strong>Test Indent</strong>
          </p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraph = normalisedDocument.querySelector('p');

    expect(paragraph.dataset.indent).toBe('1');
    expect(paragraph.textContent.trim()).toBe('Test Indent');
    expect(paragraph.querySelector('strong').textContent).toBe('Test Indent');
    expect(normalisedHtml).not.toContain('mso-tab-count');
    expect(normalisedHtml).not.toContain('&nbsp;');
  });

  it('should preserve a Word tab between a date and job title as visible spacing', () => {
    const wordHtml = `
      <p>
        <span>20XX – 20XX</span><span style="mso-tab-count: 1"></span><strong>Senior Editor, Surat, Gujarat</strong>
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const text = normalisedDocument.querySelector('p').textContent;

    expect(text).toMatch(/20XX – 20XX\u00a0{12}Senior Editor, Surat, Gujarat/);
    expect(normalisedHtml).not.toContain('data-indent');
    expect(normalisedHtml).not.toContain('mso-tab-count');
  });

  it('should preserve a regular-weight Word date inside a bold experience row', () => {
    const wordHtml = `
      <p style="font-weight: bold;">
        <span style="font-weight: normal;">20XX – 20XX</span>
        <span style="mso-tab-count: 1"></span>
        <span>Senior Editor, Surat, Gujarat</span>
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expectTextToHaveAncestorTags(normalisedHtml, '20XX – 20XX', ['p']);
    expectTextToHaveAncestorTags(normalisedHtml, 'Senior Editor, Surat, Gujarat', ['strong']);

    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const walker = normalisedDocument.createTreeWalker(normalisedDocument.body, NodeFilter.SHOW_TEXT);
    let dateText = walker.nextNode();
    while (dateText && dateText.textContent.trim() !== '20XX – 20XX') {
      dateText = walker.nextNode();
    }
    expect(dateText.parentElement.closest('strong')).toBeNull();
  });

  it('should preserve a nested regular-weight date and spacing inside a bold Word row', () => {
    const wordHtml = `
      <p style="font-weight: bold;">
        <span>
          <span style="font-weight: 400;">20XX – 20XX</span>
          <span style="mso-tab-count: 1"></span>
          <span>Senior Editor, Surat, Gujarat</span>
        </span>
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraph = normalisedDocument.querySelector('p');
    const walker = normalisedDocument.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    let dateText = walker.nextNode();
    while (dateText && dateText.textContent.trim() !== '20XX – 20XX') {
      dateText = walker.nextNode();
    }

    expect(dateText).toBeTruthy();
    expect(dateText.parentElement.closest('strong')).toBeNull();
    expectTextToHaveAncestorTags(normalisedHtml, 'Senior Editor, Surat, Gujarat', ['strong']);
    expect(paragraph.textContent).toMatch(/20XX – 20XX\s{12,}Senior Editor, Surat, Gujarat/);
  });

  it('should add spacing between an adjacent regular-weight date range and bold job title', () => {
    const wordHtml = '<p>20XX – 20XX<strong>Copyeditor, Jaipur, Rajasthan</strong></p>';

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraph = normalisedDocument.querySelector('p');
    const dateText = paragraph.firstChild;

    expect(dateText.parentElement.closest('strong')).toBeNull();
    expectTextToHaveAncestorTags(normalisedHtml, 'Copyeditor, Jaipur, Rajasthan', ['strong']);
    expect(paragraph.textContent).toMatch(/20XX – 20XX\u00a0{12}Copyeditor, Jaipur, Rajasthan/);
  });

  it('should align a Word experience title with its indented company and description', () => {
    const wordHtml = `
      <table>
        <tbody>
          <tr>
            <td>20XX – 20XX</td>
            <td><strong>Senior Editor, Surat, Gujarat</strong></td>
          </tr>
        </tbody>
      </table>
      <p style="margin-left: 150pt;">Paarivaarik Samaachaar</p>
      <p style="margin-left: 150pt;">Edited news articles, features, and opinion pieces</p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const paragraphs = Array.prototype.slice.call(normalisedDocument.querySelectorAll('p')) as HTMLElement[];

    expect(paragraphs[0].textContent).toMatch(/20XX – 20XX\u00a0{12}Senior Editor, Surat, Gujarat/);
    expect(paragraphs[1].getAttribute('data-indent')).toBe('5');
    expect(paragraphs[2].getAttribute('data-indent')).toBe('5');
  });

  it('should normalise nested Word list paragraphs', () => {
    const wordHtml = `
      <html>
        <body>
          <div>
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span><strong>Bye</strong>
            </p>
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>World
            </p>
          </div>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<ul>');
    expect(normalisedHtml).toContain('<li><strong>Bye</strong></li>');
    expect(normalisedHtml).toContain('<li>World</li>');
    expect(normalisedHtml).not.toContain('MsoListParagraph');
    expect(normalisedHtml).not.toContain('mso-list');
  });

  it('should retain a Word bullet list nested beneath a numbered list item', () => {
    const wordHtml = `
      <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
        <span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span>First issue
      </p>
      <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
        <span style="mso-list:Ignore">2.<span>&nbsp;&nbsp;</span></span>Second issue
      </p>
      <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
        <span style="mso-list:Ignore">3.<span>&nbsp;&nbsp;</span></span>How often;
      </p>
      <p class="MsoListParagraph" style="mso-list:l1 level2 lfo2">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>test1
      </p>
      <p class="MsoListParagraph" style="mso-list:l1 level2 lfo2">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>test2
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const numberedItems = normalisedDocument.querySelectorAll('body > ol > li');
    const nestedBulletItems = numberedItems[2].querySelectorAll(':scope > ul > li');

    expect(numberedItems.length).toBe(3);
    expect(numberedItems[2].firstChild.textContent.trim()).toBe('How often;');
    expect(Array.from(nestedBulletItems).map((item) => item.textContent.trim())).toEqual(['test1', 'test2']);
    expect(normalisedDocument.querySelector('body > ul')).toBeNull();
  });

  it('should retain nested numbered, lettered and Roman Word list styles', () => {
    const wordHtml = `
      <p class="MsoListParagraph" style="margin-left:0pt;mso-list:l1 level1 lfo1">
        <span style="mso-list:Ignore">5.<span>&nbsp;</span></span>The issues that the court needed to decide were as follows:
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l1 level2 lfo1">
        <span style="mso-list:Ignore">a.<span>&nbsp;</span></span>with whom the child should live;
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l1 level2 lfo1">
        <span style="mso-list:Ignore">b.<span>&nbsp;</span></span>whether they should spend time with the other parent;
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l1 level2 lfo1">
        <span style="mso-list:Ignore">c.<span>&nbsp;</span></span>how often;
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level3 lfo1">
        <span style="mso-list:Ignore">i.<span>&nbsp;</span></span>whether there should be overnight stays;
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level3 lfo1">
        <span style="mso-list:Ignore">ii.<span>&nbsp;</span></span>whether it should be supervised;
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l1 level2 lfo1">
        <span style="mso-list:Ignore">d.<span>&nbsp;</span></span>the child's education;
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const documentElement = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const numberedList = documentElement.body.querySelector(':scope > ol[start="5"]');
    const letteredList = numberedList.querySelector(':scope > li > ol[type="a"]');
    const romanList = letteredList.querySelector(':scope > li:nth-child(3) > ol[type="i"]');

    expect(numberedList).not.toBeNull();
    expect(letteredList).not.toBeNull();
    expect(romanList).not.toBeNull();
    expect(Array.from(letteredList.children).map((item) => item.firstChild.textContent.trim())).toEqual([
      'with whom the child should live;',
      'whether they should spend time with the other parent;',
      'how often;',
      "the child's education;"
    ]);
    expect(Array.from(romanList.children).map((item) => item.textContent.trim())).toEqual([
      'whether there should be overnight stays;',
      'whether it should be supervised;'
    ]);
  });

  it('should retain nested list text when a Word wrapper contains both the marker and content', () => {
    const wordHtml = `
      <p class="MsoListParagraph" style="margin-left:0pt;mso-list:l1 level1 lfo1">
        <span style="mso-list:Ignore">1.<span>&nbsp;</span></span>The applicant is <em>[applicant name]</em>
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l1 level2 lfo1">
        <span><span style="mso-list:Ignore">a.<span>&nbsp;</span></span>The first respondent is <em>respondent name</em></span>
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level3 lfo1">
        <span><span style="mso-list:Ignore">i.<span>&nbsp;</span></span>The second respondent is <em>respondent name</em></span>
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level3 lfo1">
        <span><span style="mso-list:Ignore">ii.<span>&nbsp;</span></span>The third respondent is <em>respondent name</em></span>
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const documentElement = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const numberedItem = documentElement.body.querySelector(':scope > ol > li');
    const letteredItem = numberedItem.querySelector(':scope > ol[type="a"] > li');
    const romanItems = letteredItem.querySelectorAll(':scope > ol[type="i"] > li');
    const ownText = (item: Element): string => Array.from(item.childNodes)
      .filter((node: Node) => !(node instanceof HTMLElement) || !['OL', 'UL'].includes(node.tagName))
      .map((node: Node) => node.textContent)
      .join('')
      .trim();

    expect(ownText(numberedItem)).toBe('The applicant is [applicant name]');
    expect(ownText(letteredItem)).toBe('The first respondent is respondent name');
    expect(Array.from(romanItems).map((item) => item.textContent.trim())).toEqual([
      'The second respondent is respondent name',
      'The third respondent is respondent name'
    ]);
    expect(normalisedHtml).not.toContain('mso-list:Ignore');
  });

  it('should retain nested lettered and Roman list styles pasted from Outlook HTML', () => {
    const outlookHtml = `
      <style>
        ol.outlook-alpha { list-style-type: lower-alpha; }
        ol.outlook-roman { list-style-type: lower-roman; }
      </style>
      <ol>
        <li>Number list
          <ol class="outlook-alpha">
            <li>Indent list to alphabet
              <ol class="outlook-roman">
                <li>Roman numerals as well</li>
                <li>Second Roman item</li>
              </ol>
            </li>
            <li>Second alphabet item</li>
          </ol>
        </li>
      </ol>`;

    const normalisedHtml = component.normalisePastedHtml(outlookHtml);
    const documentElement = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const letteredList = documentElement.body.querySelector('ol > li > ol[type="a"]');
    const romanList = letteredList?.querySelector('ol[type="i"]');

    expect(letteredList).not.toBeNull();
    expect(romanList).not.toBeNull();
    expect(Array.from(romanList.children).map((item) => item.textContent.trim())).toEqual([
      'Roman numerals as well',
      'Second Roman item'
    ]);
  });

  it('should use an implicit zero margin as the first Word list indentation level', () => {
    const wordHtml = `
      <p class="MsoListParagraphCxSpFirst" style="text-indent:-18pt;mso-list:l1 level1 lfo1">
        <span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span>Hello
      </p>
      <p class="MsoListParagraphCxSpMiddle" style="text-indent:-18pt;mso-list:l1 level1 lfo1">
        <span style="mso-list:Ignore">2.<span>&nbsp;&nbsp;</span></span>World
      </p>
      <p class="MsoListParagraphCxSpMiddle" style="text-indent:-18pt;mso-list:l1 level1 lfo1">
        <span style="mso-list:Ignore">3.<span>&nbsp;&nbsp;</span></span>Test
      </p>
      <p class="MsoListParagraphCxSpMiddle" style="margin-left:54pt;text-indent:-18pt;mso-list:l0 level1 lfo2">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>Asaas
      </p>
      <p class="MsoListParagraphCxSpLast" style="margin-left:54pt;text-indent:-18pt;mso-list:l0 level1 lfo2">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>sfasf
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const numberedItems = normalisedDocument.querySelectorAll('body > ol > li');
    const nestedBulletItems = numberedItems[2].querySelectorAll(':scope > ul > li');

    expect(numberedItems.length).toBe(3);
    expect(Array.from(nestedBulletItems).map((item) => item.textContent.trim())).toEqual(['Asaas', 'sfasf']);
    expect(normalisedDocument.querySelector('body > ul')).toBeNull();

    component.editor.setContent(normalisedHtml);
    fixture.detectChanges();

    const editorElement = fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
    expect(editorElement.querySelector(':scope > ol > li:nth-child(3) > ul'))
      .withContext(editorElement.innerHTML)
      .toBeTruthy();
  });

  it('should repair a nested Word list placed directly inside its parent list', () => {
    const wordHtml = `
      <ol>
        <li>Hello</li>
        <li>World</li>
        <li>Test</li>
        <ul>
          <li>Asaas</li>
          <li>sfasf</li>
        </ul>
      </ol>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const numberedItems = normalisedDocument.querySelectorAll('body > ol > li');
    const nestedBulletItems = numberedItems[2].querySelectorAll(':scope > ul > li');

    expect(numberedItems.length).toBe(3);
    expect(Array.from(nestedBulletItems).map((item) => item.textContent.trim())).toEqual(['Asaas', 'sfasf']);
    expect(normalisedDocument.querySelector('body > ul')).toBeNull();

    component.editor.setContent(normalisedHtml);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ProseMirror > ol > li:nth-child(3) > ul')).toBeTruthy();
  });

  it('should retain a nested Word numbered list when Word restarts it at level one', () => {
    const wordHtml = `
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l0 level1 lfo1">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span><strong>Bold item text</strong>
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l0 level2 lfo1">
        <span style="mso-list:Ignore">&#9702;<span>&nbsp;&nbsp;</span></span><em>Italic item text</em>
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l0 level2 lfo1">
        <span style="mso-list:Ignore">&#9702;<span>&nbsp;&nbsp;</span></span>Arial 14pt item text
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level1 lfo2">
        <span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span><u>Some numbering 1 with underline</u>
      </p>
      <p class="MsoListParagraph" style="margin-left:72pt;mso-list:l1 level1 lfo2">
        <span style="mso-list:Ignore">2.<span>&nbsp;&nbsp;</span></span><strong>Some numbering 2 with Bold</strong>
      </p>
      <p class="MsoListParagraph" style="margin-left:36pt;mso-list:l0 level1 lfo1">
        <span style="mso-list:Ignore">&#8226;<span>&nbsp;&nbsp;</span></span>Item containing a link: example.com
      </p>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);
    const normalisedDocument = new DOMParser().parseFromString(normalisedHtml, 'text/html');
    const topLevelItems = normalisedDocument.querySelectorAll('body > ul > li');
    const nestedBulletItems = topLevelItems[0].querySelectorAll(':scope > ul > li');
    const numberedItems = nestedBulletItems[1].querySelectorAll(':scope > ol > li');

    expect(topLevelItems.length).toBe(2);
    expect(Array.from(nestedBulletItems).map((item) => item.firstChild.textContent.trim())).toEqual([
      'Italic item text',
      'Arial 14pt item text'
    ]);
    expect(Array.from(numberedItems).map((item) => item.textContent.trim())).toEqual([
      'Some numbering 1 with underline',
      'Some numbering 2 with Bold'
    ]);
    expect(topLevelItems[1].textContent.trim()).toBe('Item containing a link: example.com');

    component.editor.setContent(normalisedHtml);
    fixture.detectChanges();

    const editorNumberedList = fixture.nativeElement.querySelector(
      '.ProseMirror > ul > li:first-child > ul > li:nth-child(2) > ol'
    );
    expect(editorNumberedList).toBeTruthy();
  });

  it('should retain ordered-list numbering when Word wraps items in separate containers', () => {
    const wordHtml = `
      <html>
        <body>
          <div>
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span><strong>Hello</strong>
            </p>
          </div>
          <div>
            <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">
              <span style="mso-list:Ignore">2.<span>&nbsp;&nbsp;</span></span><strong>World</strong>
            </p>
          </div>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(wordHtml);

    expect(normalisedHtml).toContain('<ol><li><strong>Hello</strong></li></ol>');
    expect(normalisedHtml).toContain('<ol start="2"><li><strong>World</strong></li></ol>');
  });

  it('should strip unsupported link and image markup from pasted HTML', () => {
    const pastedHtml = `
      <html>
        <body>
          <p><a href="https://someurl.com"><strong>https://someurl.com</strong></a></p>
          <p><img src="https://someurl.com/image.png" alt="Unsupported image"></p>
        </body>
      </html>`;

    const normalisedHtml = component.normalisePastedHtml(pastedHtml);

    expect(normalisedHtml).toContain('<strong>https://someurl.com</strong>');
    expect(normalisedHtml).not.toContain('<a');
    expect(normalisedHtml).not.toContain('href=');
    expect(normalisedHtml).not.toContain('<img');
  });

  it('should remove XSS payloads from pasted rich text while retaining supported formatting', () => {
    const pastedHtml = `
      <section>
        <p onclick="alert(1)">Safe <strong onmouseover="alert(2)">bold text</strong></p>
        <script>alert(3)</script>
        <style>body { display: none; }</style>
        <iframe srcdoc="<script>alert(4)</script>"></iframe>
        <svg onload="alert(5)"><script>alert(6)</script></svg>
        <math><mtext onclick="alert(7)">unsafe</mtext></math>
        <form action="javascript:alert(8)"><input autofocus onfocus="alert(9)"></form>
      </section>`;

    const normalisedHtml = component.normalisePastedHtml(pastedHtml);

    expect(normalisedHtml).toContain('<p>Safe <strong>bold text</strong></p>');
    expect(normalisedHtml).not.toContain('alert(');
    expect(normalisedHtml).not.toContain('onclick');
    expect(normalisedHtml).not.toContain('onmouseover');
    expect(normalisedHtml).not.toContain('<script');
    expect(normalisedHtml).not.toContain('<style');
    expect(normalisedHtml).not.toContain('<iframe');
    expect(normalisedHtml).not.toContain('<svg');
    expect(normalisedHtml).not.toContain('<math');
    expect(normalisedHtml).not.toContain('<form');
  });

  it('should remove XSS payloads from an existing editor form value', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue(
      '<p onmouseenter="alert(1)">Safe <u>text</u></p><object data="javascript:alert(2)"></object><script>alert(3)</script>'
    );
    tick();

    const value = formGroup.controls[FIELD_ID].value;
    expect(value).toContain('<p>Safe <u>text</u></p>');
    expect(value).not.toContain('alert(');
    expect(value).not.toContain('onmouseenter');
    expect(value).not.toContain('<object');
    expect(value).not.toContain('<script');
  }));

  it('should normalise unsupported link markup from the editor form value', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p><a href="https://someurl.com">https://someurl.com</a></p>');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('https://someurl.com');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('<a');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('href=');
  }));

  it('should normalise markdown links from the editor form value', fakeAsync(() => {
    formGroup.controls[FIELD_ID].setValue('<p>[https://someurl.com](https://someurl.com)</p>');
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<p>https://someurl.com</p>');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('[https://someurl.com]');
    expect(formGroup.controls[FIELD_ID].value).not.toContain('](https://someurl.com)');
  }));
});

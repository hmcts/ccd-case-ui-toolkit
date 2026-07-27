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

  const expectTextToHaveAncestorTags = (html: string, text: string, tagNames: string[]): void => {
    const container = document.createElement('div');
    container.innerHTML = html;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();

    while (textNode && textNode.textContent !== text) {
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
      'Ordered List',
      'Bullet List',
      'Decrease Indent',
      'Increase Indent'
    ]);
  });

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

  it('should keep editor height fixed and wrap long text inside the editor', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const editorContent = fixture.nativeElement.querySelector('.NgxEditor__Content') as HTMLElement;
    const editorContentStyle = window.getComputedStyle(editorContent);

    expect(editorContentStyle.height).toBe('255px');
    expect(editorContentStyle.overflowX).toBe('hidden');
    expect(editorContentStyle.overflowY).toBe('auto');
    expect(editorContentStyle.overflowWrap).toBe('anywhere');
    expect(editorContentStyle.wordBreak).toBe('break-word');
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
    const undoButton = fixture.nativeElement.querySelector('button[aria-label="Undo"]');

    expect(boldButton.getAttribute('aria-keyshortcuts')).toBe('Control+B');
    expect(boldButton.getAttribute('aria-pressed')).toBe('true');
    expect(paragraphButton.getAttribute('aria-pressed')).toBe('false');
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

    clickToolbarButton('Ordered List');
    tick();

    component.editor.commands.insertText('First item').exec();
    tick();

    expect(formGroup.controls[FIELD_ID].value).toContain('<ol>');
    expect(formGroup.controls[FIELD_ID].value).toContain('<li><p>First item</p></li>');
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

    expect(normalisedHtml).toContain('<p data-indent="1"><strong>Test Indent</strong></p>');
    expect(normalisedHtml).not.toContain('mso-tab-count');
    expect(normalisedHtml).not.toContain('&nbsp;');
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

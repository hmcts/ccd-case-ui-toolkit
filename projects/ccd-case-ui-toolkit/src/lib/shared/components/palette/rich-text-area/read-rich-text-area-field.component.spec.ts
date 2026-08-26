import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { ReadRichTextAreaFieldComponent } from './read-rich-text-area-field.component';

const FIELD_ID = 'ReadOnlyRichText';
const FIELD_TYPE: FieldType = {
  id: 'RichTextArea',
  type: 'RichTextArea'
};
const VALUE = '<p><strong>Hello</strong> <em>world</em></p>';

describe('ReadRichTextAreaFieldComponent', () => {
  let fixture: ComponentFixture<ReadRichTextAreaFieldComponent>;
  let component: ReadRichTextAreaFieldComponent;
  let formGroup: FormGroup;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          ReadRichTextAreaFieldComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadRichTextAreaFieldComponent);
    component = fixture.componentInstance;
    formGroup = new FormGroup({});
    component.caseField = ({
      id: FIELD_ID,
      label: 'Rich text',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    component.formGroup = formGroup;
    fixture.detectChanges();
  }));

  it('should register readonly case field value with form group', () => {
    expect(formGroup.controls[FIELD_ID]).toBeTruthy();
    expect(formGroup.controls[FIELD_ID].value).toBe(VALUE);
  });

  it('should render supplied rich text HTML', () => {
    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement;

    expect(readValue.innerHTML).toContain('<strong>Hello</strong>');
    expect(readValue.innerHTML).toContain('<em>world</em>');
  });

  it('should display rich text using the same formatting rules as the editor', () => {
    component.caseField.value = '<p><strong>Heading</strong></p><p data-indent="2">Indented text</p>'
      + '<ul><li><p>First item</p><ul><li><p>Nested item</p></li></ul></li></ul>';
    fixture.detectChanges();

    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement as HTMLElement;
    const boldText = readValue.querySelector('strong') as HTMLElement;
    const indentedText = readValue.querySelector('.ccd-rich-text-indent-2') as HTMLElement;
    const listItem = readValue.querySelector('li') as HTMLElement;
    const listParagraph = readValue.querySelector('li > p') as HTMLElement;
    const nestedList = readValue.querySelector('li > ul') as HTMLElement;

    expect(getComputedStyle(boldText).fontWeight).toBe('700');
    expect(indentedText).not.toBeNull();
    expect(getComputedStyle(indentedText).marginLeft).toBe('80px');
    expect(getComputedStyle(listItem).marginBottom).toBe('5px');
    expect(getComputedStyle(listParagraph).margin).toBe('0px');
    expect(getComputedStyle(nestedList).marginTop).toBe('5px');
  });

  it('should render every empty paragraph as a visible blank line', () => {
    component.caseField.value = '<p>First line</p><p></p><p></p><p>Fourth line</p>';
    fixture.detectChanges();

    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement as HTMLElement;
    const emptyParagraphs = Array.prototype.slice.call(readValue.querySelectorAll('p:empty')) as HTMLElement[];

    expect(emptyParagraphs.length).toBe(2);
    emptyParagraphs.forEach((paragraph) => {
      expect(getComputedStyle(paragraph, '::before').content).not.toBe('none');
    });
  });

  it('should preserve supported lettered and Roman numeral list styles', () => {
    component.caseField.value = `
      <ol type="a"><li><p>Lettered item</p></li></ol>
      <ol type="i"><li><p>Roman item</p></li></ol>`;
    fixture.detectChanges();

    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement as HTMLElement;
    const letteredList = readValue.querySelector('ol[type="a"]') as HTMLElement;
    const romanList = readValue.querySelector('ol[type="i"]') as HTMLElement;

    expect(letteredList).not.toBeNull();
    expect(romanList).not.toBeNull();
    expect(getComputedStyle(letteredList).listStyleType).toBe('lower-alpha');
    expect(getComputedStyle(romanList).listStyleType).toBe('lower-roman');
  });

  it('should discard unsupported ordered list styles', () => {
    component.caseField.value = '<ol type="A"><li><p>Item</p></li></ol>';
    fixture.detectChanges();

    const list = fixture.debugElement.query(By.css('.ccd-rich-text-area-read ol')).nativeElement as HTMLElement;
    expect(list.hasAttribute('type')).toBe(false);
  });

  it('should sanitize unsafe HTML before rendering', () => {
    component.caseField.value = `
      <p onclick="alert(1)">Safe <strong onmouseover="alert(2)">text</strong></p>
      <a href="javascript:alert(3)">unsafe link</a>
      <img src="x" onerror="alert(4)">
      <script>alert(5)</script>
      <iframe srcdoc="<script>alert(6)</script>"></iframe>
      <svg onload="alert(7)"><script>alert(8)</script></svg>`;
    fixture.detectChanges();

    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement;
    expect(readValue.innerHTML).toContain('<p>Safe <strong>text</strong></p>');
    expect(readValue.textContent).toContain('unsafe link');
    expect(readValue.innerHTML).not.toContain('<a');
    expect(readValue.innerHTML).not.toContain('<script>');
    expect(readValue.innerHTML).not.toContain('onerror');
    expect(readValue.innerHTML).not.toContain('onclick');
    expect(readValue.innerHTML).not.toContain('<iframe');
    expect(readValue.innerHTML).not.toContain('<svg');
    expect(readValue.innerHTML).not.toContain('javascript:');
  });
});

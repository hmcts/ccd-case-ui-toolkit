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

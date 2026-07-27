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
    component.caseField.value = '<p>Safe</p><img src="x" onerror="alert(1)"><script>alert(1)</script>';
    fixture.detectChanges();

    const readValue = fixture.debugElement.query(By.css('.ccd-rich-text-area-read')).nativeElement;
    expect(readValue.innerHTML).toContain('<p>Safe</p>');
    expect(readValue.innerHTML).not.toContain('<script>');
    expect(readValue.innerHTML).not.toContain('onerror');
  });
});

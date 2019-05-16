import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadPhoneUKFieldComponent } from './read-phone-uk-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('ReadPhoneUKFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'PhoneUK',
    type: 'PhoneUK'
  };
  const VALUE = '07123456789';
  const EMPTY = '';
  const CASE_FIELD: CaseField = <CaseField>({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  });

  let fixture: ComponentFixture<ReadPhoneUKFieldComponent>;
  let component: ReadPhoneUKFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadPhoneUKFieldComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadPhoneUKFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render provided phone number as string', () => {
    component.caseField.value = VALUE;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual(VALUE);
  });

  it('render undefined value as empty string', () => {
    component.caseField.value = undefined;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual(EMPTY);
  });

  it('render null value as empty string', () => {
    component.caseField.value = null;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual(EMPTY);
  });
});

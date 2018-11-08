import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadEmailFieldComponent } from './read-email-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { text } from '../../../test/helpers';

describe('ReadEmailFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'Email',
    type: 'Email'
  };
  const VALUE = 'ccd@hmcts.net';
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  };
  const EMPTY = '';

  let fixture: ComponentFixture<ReadEmailFieldComponent>;
  let component: ReadEmailFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadEmailFieldComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadEmailFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render provided email as string', () => {
    component.caseField.value = VALUE;
    fixture.detectChanges();
    expect(text(de)).toEqual(VALUE);
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

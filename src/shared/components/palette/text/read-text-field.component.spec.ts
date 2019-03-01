import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadTextFieldComponent } from './read-text-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { newCaseField } from '../../../fixture';

describe('ReadTextFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const VALUE = 'Hello world';
  const CASE_FIELD: CaseField = newCaseField('x', 'X', null, FIELD_TYPE, 'READONLY').withValue(VALUE).build();

  let fixture: ComponentFixture<ReadTextFieldComponent>;
  let component: ReadTextFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadTextFieldComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadTextFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render provided value as text', () => {
    component.caseField.value = VALUE;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual(VALUE.toString());
  });

  it('render undefined value as empty string', () => {
    component.caseField.value = undefined;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual('');
  });

  it('render null value as empty string', () => {
    component.caseField.value = null;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual('');
  });
});

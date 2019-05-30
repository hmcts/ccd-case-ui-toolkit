import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadNumberFieldComponent } from './read-number-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseReferencePipe } from '../../../pipes/case-reference';

describe('ReadNumberFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'Number',
    type: 'Number'
  };
  const VALUE = 42;
  const CASE_FIELD: CaseField = <CaseField>({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  });

  let fixture: ComponentFixture<ReadNumberFieldComponent>;
  let component: ReadNumberFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadNumberFieldComponent, CaseReferencePipe
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadNumberFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render provided value as number', () => {
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

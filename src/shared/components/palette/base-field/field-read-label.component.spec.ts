import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { text } from '../../../test/helpers';
import { FieldReadLabelComponent } from './field-read-label.component';

const CASE_FIELD: CaseField = <CaseField>({
  id: 'PersonFirstName',
  label: 'First name',
  field_type: {
    id: 'Text',
    type: 'Text'
  },
  display_context: 'OPTIONAL',
  value: 'Johnny'
});

const CASE_FIELD_OF_LABEL_TYPE: CaseField = <CaseField>({
  id: 'PersonFirstName',
  label: 'First name',
  field_type: {
    id: 'Text',
    type: 'Label'
  },
  display_context: 'OPTIONAL',
  value: 'Johnny'
});
const BY_FIELD_LABEL = By.css('.case-field__label');

describe('FieldReadLabelComponent', () => {

  let fixture: ComponentFixture<FieldReadLabelComponent>;
  let component: FieldReadLabelComponent;
  let de: DebugElement;

  beforeEach(async(() => {

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule
        ],
        declarations: [
          FieldReadLabelComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(FieldReadLabelComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.withLabel = true;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should display label when `withLabel` is true', () => {
    component.withLabel = true;
    fixture.detectChanges();

    let label = de.query(BY_FIELD_LABEL);
    expect(label).toBeTruthy();
    expect(text(label)).toEqual(CASE_FIELD.label);
  });

  it('should NOT display label when `withLabel` is true but case field is of Label type', () => {
    component.caseField = CASE_FIELD_OF_LABEL_TYPE;
    component.withLabel = true;
    fixture.detectChanges();

    let label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });

  it('should NOT display label when `withLabel` is false', () => {
    component.withLabel = false;
    fixture.detectChanges();

    let label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });
});

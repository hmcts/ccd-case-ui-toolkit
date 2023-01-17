import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField, FieldType } from '../../../domain/definition';
import { createFieldType, newCaseField } from '../../../fixture';
import { text } from '../../../test/helpers';
import { FieldReadLabelComponent } from './field-read-label.component';

const CASE_FIELD: CaseField = newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL')
  .withValue('Johnny').build();

const CASE_REFERENCE_TYPE: FieldType = createFieldType('TextCaseReference', 'Text', [], null);
const CASE_REFERENCE: CaseField = newCaseField('CaseReference', 'Case Reference', null, CASE_REFERENCE_TYPE, 'READONLY').build();
const CASE_LINK_TYPE: FieldType = createFieldType('CaseLink', 'Complex', [CASE_REFERENCE], null);
const CASE_LINK_FIELD: CaseField = newCaseField('CaseLinkField', 'Case Link', null, CASE_LINK_TYPE, 'OPTIONAL')
  .withValue('Johnny').build();

const CASE_FIELD_OF_LABEL_TYPE: CaseField = newCaseField('PersonFirstName', 'First name', null,
  createFieldType('Text', 'Label'), 'OPTIONAL').withValue('Johnny').build();
const BY_FIELD_LABEL = By.css('.case-field__label');

describe('FieldReadLabelComponent', () => {

  let fixture: ComponentFixture<FieldReadLabelComponent>;
  let component: FieldReadLabelComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {

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

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeTruthy();
    expect(text(label)).toEqual(CASE_FIELD.label);
  });

  it('should NOT display label when `withLabel` is true but case field is of Label type', () => {
    component.caseField = CASE_FIELD_OF_LABEL_TYPE;
    component.withLabel = true;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });

  it('should NOT display label when `withLabel` is false', () => {
    component.withLabel = false;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });

  it('should display label for a CaseLink', () => {
    component.caseField = CASE_LINK_FIELD;
    component.withLabel = true;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeTruthy();
    expect(text(label)).toEqual(CASE_LINK_FIELD.label);
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelFieldComponent } from './label-field.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockComponent } from 'ng2-mock-component';
import { LabelSubstitutorDirective } from '../../../directives/substitutor/label-substitutor.directive';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { LabelSubstitutionService } from '../../../directives/substitutor/services/label-substitution.service';
import { CaseReferencePipe } from '../../utils/case-reference.pipe'

describe('LabelFieldComponent', () => {

  const $CONTENT = By.css('dl>dt ccd-markdown');

  const FIELD_TYPE: FieldType = {
    id: 'Label',
    type: 'Label'
  };

  const CASE_FIELD: CaseField = {
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  };

  const CASE_FIELD_VALUE_UNDEFINED: CaseField = {
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: undefined
  };

  const LABEL_CASE_FIELD: CaseField = {
    id: 'field',
    label: '${label}',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  };

  const EVENT_CASE_FIELDS: CaseField[] = [
    CASE_FIELD
  ];

  let MarkdownComponent: any = MockComponent({
    selector: 'ccd-markdown', inputs: [
      'content'
    ]
  });
  let fixture: ComponentFixture<LabelFieldComponent>;
  let component: LabelFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          LabelFieldComponent,
          LabelSubstitutorDirective,
          MarkdownComponent
        ],
        providers: [
          FieldsUtils,
          LabelSubstitutionService,
          CaseReferencePipe,
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(LabelFieldComponent);
  }));

  describe('LabelFieldComponent without label substitution and value undefined', () => {
    beforeEach(() => {
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD_VALUE_UNDEFINED;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render a table with the field label in the markdown tag in the header', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD.label);
    });
  });

  describe('LabelFieldComponent without label substitution', () => {
    beforeEach(() => {
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render a table with the field label in the markdown tag in the header', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD.value);
    });
  });

  describe('LabelFieldComponent with label substitution ie with some value', () => {
    beforeEach(() => {
      component = fixture.componentInstance;

      component.caseField = LABEL_CASE_FIELD;
      component.eventFields = EVENT_CASE_FIELDS;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render label after substitution of fields in label', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD.value);
    });
  });
});

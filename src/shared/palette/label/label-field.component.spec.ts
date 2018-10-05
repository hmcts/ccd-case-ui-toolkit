import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelFieldComponent } from './label-field.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldType } from '../../domain/definition/field-type.model';
import { MockComponent } from 'ng2-mock-component';
import { LabelSubstitutorDirective } from '../../substitutor/label-substitutor.directive';
import { LabelSubstitutionService } from '../../case-editor/label-substitution.service';
import { FieldsUtils } from '../../utils/fields.utils';

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

  let MarkdownComponent: any = MockComponent({ selector: 'ccd-markdown', inputs: [
    'content'
  ]});
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
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(LabelFieldComponent);
  }));

  describe('LabelFieldComponent without label substitution', () => {
    beforeEach(() => {
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render a table with the field label in the markdown tag in the header', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD.label);
    });
  });

  describe('LabelFieldComponent with label substitution', () => {
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

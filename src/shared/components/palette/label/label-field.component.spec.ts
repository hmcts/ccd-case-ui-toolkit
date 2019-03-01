import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelFieldComponent } from './label-field.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockComponent } from 'ng2-mock-component';
import { LabelSubstitutorDirective } from '../../../directives/substitutor/label-substitutor.directive';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { PlaceholderService } from '../../../directives/substitutor/services/placeholder.service';
import { newCaseField } from '../../../fixture';

describe('LabelFieldComponent', () => {

  const $CONTENT = By.css('dl>dt ccd-markdown');

  const FIELD_TYPE: FieldType = {
    id: 'Label',
    type: 'Label'
  };
  const CASE_FIELD_WITH_NO_VALUE: CaseField = newCaseField('label', 'Label Field Label', null, FIELD_TYPE, 'OPTIONAL').build();
  const CASE_FIELD: CaseField = newCaseField('label', 'Label Field Label', null, FIELD_TYPE, 'OPTIONAL')
    .withValue('Label Field Value').build();

  const LABEL_CASE_FIELD: CaseField = newCaseField('field', '${label}', null, FIELD_TYPE, 'OPTIONAL')
    .withValue('Label Field Value').build();

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
          PlaceholderService,
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(LabelFieldComponent);
  }));

  describe('LabelFieldComponent without label substitution', () => {
    beforeEach(() => {
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD_WITH_NO_VALUE;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render a table with the field label in the markdown tag in the header', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD_WITH_NO_VALUE.label);
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

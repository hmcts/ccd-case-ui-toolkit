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

describe('LabelFieldComponent', () => {

  const $CONTENT = By.css('dl>dt ccd-markdown');

  const FIELD_TYPE: FieldType = {
    id: 'Label',
    type: 'Label'
  };
  const CASE_FIELD_WITH_NO_VALUE: CaseField = <CaseField>({
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
  });
  const CASE_FIELD: CaseField = <CaseField>({
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  });

  const LABEL_CASE_FIELD: CaseField = <CaseField>({
    id: 'field',
    label: '${label}',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  });

  const CASE_FIELDS: CaseField[] = [
    CASE_FIELD
  ];

  const MarkdownComponent: any = MockComponent({
    selector: 'ccd-markdown',
    inputs: ['content', 'markdownUseHrefAsRouterLink']
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
      component.caseFields = CASE_FIELDS;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('Should render label after substitution of fields in label', () => {
      expect(de.query($CONTENT).nativeElement.getAttribute('ng-reflect-content')).toBe(CASE_FIELD.value);
    });
  });
});

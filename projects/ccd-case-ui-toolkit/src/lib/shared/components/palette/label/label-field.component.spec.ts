import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { LabelSubstitutorDirective } from '../../../directives/substitutor/label-substitutor.directive';
import { PlaceholderService } from '../../../directives/substitutor/services/placeholder.service';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { LabelFieldComponent } from './label-field.component';
import { RpxTranslatePipe, RpxTranslationConfig, RpxTranslationService } from 'rpx-xui-translation';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('LabelFieldComponent', () => {
  const $CONTENT = By.css('dl>dt ccd-markdown');

  const FIELD_TYPE: FieldType = {
    id: 'Label',
    type: 'Label'
  };
  const CASE_FIELD_WITH_NO_VALUE: CaseField = ({
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
  }) as CaseField;
  const CASE_FIELD: CaseField = ({
    id: 'label',
    label: 'Label Field Label',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  }) as CaseField;

  const LABEL_CASE_FIELD: CaseField = ({
    id: 'field',
    label: '${label}',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: 'Label Field Value'
  }) as CaseField;

  const CASE_FIELDS: CaseField[] = [
    CASE_FIELD
  ];

  const markdownComponentMock: any = MockComponent({
    selector: 'ccd-markdown',
    inputs: ['content']
  });
  let fixture: ComponentFixture<LabelFieldComponent>;
  let component: LabelFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          LabelFieldComponent,
          LabelSubstitutorDirective,
          markdownComponentMock
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          RpxTranslatePipe,
          RpxTranslationService,
          RpxTranslationConfig,
          HttpClient,
          HttpHandler
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

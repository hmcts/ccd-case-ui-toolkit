import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteDateFieldComponent } from './write-date-field.component';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { LogService } from '../../../services/logging/log.service';
import { FormModule } from '../../../../components/form/form.module';
import { AbstractAppConfig } from '../../../../app.config';

const FIELD_ID = 'CreatedAt';
const FIELD_TYPE: FieldType = {
  id: 'Date',
  type: 'Date'
};
const VALUE = '2017-07-26';
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteDateFieldComponent', () => {

  let fixture: ComponentFixture<WriteDateFieldComponent>;
  let component: WriteDateFieldComponent;
  let de: DebugElement;

  let appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getLoggingCaseFieldList']);
  appConfig.getLoggingCaseFieldList.and.returnValue('respondents,staffUploadedDocuments');

  let logService = new LogService(appConfig);
  let caseFieldService = new CaseFieldService(logService);

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule,
          FormModule,
        ],
        declarations: [
          WriteDateFieldComponent,
        ],
        providers: [
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDateFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
  });
});

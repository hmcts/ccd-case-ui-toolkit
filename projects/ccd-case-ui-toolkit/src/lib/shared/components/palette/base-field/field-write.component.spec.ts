import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { of } from 'rxjs';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { WizardPage } from '../../case-editor/domain';
import { PaletteService } from '../palette.service';
import { FieldWriteComponent } from './field-write.component';

import createSpyObj = jasmine.createSpyObj;

const CLASS = 'person-first-name-cls';

@Component({
  template: `
    <div class="${CLASS}"></div>
  `
})
class FieldTestComponent {}

describe('FieldWriteComponent', () => {

  const CASE_FIELD: CaseField = plainToClassFromExist(new CaseField(), {
    id: 'PersonFirstName',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    display_context: 'OPTIONAL',
    label: 'First name',
  });

  let fixture: ComponentFixture<FieldWriteComponent>;
  let component: FieldWriteComponent;
  let de: DebugElement;

  let paletteService: any;
  let formValidatorService: any;

  let formGroup: FormGroup;
  const caseFields: CaseField[] = [CASE_FIELD];

  let cancelled: any;
  let route: any;

  beforeEach(async() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);

    formGroup = new FormGroup({});

    cancelled = createSpyObj('cancelled', ['emit']);
    route = {
      params: of({id: 123}),
      snapshot: {
        queryParamMap: createSpyObj('queryParamMap', ['get'])
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule
        ],
        declarations: [
          FieldWriteComponent,
          FieldTestComponent
        ],
        providers: [
          { provide: PaletteService, useValue: paletteService },
          { provide: FormValidatorsService, useValue: formValidatorService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(FieldWriteComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseFields = caseFields;
    component.formGroup = formGroup;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should get field write class from PaletteService', () => {
    expect(paletteService.getFieldComponentClass).toHaveBeenCalledWith(CASE_FIELD, true);
  });

  it('should inject component instance as child', () => {
    const divWrapper = de.children[0];
    const ngContent = divWrapper.children[0];
    expect(ngContent.children.length).toBe(1);

    const fieldTestComponent = ngContent.children[0];
    expect(fieldTestComponent.attributes['class']).toEqual(CLASS);

    const fieldTest = fieldTestComponent.componentInstance;
    expect(fieldTest.caseField).toEqual(CASE_FIELD);
    expect(fieldTest.caseFields).toBe(caseFields);
    expect(fieldTest.formGroup).toBe(formGroup);
  });

  function createCaseField(id: string, value: any, display_context = 'READONLY'): CaseField {
    const cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.display_context = display_context;
    return cf;
  }

  function createWizardPage(fields: CaseField[], isMultiColumn = false, order = 0): WizardPage {
    const wp: WizardPage = new WizardPage();
    wp.case_fields = fields;
    wp.label = 'Test Label';
    wp.getCol1Fields = () => fields;
    wp.getCol2Fields = () => fields;
    wp.isMultiColumn = () => isMultiColumn;
    wp.order = order;
    return wp;
  }
});

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { plainToClassFromExist } from 'class-transformer';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
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

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);

    formGroup = new FormGroup({});

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

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [FieldTestComponent]
      }
    });

    fixture = TestBed.createComponent(FieldWriteComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseFields = caseFields;
    component.formGroup = formGroup;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

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
});

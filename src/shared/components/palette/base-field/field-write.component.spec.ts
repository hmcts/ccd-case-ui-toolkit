import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaletteService } from '../palette.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FieldWriteComponent } from './field-write.component';
import { CaseField } from '../../../domain/definition/case-field.model';
import createSpyObj = jasmine.createSpyObj;
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { newCaseField } from '../../../fixture';

const CLASS = 'person-first-name-cls';

@Component({
  template: `
    <div class="${CLASS}"></div>
  `
})
class FieldTestComponent {}

describe('FieldWriteComponent', () => {

  const CASE_FIELD: CaseField = newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').build();

  let fixture: ComponentFixture<FieldWriteComponent>;
  let component: FieldWriteComponent;
  let de: DebugElement;

  let paletteService: any;
  let formValidatorService: any;

  let formGroup: FormGroup;

  beforeEach(async(() => {
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
    component.formGroup = formGroup;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should get field write class from PaletteService', () => {
    expect(paletteService.getFieldComponentClass).toHaveBeenCalledWith(CASE_FIELD, true);
  });

  it('should inject component instance as child', () => {
    let divWrapper = de.children[0];
    let ngContent = divWrapper.children[0];
    expect(ngContent.children.length).toBe(1);

    let fieldTestComponent = ngContent.children[0];
    expect(fieldTestComponent.attributes['class']).toEqual(CLASS);

    let fieldTest = fieldTestComponent.componentInstance;
    expect(fieldTest.caseField).toBe(CASE_FIELD);
    expect(fieldTest.registerControl).not.toBeNull();
  });

  it('should inject component instance with valid default `registerControl` function', () => {
    let ngContent = de.children[0];
    let fieldTestComponent = ngContent.children[0];
    let fieldTest = fieldTestComponent.componentInstance;

    expect(Object.keys(formGroup.controls).length).toEqual(0);

    let control = new FormControl();
    fieldTest.registerControl(control);

    expect(formGroup.controls[CASE_FIELD.id]).toBe(control);
  });
});

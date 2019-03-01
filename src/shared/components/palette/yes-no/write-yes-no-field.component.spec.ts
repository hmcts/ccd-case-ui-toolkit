import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WriteYesNoFieldComponent } from './write-yes-no-field.component';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import createSpyObj = jasmine.createSpyObj;
import { YesNoService } from './yes-no.service';
import { newCaseField } from '../../../fixture';

const FIELD_ID = 'Billingual';
const FIELD_TYPE: FieldType = {
  id: 'YesOrNo',
  type: 'YesOrNo'
};
const VALUE = 'yes';
const FORMATTED_VALUE = 'Yes';
const CASE_FIELD: CaseField = newCaseField(FIELD_ID, 'X', null, FIELD_TYPE, 'OPTIONAL').withValue(VALUE).build();

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteYesNoFieldComponent', () => {

  const $INPUT = By.css('.form-group input');

  // Input is mocked so that one-way bound inputs can be tested
  let Input: any = MockComponent({ selector: 'input', inputs: [
    'type',
    'formControl'
  ]});

  let fixture: ComponentFixture<WriteYesNoFieldComponent>;
  let component: WriteYesNoFieldComponent;
  let de: DebugElement;

  let yesNoService: any;

  beforeEach(async(() => {
    yesNoService = createSpyObj<YesNoService>('yesNoService', ['format']);
    yesNoService.format.and.returnValue(FORMATTED_VALUE);

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteYesNoFieldComponent,

          // Mock
          Input,
        ],
        providers: [
          { provide: YesNoService, useValue: yesNoService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteYesNoFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with formatted provided value', () => {
    expect(yesNoService.format).toHaveBeenCalledWith(VALUE);
    expect(FORM_GROUP.controls[FIELD_ID].value).toBe(FORMATTED_VALUE);
  });

  it('should render radio input element linked to formControl', () => {
    component.idPrefix = 'prefix_';
    fixture.detectChanges();

    let input = de.query($INPUT);
    expect(input.nativeElement.getAttribute('type')).toBe('radio');
    expect(input.componentInstance.formControl).toBe(component.yesNoControl);
  });
});

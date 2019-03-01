import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { DebugElement } from '@angular/core';
import { CaseField, FieldType } from '../../../domain/definition';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils';
import { newCaseField } from '../../../fixture';

const VALUE = '1234-5678-1234-5678';
const FIELD_ID = 'CaseReference';
const FIELD_TYPE: FieldType = {
  id: 'CaseLink',
  type: 'Complex',
};

const CASE_FIELD: CaseField = newCaseField('CaseReference', 'New Case Reference', null, FIELD_TYPE, 'OPTIONAL').withValue(VALUE).build();

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteCaseLinkFieldComponent', () => {
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PaletteUtilsModule
      ],
      declarations: [
        WriteCaseLinkFieldComponent,
      ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteCaseLinkFieldComponent);
    component = fixture.componentInstance;
    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render the case reference', () => {
      expect(component).toBeTruthy();
  });

  it('should validate the case reference number', () => {
    expect(component.validCaseReference('InvalidCharacters')).toBeFalsy();
    expect(component.validCaseReference('1234567812345678')).toBeTruthy();
    expect(component.validCaseReference('1234-5678-1234-5678')).toBeTruthy();
    expect(component.validCaseReference('123456781234567890')).toBeFalsy();
    expect(component.validCaseReference('1234Invalid')).toBeFalsy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, Input } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { async } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import createSpyObj = jasmine.createSpyObj;
import { FieldType } from '../../domain/definition';
import { GreyBarService } from './services/grey-bar.service';
import { ConditionalShowFormDirective } from './conditional-show-form.directive';

@Component({
    template: `
      <div ccdConditionalShowForm [formGroup]="formGroup" [contextFields]="caseFields">
        <div>text field</div>
        <label>Yes</label>
        <input type="radio" formControlName="hasCar" id="HasCarY" value="Yes">
        <label>No</label>
        <input type="radio" [hidden]="carHidden" formControlName="hasCar" id="HasCarN" value="No">
        <input type="text" [hidden]="makeHidden" formControlName="carMake" id="CarMake"/>
        <input type="text" [hidden]="modelHidden" formControlName="carModel" id="CarModel"/>"
      </div>`
})

class TestHostComponent {
  @Input() caseFields: CaseField[];
  @Input() formGroup: FormGroup;
  @Input() complexFormGroup: FormGroup;

  public carHidden = false;
  public makeHidden = true;
  public modelHidden = true;

  // TODO: Sort the bindings out so we can test that the [hidden]
  // works. Binding to isHidden(name) results in an
  // ExpressionChangedAfterItHasBeenCheckedError.
  isHidden(name: string) {
    if (this.caseFields) {
      let f = this.caseFields.find( (cf, ix) =>  (cf.id === name) );
      return f ? f.hidden : false;
    }
    return false;
  }
}

let field = (id, value, showCondition?) => {
    let caseField = new CaseField();
    let fieldType = new FieldType();
    fieldType.id = 'fieldId';
    fieldType.type = 'Text';
    caseField.id = id;
    caseField.value = value;
    caseField.show_condition = showCondition;
    caseField.field_type = fieldType;
    caseField.hidden = false;
    return caseField;
};

describe('ConditionalShowFormDirective', () => {
    let comp:    TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let de:      DebugElement;
    let el:      HTMLElement;
    let elRadioN: HTMLElement;
    let elRadioY: HTMLElement;
    let elMake: HTMLElement;
    let elModel: HTMLElement;

    let conditionalShowForm: ConditionalShowFormDirective;
    let mockRegistrar: ConditionalShowRegistrarService = createSpyObj<ConditionalShowRegistrarService>(
      'conditionalShowRegistrarService',
      ['register']
    );

    beforeEach( async(() => {
      TestBed.configureTestingModule({
          declarations: [ ConditionalShowFormDirective, TestHostComponent ],
          providers:    [
            FieldsUtils,
            GreyBarService,
            { provide: ConditionalShowRegistrarService, useValue: mockRegistrar }
          ]
      }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement.query(By.directive(ConditionalShowFormDirective));
        elRadioY = fixture.debugElement.query(By.css('#HasCarY')).nativeElement
        elRadioN = fixture.debugElement.query(By.css('#HasCarN')).nativeElement
        elModel = fixture.debugElement.query(By.css('#CarModel')).nativeElement
        elMake = fixture.debugElement.query(By.css('#CarMake')).nativeElement
        conditionalShowForm = de.injector.get(ConditionalShowFormDirective) as ConditionalShowFormDirective;
    });

  function bindCaseFields(formGroup: FormGroup, caseFields: CaseField[]) {
    Object.keys(formGroup.controls).forEach((key, ix) => {
      formGroup.get(key)['caseField'] = caseFields[ix];
    })
  }

  it('should not trigger when hide condition is empty', (done) => {
      comp.caseFields = [ field('hasCar', 'Yes', ''),
        field('carMake', 'Ford', ''),
        field('carModel', 'Prefect', '')];
      comp.formGroup = new FormGroup({
        hasCar: new FormControl(comp.caseFields[0].value),
        carMake: new FormControl(comp.caseFields[1].value),
        carModel: new FormControl( comp.caseFields[2].value)
      });
      bindCaseFields(comp.formGroup, comp.caseFields);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(comp.caseFields[1].hidden).toBeFalsy();
        expect(comp.caseFields[2].hidden).toBeFalsy();
        done();
      });
    });

    it('should hide when condition is false', (done) => {
      comp.caseFields = [
        field('hasCar', 'No', ''),
        field('carMake', 'Ford', 'hasCar="Yes"'),
        field('carModel', 'Prefect', 'hasCar="Yes"')
      ];
      comp.formGroup = new FormGroup({
        hasCar: new FormControl(comp.caseFields[0].value),
        carMake: new FormControl(comp.caseFields[1].value),
        carModel: new FormControl( comp.caseFields[2].value)
      });
      bindCaseFields(comp.formGroup, comp.caseFields);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(comp.caseFields[1].hidden).toBeTruthy();
        expect(comp.caseFields[2].hidden).toBeTruthy();
        done();
      });
    })

  it ('should show when condition is true', (done) => {
    comp.caseFields = [ field('hasCar', 'Yes', ''),
      field('carMake', 'Ford', 'hasCar="Yes"'),
      field('carModel', 'Prefect', 'hasCar="Yes"')];
    comp.formGroup = new FormGroup({
      hasCar: new FormControl(comp.caseFields[0].value),
      carMake: new FormControl(comp.caseFields[1].value),
      carModel: new FormControl( comp.caseFields[2].value)
    });
    bindCaseFields(comp.formGroup, comp.caseFields);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(comp.caseFields[1].hidden).toBe(false);
      expect(comp.caseFields[2].hidden).toBe(false);
      done();
    });
  })
  it ('should hide when field value changes to make condition false', (done) => {
    comp.caseFields = [ field('hasCar', 'Yes', ''),
      field('carMake', 'Ford', 'hasCar="Yes"'),
      field('carModel', 'Prefect', 'hasCar="Yes"')];
    comp.formGroup = new FormGroup({
      hasCar: new FormControl(comp.caseFields[0].value),
      carMake: new FormControl(comp.caseFields[1].value),
      carModel: new FormControl( comp.caseFields[2].value)
    });
    bindCaseFields(comp.formGroup, comp.caseFields);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(comp.caseFields[1].hidden).toBe(false);
      expect(comp.caseFields[2].hidden).toBe(false);
      comp.formGroup.patchValue({hasCar: 'No'});
      fixture.detectChanges();
      expect(comp.caseFields[1].hidden).toBe(true);
      expect(comp.caseFields[2].hidden).toBe(true);
      done();
    });
  })
  /*
  it('should display not grey bar when toggled to show if grey bar disabled', () => {
      fixture = TestBed.createComponent(TestHostGreyBarDisabledComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement.query(By.directive(ConditionalShowDirective));
      el = de.nativeElement;
      conditionalShow = de.injector.get(ConditionalShowDirective) as ConditionalShowDirective;
      comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
      comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                          field('PersonFirstName', 'Mario', '')];
      comp.formGroup = new FormGroup({
          PersonLastName: new FormControl('Hollis'),
          PersonHasSecondAddress: new FormControl('No')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(true);

      comp.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
      fixture.detectChanges();

      expect(el.hidden).toBe(false);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeFalsy();
    });

    it('should not display grey bar if field is initially shown on the page', () => {
      comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
      let fieldType = new FieldType();
      fieldType.id = 'fieldId';
      fieldType.type = 'Text';
      comp.caseField.field_type = fieldType;
      comp.caseFields = [comp.caseField, field('PersonLastName', 'Doe', '')];
      fixture.detectChanges();

      expect(el.hidden).toBe(false);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeFalsy();
    });

    it('should display grey bar when toggled to show', () => {
      comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
      comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                          field('PersonFirstName', 'Mario', '')];
      comp.formGroup = new FormGroup({
          PersonLastName: new FormControl('Hollis'),
          PersonHasSecondAddress: new FormControl('No')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(true);

      comp.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
      fixture.detectChanges();

      expect(el.hidden).toBe(false);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeTruthy();
    });

    it('should remove grey bar when toggled to hide', () => {
      comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
      comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                          field('PersonFirstName', 'Mario', '')];
      comp.formGroup = new FormGroup({
          PersonLastName: new FormControl('Hollis'),
          PersonHasSecondAddress: new FormControl('No')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(true);

      comp.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
      fixture.detectChanges();

      expect(el.hidden).toBe(false);

      comp.formGroup.patchValue({PersonHasSecondAddress: 'No'});
      fixture.detectChanges();

      expect(el.hidden).toBe(true);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeFalsy();
    });

    it('should not display grey bar if field is hidden', () => {
      comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
      let fieldType = new FieldType();
      fieldType.id = 'fieldId';
      fieldType.type = 'Text';
      comp.caseField.field_type = fieldType;
      comp.caseFields = [comp.caseField, field('PersonLastName', 'Jack', '')];
      fixture.detectChanges();

      expect(el.hidden).toBe(true);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeFalsy();
    });

    it('should not display grey bar when toggled to show if Collection', () => {
      comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
      let fieldType = new FieldType();
      fieldType.id = 'fieldId';
      fieldType.type = 'Collection';
      comp.caseField.field_type = fieldType;
      comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                          field('PersonFirstName', 'Mario', '')];
      comp.formGroup = new FormGroup({
          PersonLastName: new FormControl('Hollis'),
          PersonHasSecondAddress: new FormControl('No')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(true);

      comp.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
      fixture.detectChanges();

      expect(el.hidden).toBe(false);
      de = fixture.debugElement.query(By.css('.show-condition-grey-bar'));
      expect(de).toBeFalsy();
    });

    it('should display when condition matches a read only field. No form fields', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.caseFields = [comp.caseField, field('PersonLastName', 'Doe', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.condition.condition).toBe('PersonLastName="Doe"');
    });

    it('should not display when condition does not match any read only field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.caseFields = [comp.caseField, field('PersonLastName', 'Mundy', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should not display when condition does not match an undefined readonly field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.caseFields = [comp.caseField, field('PersonLastName', '', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should display when condition matches a form field. No read only fields', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonHasSecondAddress: new FormControl('Yes'),
            PersonSecondAddress: new FormControl(''),
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
    });

    it('should display when condition matches a form field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonLastName', 'Doe', ''), field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonHasSecondAddress: new FormControl('Yes'),
            PersonSecondAddress: new FormControl(''),
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.disabled).toBe(false);
    });

    it('should not display when condition does not match any form field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonLastName', 'Doe', ''),
                             field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonSecondAddress: new FormControl(''),
            PersonHasSecondAddress: new FormControl('No'),
            PersonFirstAddress: new FormControl({}),
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
        expect(conditionalShow.formField.disabled).toBe(true);
    });

    it('should not display when condition does not match because form field is undefined', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonLastName', 'Doe', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonSecondAddress: new FormControl(''),
            PersonHasSecondAddress: new FormControl('')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should display when condition matches after field change', () => {
        comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                            field('PersonFirstName', 'Mario', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Hollis'),
            PersonHasSecondAddress: new FormControl('No')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(true);

        comp.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
        fixture.detectChanges();

        expect(conditionalShow.formField.status).toBe('VALID');
        expect(el.hidden).toBe(false);
    });

    it('should disable a form field when hiding and keep its value', () => {
        comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonFirstName', 'Mario', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Hollis'),
            PersonHasSecondAddress: new FormControl('Yes')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.value).toBe('Hollis');

        conditionalShow.formGroup.patchValue({PersonLastName: 'Doe'});
        conditionalShow.formField.markAsDirty();
        fixture.detectChanges();
        expect(conditionalShow.formField.value).toBe('Doe');
        expect(conditionalShow.formField.dirty).toBe(true);

        conditionalShow.formGroup.patchValue({PersonHasSecondAddress: 'No'});
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
        expect(conditionalShow.formField.status).toBe('DISABLED');

        conditionalShow.formGroup.patchValue({PersonHasSecondAddress: 'Yes'});
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.status).toBe('VALID');
        expect(conditionalShow.formField.value).toBe('Doe');
    });

    it('should not clear a form field on hide if not dirty', () => {
        comp.caseField = field('PersonLastName', 'Hollis', 'PersonHasSecondAddress="Yes"');
        comp.caseFields = [comp.caseField, field('PersonFirstName', 'Mario', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Hollis'),
            PersonHasSecondAddress: new FormControl('Yes')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.value).toBe('Hollis');

        conditionalShow.formGroup.patchValue({PersonHasSecondAddress: 'No'});
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
        expect(conditionalShow.formField.status).toBe('DISABLED');
        expect(conditionalShow.formField.value).toBe('Hollis');
    });

  describe('conditional show hide for complex field group', () => {

    beforeEach(() => {
      comp.caseField = field('Postcode', '', 'Address.Country="UK"');
      comp.idPrefix = 'Address_';
      comp.caseFields = [field('PersonLastName', 'Doe', '')];
      comp.formGroup = new FormGroup({
        Address: new FormGroup({
          Country: new FormControl('UK'),
          Postcode: new FormControl('W4')
        })
      });
    });

    it('should display when condition matches complex subfield', () => {
      comp.complexFormGroup = new FormGroup({
        Country: new FormControl('UK'),
        Postcode: new FormControl('W4')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(false);
      expect(conditionalShow.formField.disabled).toBe(false);
      expect(conditionalShow.formField.value).toBe('W4');
    });

    it('should not display when condition does not match complex subfield', () => {
      comp.formGroup.patchValue({Address: {Country: 'FRANCE'}});
      comp.complexFormGroup = new FormGroup({
        Country: new FormControl('FRANCE'),
        Postcode: new FormControl('W4')
      });
      fixture.detectChanges();

      expect(el.hidden).toBe(true);
      expect(conditionalShow.formField.disabled).toBe(true);
    });

  });
  */
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement, Component, Input }    from '@angular/core';
import { ConditionalShowDirective } from './conditional-show.directive';
import { CaseField } from '../domain/definition/case-field.model';
import { async } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldsUtils } from '../utils/fields.utils';
import { ConditionalShowRegistrarService } from './conditional-show-registrar.service';
import createSpyObj = jasmine.createSpyObj;

@Component({
    template: `
      <tr ccdConditionalShow [caseField]="caseField" [formGroup]="formGroup" [eventFields]="eventFields"></tr>`
})
class TestHostComponent {

    @Input() caseField: CaseField;
    @Input() eventFields: CaseField[];
    @Input() formGroup: FormGroup;
}

let field = (id, value, showCondition?) => {
    let caseField = new CaseField();
    caseField.id = id;
    caseField.value = value;
    caseField.show_condition = showCondition;
    return caseField;
};

describe('ConditionalShowDirective', () => {

    let comp:    TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let de:      DebugElement;
    let el:      HTMLElement;
    let conditionalShow: ConditionalShowDirective;
    let mockRegistrar: ConditionalShowRegistrarService = createSpyObj<ConditionalShowRegistrarService>(
      'conditionalShowRegistrarService',
      ['register', 'refresh']
    );

    beforeEach( async(() => {
        TestBed.configureTestingModule({
            declarations: [ ConditionalShowDirective, TestHostComponent ],
            providers:    [
              FieldsUtils,
              { provide: ConditionalShowRegistrarService, useValue: mockRegistrar }
            ]
        }).compileComponents();
        }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement.query(By.directive(ConditionalShowDirective));
        el = de.nativeElement;
        conditionalShow = de.injector.get(ConditionalShowDirective) as ConditionalShowDirective;
    });

    it('should not trigger when hide condition is empty', () => {
        comp.caseField = field('PersonSecondAddress', '', '');
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.condition).toBeUndefined();
    });

    it('should display when condition matches a read only field. No form fields', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.eventFields = [comp.caseField, field('PersonLastName', 'Doe', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.condition.condition).toBe('PersonLastName="Doe"');
    });

    it('should not display when condition does not match any read only field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.eventFields = [comp.caseField, field('PersonLastName', 'Mundy', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should not display when condition does not match an undefined readonly field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonLastName="Doe"');
        comp.eventFields = [comp.caseField, field('PersonLastName', '', '')];
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should display when condition matches a form field. No read only fields', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.eventFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonHasSecondAddress: new FormControl('Yes'),
            PersonSecondAddress: new FormControl(''),
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
    });

    it('should display when condition matches a form field', () => {
        comp.caseField = field('PersonSecondAddress', '', 'PersonHasSecondAddress="Yes"');
        comp.eventFields = [comp.caseField, field('PersonLastName', 'Doe', ''), field('PersonHasSecondAddress', 'Yes', '')];
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
        comp.eventFields = [comp.caseField, field('PersonLastName', 'Doe', ''),
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
        comp.eventFields = [comp.caseField, field('PersonLastName', 'Doe', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonSecondAddress: new FormControl(''),
            PersonHasSecondAddress: new FormControl('')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
    });

    it('should display when condition matches after field change', () => {
        comp.caseField = field('PersonLastName', 'Paniccia', 'PersonHasSecondAddress="Yes"');
        comp.eventFields = [comp.caseField, field('PersonHasSecondAddress', 'Yes', ''),
                            field('PersonFirstName', 'Mario', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Paniccia'),
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
        comp.caseField = field('PersonLastName', 'Paniccia', 'PersonHasSecondAddress="Yes"');
        comp.eventFields = [comp.caseField, field('PersonFirstName', 'Mario', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Paniccia'),
            PersonHasSecondAddress: new FormControl('Yes')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.value).toBe('Paniccia');

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
        comp.caseField = field('PersonLastName', 'Paniccia', 'PersonHasSecondAddress="Yes"');
        comp.eventFields = [comp.caseField, field('PersonFirstName', 'Mario', ''),
                            field('PersonHasSecondAddress', 'Yes', '')];
        comp.formGroup = new FormGroup({
            PersonLastName: new FormControl('Paniccia'),
            PersonHasSecondAddress: new FormControl('Yes')
        });
        fixture.detectChanges();

        expect(el.hidden).toBe(false);
        expect(conditionalShow.formField.value).toBe('Paniccia');

        conditionalShow.formGroup.patchValue({PersonHasSecondAddress: 'No'});
        fixture.detectChanges();

        expect(el.hidden).toBe(true);
        expect(conditionalShow.formField.status).toBe('DISABLED');
        expect(conditionalShow.formField.value).toBe('Paniccia');
    });
});

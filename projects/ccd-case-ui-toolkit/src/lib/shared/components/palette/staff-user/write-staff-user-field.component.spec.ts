import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CaseFlagRefdataService, FieldsUtils, FormValidatorsService, JurisdictionService } from '../../../services';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { WriteStaffUserFieldComponent } from './write-staff-user-field.component';
import createSpyObj = jasmine.createSpyObj;

const CASE_FIELD: any = {
  id: 'staffUserField',
  label: 'Staff user',
  display_context: 'OPTIONAL',
  field_type: {
    id: 'StaffUser',
    type: 'Complex',
    complex_fields: [
      { id: 'idamId', field_type: { id: 'Text', type: 'Text' } },
      { id: 'displayName', field_type: { id: 'Text', type: 'Text' } }
    ]
  },
  value: { idamId: 'idam-id', displayName: 'Alex Admin' }
};

describe('WriteStaffUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteStaffUserFieldComponent>;
  let component: WriteStaffUserFieldComponent;
  let jurisdictionService: jasmine.SpyObj<JurisdictionService>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  let selectedJurisdiction: BehaviorSubject<any>;
  let caseView: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    selectedJurisdiction = new BehaviorSubject({
      id: 'FALLBACK',
      currentCaseType: { id: 'FALLBACK-TEST' }
    });
    caseView = new BehaviorSubject(null);
    jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(selectedJurisdiction as any);
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('CaseFlagRefdataService', [
      'getHmctsServiceDetailsByCaseType',
      'getHmctsServiceDetailsByServiceName'
    ]);
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(of([
      { service_code: 'FIRST' },
      { service_code: 'SECOND' }
    ]));
    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(of([{ service_code: 'FALLBACK' }]));

    const compoundPipe = createSpyObj<IsCompoundPipe>('IsCompoundPipe', ['transform']);
    compoundPipe.transform.and.returnValue(false);
    const validatorsService = createSpyObj<FormValidatorsService>('FormValidatorsService', ['addValidators']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WriteStaffUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: JurisdictionService, useValue: jurisdictionService },
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService },
        { provide: IsCompoundPipe, useValue: compoundPipe },
        { provide: FormValidatorsService, useValue: validatorsService },
        { provide: CaseNotifier, useValue: { caseView: caseView.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WriteStaffUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.formGroup = new FormGroup({});
    spyOn(FieldsUtils, 'addCaseFieldAndComponentReferences').and.callThrough();
    fixture.detectChanges();
  }));

  it('should register the StaffUser control and its case-field references', () => {
    expect(component.formGroup.get('staffUserField_staffUserControl')).toBe(component.staffUserControl);
    expect(component.staffUserControl.value).toBe('Alex Admin');
    expect(FieldsUtils.addCaseFieldAndComponentReferences).toHaveBeenCalledWith(
      component.staffUserControl, component.caseField, component);
  });

  it('should clear hidden field validators and apply required validation when mandatory', () => {
    component.caseField = { ...CASE_FIELD, display_context: 'MANDATORY' };
    component.formGroup = new FormGroup({});
    component.ngOnInit();

    expect(component.complexGroup.get('idamId').validator).toBeNull();
    expect(component.complexGroup.get('displayName').validator).toBeNull();
    component.staffUserControl.setValue(null);
    expect(component.staffUserControl.hasError('required')).toBe(true);
  });

  it('should use selected jurisdiction context until an open case is announced', () => {
    expect(component.jurisdiction).toBe('FALLBACK');
    expect(component.caseType).toBe('FALLBACK-TEST');

    caseView.next({ case_type: { id: 'OPEN-TEST', jurisdiction: { id: 'OPEN' } } });

    expect(component.jurisdiction).toBe('OPEN');
    expect(component.caseType).toBe('OPEN-TEST');
  });

  it('should resolve the first service code using the base case type', () => {
    component.caseType = 'CIVIL-TEST';
    component.resolveServiceCode().subscribe(serviceCode => expect(serviceCode).toBe('FIRST'));

    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith('CIVIL');
  });

  it('should fall back to service-name lookup when case-type lookup fails', () => {
    component.jurisdiction = 'FALLBACK';
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(throwError(new Error('not found')));

    component.resolveServiceCode().subscribe(serviceCode => expect(serviceCode).toBe('FALLBACK'));

    expect(caseFlagRefdataService.getHmctsServiceDetailsByServiceName).toHaveBeenCalledWith('FALLBACK');
  });

  it('should unsubscribe from context sources on destroy', () => {
    spyOn(component.jurisdictionSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();

    expect(component.jurisdictionSubscription.unsubscribe).toHaveBeenCalled();
  });
});

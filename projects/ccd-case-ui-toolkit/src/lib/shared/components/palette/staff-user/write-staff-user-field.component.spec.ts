import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
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
  role_categories: 'ADMIN',
  value: { idamId: 'idam-id', displayName: 'Alex Admin' }
};

describe('WriteStaffUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteStaffUserFieldComponent>;
  let component: WriteStaffUserFieldComponent;
  let jurisdictionService: jasmine.SpyObj<JurisdictionService>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  let caseworkerService: jasmine.SpyObj<CaseworkerService>;
  let selectedJurisdiction: BehaviorSubject<any>;
  let caseView: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    selectedJurisdiction = new BehaviorSubject({
      id: 'FALLBACK',
      currentCaseType: { id: 'FALLBACK-TEST' }
    });
    caseView = new BehaviorSubject(null);
    jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['getSelectedJurisdiction', 'searchJudicialUsers']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(selectedJurisdiction as any);
    jurisdictionService.searchJudicialUsers.and.returnValue(of([]));
    caseworkerService = createSpyObj<CaseworkerService>('CaseworkerService', ['searchStaffUsers']);
    caseworkerService.searchStaffUsers.and.returnValue(of([]));
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
      imports: [ReactiveFormsModule, MatAutocompleteModule],
      declarations: [WriteStaffUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: JurisdictionService, useValue: jurisdictionService },
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService },
        { provide: CaseworkerService, useValue: caseworkerService },
        { provide: IsCompoundPipe, useValue: compoundPipe },
        { provide: FormValidatorsService, useValue: validatorsService },
        { provide: CaseNotifier, useValue: { caseView: caseView.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WriteStaffUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = JSON.parse(JSON.stringify(CASE_FIELD));
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

  it('should wait for three characters and 300ms before searching', fakeAsync(() => {
    component.filteredStaffUsers$.subscribe();

    component.staffUserControl.setValue('al');
    tick(300);
    expect(caseworkerService.searchStaffUsers).not.toHaveBeenCalled();

    component.staffUserControl.setValue('ale');
    tick(299);
    expect(caseworkerService.searchStaffUsers).not.toHaveBeenCalled();
    tick(1);
    expect(caseworkerService.searchStaffUsers).toHaveBeenCalledWith(['FIRST'], 'ale', ['ADMIN']);
  }));

  it('should search only the staff cache for staff categories', () => {
    caseworkerService.searchStaffUsers.and.returnValue(of([{ idamId: 'staff-id', displayName: 'Alex Admin' }]));

    component.filterStaffUsers('alex').subscribe(staffUsers => {
      expect(staffUsers).toEqual([{ idamId: 'staff-id', displayName: 'Alex Admin' }]);
    });

    expect(caseworkerService.searchStaffUsers).toHaveBeenCalledWith(['FIRST'], 'alex', ['ADMIN']);
    expect(jurisdictionService.searchJudicialUsers).not.toHaveBeenCalled();
  });

  it('should search only the judicial source for JUDICIAL', () => {
    component.caseField.role_categories = 'JUDICIAL';
    jurisdictionService.searchJudicialUsers.and.returnValue(of([{ idamId: 'judicial-id', fullName: 'Judge Judy' }]));

    component.filterStaffUsers('jud').subscribe(staffUsers => {
      expect(staffUsers).toEqual([{ idamId: 'judicial-id', displayName: 'Judge Judy' }]);
    });

    expect(caseworkerService.searchStaffUsers).not.toHaveBeenCalled();
    expect(jurisdictionService.searchJudicialUsers).toHaveBeenCalledWith('jud', 'FIRST');
  });

  it('should merge source results by idamId without duplicates', () => {
    component.caseField.role_categories = 'ADMIN,JUDICIAL';
    caseworkerService.searchStaffUsers.and.returnValue(of([
      { idamId: 'shared-id', displayName: 'Staff name' },
      { idamId: 'staff-id', displayName: 'Staff user' }
    ]));
    jurisdictionService.searchJudicialUsers.and.returnValue(of([
      { idamId: 'shared-id', fullName: 'Judicial name' },
      { idamId: 'judicial-id', fullName: 'Judicial user' }
    ]));

    component.filterStaffUsers('user').subscribe(staffUsers => {
      expect(staffUsers).toEqual([
        { idamId: 'shared-id', displayName: 'Staff name' },
        { idamId: 'staff-id', displayName: 'Staff user' },
        { idamId: 'judicial-id', displayName: 'Judicial user' }
      ]);
    });
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledTimes(1);
  });

  it('should store the selected user in the case field and complex group', () => {
    component.onSelectionChange({ source: { value: { idamId: 'selected-id', displayName: 'Selected user' } } });

    expect(component.caseField.value).toEqual({ idamId: 'selected-id', displayName: 'Selected user' });
    expect(component.complexGroup.get('idamId').value).toBe('selected-id');
    expect(component.complexGroup.get('displayName').value).toBe('Selected user');
  });

  it('should clear persisted values when the selected text is edited', () => {
    component.staffUserControl.setValue('Edited user');

    expect(component.caseField.value).toBeNull();
    expect(component.complexGroup.get('idamId').value).toBeNull();
    expect(component.complexGroup.get('displayName').value).toBeNull();
  });

  it('should preserve an existing selection when it is blurred unchanged', () => {
    component.onBlur({ relatedTarget: null });

    expect(component.caseField.value).toEqual({ idamId: 'idam-id', displayName: 'Alex Admin' });
  });

  it('should clear an unselected value on blur', () => {
    component.staffUserSelected = false;
    component.staffUserControl.setValue('Unselected user');
    component.onBlur({ relatedTarget: null });

    expect(component.staffUserControl.value).toBeNull();
    expect(component.caseField.value).toBeNull();
  });

  it('should show no results for a successful empty search', fakeAsync(() => {
    component.filteredStaffUsers$.subscribe();
    component.staffUserControl.setValue('empty');
    tick(300);

    expect(component.showAutocomplete).toBe(true);
    expect(component.noResults).toBe(true);
    expect(component.invalidSearchTerm).toBe(false);
  }));

  it('should show an invalid search state for invalid configuration and skip requests', () => {
    component.caseField.role_categories = 'UNKNOWN';

    component.filterStaffUsers('invalid').subscribe(staffUsers => expect(staffUsers).toEqual([]));

    expect(component.invalidSearchTerm).toBe(true);
    expect(caseworkerService.searchStaffUsers).not.toHaveBeenCalled();
    expect(jurisdictionService.searchJudicialUsers).not.toHaveBeenCalled();
  });

  it('should show an invalid search state when a source fails', () => {
    caseworkerService.searchStaffUsers.and.returnValue(throwError(new Error('search failed')));

    component.filterStaffUsers('alex').subscribe(staffUsers => expect(staffUsers).toEqual([]));

    expect(component.invalidSearchTerm).toBe(true);
  });
});

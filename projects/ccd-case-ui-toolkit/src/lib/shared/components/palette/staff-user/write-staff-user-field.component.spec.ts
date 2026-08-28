import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
import {
  CaseFlagRefdataService,
  FieldsUtils,
  FormValidatorsService,
  JurisdictionService
} from '../../../services';
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
  display_context_parameter: '#ARGUMENT(CATEGORY-ADMIN)',
  value: {
    idamId: 'idam-id',
    displayName: 'Alex Admin'
  }
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
      currentCaseType: {
        id: 'FALLBACK-TEST'
      }
    });

    caseView = new BehaviorSubject(null);

    jurisdictionService = createSpyObj<JurisdictionService>(
      'JurisdictionService',
      [
        'getSelectedJurisdiction',
        'searchJudicialUsers',
        'getJudicialUserByIdamId'
      ]
    );

    jurisdictionService.getSelectedJurisdiction.and.returnValue(
      selectedJurisdiction as any
    );
    jurisdictionService.searchJudicialUsers.and.returnValue(of([]));
    jurisdictionService.getJudicialUserByIdamId.and.returnValue(of(null));

    caseworkerService = createSpyObj<CaseworkerService>(
      'CaseworkerService',
      [
        'searchStaffUsers',
        'getUserByIdamId'
      ]
    );

    caseworkerService.searchStaffUsers.and.returnValue(of([]));
    caseworkerService.getUserByIdamId.and.returnValue(of(null));

    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>(
      'CaseFlagRefdataService',
      [
        'getHmctsServiceDetailsByCaseType',
        'getHmctsServiceDetailsByServiceName'
      ]
    );

    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(
      of([
        {
          service_code: 'FIRST',
          ccd_service_name: 'PRIVATELAW'
        },
        {
          service_code: 'SECOND',
          ccd_service_name: 'ANOTHER_SERVICE'
        }
      ])
    );

    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(
      of([
        {
          service_code: 'FALLBACK',
          ccd_service_name: 'FALLBACK'
        }
      ])
    );

    const compoundPipe = createSpyObj<IsCompoundPipe>(
      'IsCompoundPipe',
      ['transform']
    );
    compoundPipe.transform.and.returnValue(false);

    const validatorsService = createSpyObj<FormValidatorsService>(
      'FormValidatorsService',
      ['addValidators']
    );

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule
      ],
      declarations: [
        WriteStaffUserFieldComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: JurisdictionService,
          useValue: jurisdictionService
        },
        {
          provide: CaseFlagRefdataService,
          useValue: caseFlagRefdataService
        },
        {
          provide: CaseworkerService,
          useValue: caseworkerService
        },
        {
          provide: IsCompoundPipe,
          useValue: compoundPipe
        },
        {
          provide: FormValidatorsService,
          useValue: validatorsService
        },
        {
          provide: CaseNotifier,
          useValue: {
            caseView: caseView.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WriteStaffUserFieldComponent);
    component = fixture.componentInstance;

    component.caseField = JSON.parse(JSON.stringify(CASE_FIELD));
    component.formGroup = new FormGroup({});

    spyOn(
      FieldsUtils,
      'addCaseFieldAndComponentReferences'
    ).and.callThrough();

    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register the StaffUser control and its case-field references', () => {
    expect(
      component.formGroup.get('staffUserField_staffUserControl')
    ).toBe(component.staffUserControl);

    expect(component.staffUserControl.value).toEqual({
      idamId: 'idam-id',
      displayName: 'Alex Admin'
    });

    expect(
      FieldsUtils.addCaseFieldAndComponentReferences
    ).toHaveBeenCalledWith(
      component.staffUserControl,
      component.caseField,
      component
    );
  });

  describe('context', () => {
    it('should use selected jurisdiction context until an open case is announced', () => {
      expect(component.jurisdiction).toBe('FALLBACK');
      expect(component.caseType).toBe('FALLBACK-TEST');

      caseView.next({
        case_type: {
          id: 'OPEN-TEST',
          jurisdiction: {
            id: 'OPEN'
          }
        }
      });

      expect(component.jurisdiction).toBe('OPEN');
      expect(component.caseType).toBe('OPEN-TEST');
    });

    it('should retain existing context when case notifier contains missing values', () => {
      expect(component.jurisdiction).toBe('FALLBACK');
      expect(component.caseType).toBe('FALLBACK-TEST');

      caseView.next({
        case_type: {
          jurisdiction: {}
        }
      });

      expect(component.jurisdiction).toBe('FALLBACK');
      expect(component.caseType).toBe('FALLBACK-TEST');
    });
  });

  describe('validation', () => {
    it('should clear the idamId validator', () => {
      component.setupValidation();

      expect(
        component.complexGroup.get('idamId')?.validator
      ).toBeNull();
    });

    it('should apply required validation when the field is mandatory', () => {
      component.caseField.display_context = 'MANDATORY';

      component.setupValidation();

      component.staffUserControl.setValue(null);

      expect(
        component.staffUserControl.hasError('required')
      ).toBe(true);
    });

    it('should not apply required validation when the field is optional', () => {
      component.caseField.display_context = 'OPTIONAL';

      component.setupValidation();

      component.staffUserControl.setValue(null);

      expect(
        component.staffUserControl.hasError('required')
      ).toBe(false);
    });
  });

  describe('loadStaffUser', () => {
    beforeEach(() => {
      caseworkerService.getUserByIdamId.calls.reset();
      jurisdictionService.getJudicialUserByIdamId.calls.reset();
    });

    it('should load an existing caseworker by idamId', () => {
      caseworkerService.getUserByIdamId.and.returnValue(
        of({
          idamId: 'staff-id',
          firstName: 'Alex',
          lastName: 'Admin',
          email: 'alex.admin@justice.gov.uk'
        } as any)
      );

      component.loadStaffUser('staff-id');

      expect(
        caseworkerService.getUserByIdamId
      ).toHaveBeenCalledWith('staff-id');

      expect(component.staffUserControl.value).toEqual({
        idamId: 'staff-id',
        displayName: 'Alex Admin',
        emailId: 'alex.admin@justice.gov.uk'
      });

      expect(component.staffUserSelected).toBe(true);

      expect(
        jurisdictionService.getJudicialUserByIdamId
      ).not.toHaveBeenCalled();
    });

    it('should load a judicial user when no caseworker is found', () => {
      caseworkerService.getUserByIdamId.and.returnValue(of(null));

      jurisdictionService.getJudicialUserByIdamId.and.returnValue(
        of({
          idamId: 'judicial-id',
          fullName: 'Judge Judy',
          knownAs: 'Judy',
          emailId: 'judge.judy@justice.gov.uk'
        } as any)
      );

      component.loadStaffUser('judicial-id');

      expect(
        jurisdictionService.getJudicialUserByIdamId
      ).toHaveBeenCalledWith('judicial-id');

      expect(component.staffUserControl.value).toEqual({
        idamId: 'judicial-id',
        displayName: 'Judge Judy',
        emailId: 'judge.judy@justice.gov.uk'
      });

      expect(component.staffUserSelected).toBe(true);
    });

    it('should fall back to judicial lookup when caseworker lookup fails', () => {
      caseworkerService.getUserByIdamId.and.returnValue(
        throwError(new Error('caseworker lookup failed'))
      );

      jurisdictionService.getJudicialUserByIdamId.and.returnValue(
        of({
          idamId: 'judicial-id',
          fullName: 'Judge Judy'
        } as any)
      );

      component.loadStaffUser('judicial-id');

      expect(
        jurisdictionService.getJudicialUserByIdamId
      ).toHaveBeenCalledWith('judicial-id');

      expect(component.staffUserControl.value).toEqual({
        idamId: 'judicial-id',
        displayName: 'Judge Judy'
      });

      expect(component.staffUserSelected).toBe(true);
    });

    it('should use knownAs when a judicial user has no fullName', () => {
      caseworkerService.getUserByIdamId.and.returnValue(of(null));

      jurisdictionService.getJudicialUserByIdamId.and.returnValue(
        of({
          idamId: 'judicial-id',
          fullName: '',
          knownAs: 'Judge Smith'
        } as any)
      );

      component.loadStaffUser('judicial-id');

      expect(component.staffUserControl.value).toEqual({
        idamId: 'judicial-id',
        displayName: 'Judge Smith'
      });
    });

    it('should not perform a lookup when idamId is empty', () => {
      component.loadStaffUser('');

      expect(
        caseworkerService.getUserByIdamId
      ).not.toHaveBeenCalled();

      expect(
        jurisdictionService.getJudicialUserByIdamId
      ).not.toHaveBeenCalled();
    });
  });

  describe('service resolution', () => {
    it('should resolve the first service code using the base case type', () => {
      component.caseType = 'CIVIL-TEST';

      component.resolveServiceCode().subscribe(serviceCode => {
        expect(serviceCode).toBe('FIRST');
      });

      expect(
        caseFlagRefdataService.getHmctsServiceDetailsByCaseType
      ).toHaveBeenCalledWith('CIVIL');
    });

    it('should return the first service detail', () => {
      component.caseType = 'CIVIL-TEST';

      component.resolveServiceDetails().subscribe(serviceDetail => {
        expect(serviceDetail).toEqual({
          service_code: 'FIRST',
          ccd_service_name: 'PRIVATELAW'
        } as any);
      });
    });

    it('should fall back to service-name lookup when case-type lookup fails', () => {
      component.jurisdiction = 'FALLBACK';

      caseFlagRefdataService
        .getHmctsServiceDetailsByCaseType
        .and.returnValue(
          throwError(new Error('not found'))
        );

      component.resolveServiceCode().subscribe(serviceCode => {
        expect(serviceCode).toBe('FALLBACK');
      });

      expect(
        caseFlagRefdataService.getHmctsServiceDetailsByServiceName
      ).toHaveBeenCalledWith('FALLBACK');
    });

    it('should strip the suffix from the case type', () => {
      component.caseType = 'PRIVATELAW-TEST';

      component.resolveServiceDetails().subscribe();

      expect(
        caseFlagRefdataService.getHmctsServiceDetailsByCaseType
      ).toHaveBeenCalledWith('PRIVATELAW');
    });
  });

  describe('autocomplete', () => {
    it('should wait for more than two characters and 300ms before searching', fakeAsync(() => {
      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue('al');

      tick(300);

      expect(
        caseworkerService.searchStaffUsers
      ).not.toHaveBeenCalled();

      component.staffUserControl.setValue('ale');

      tick(299);

      expect(
        caseworkerService.searchStaffUsers
      ).not.toHaveBeenCalled();

      tick(1);

      expect(
        caseworkerService.searchStaffUsers
      ).toHaveBeenCalledWith(
        ['PRIVATELAW'],
        'ale',
        ['ADMIN']
      );

      // Judicial search is currently forced by the QA override
      // in filterStaffUsers().
      expect(
        jurisdictionService.searchJudicialUsers
      ).toHaveBeenCalledWith(
        'ale',
        'FIRST'
      );
    }));

    it('should ignore StaffUser object values emitted by the control', fakeAsync(() => {
      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue({
        idamId: 'selected-id',
        displayName: 'Selected user'
      });

      tick(300);

      expect(
        caseworkerService.searchStaffUsers
      ).not.toHaveBeenCalled();

      expect(
        jurisdictionService.searchJudicialUsers
      ).not.toHaveBeenCalled();
    }));

    it('should update the search term', fakeAsync(() => {
      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue('alex');

      tick(300);

      expect(component.searchTerm).toBe('alex');
    }));

    it('should show autocomplete after a successful search', fakeAsync(() => {
      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue('alex');

      tick(300);

      expect(component.showAutocomplete).toBe(true);
    }));

    it('should show no results for a successful empty search', fakeAsync(() => {
      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue('empty');

      tick(300);

      expect(component.showAutocomplete).toBe(true);
      expect(component.noResults).toBe(true);
      expect(component.invalidSearchTerm).toBe(false);
    }));

    it('should not show noResults when the search is invalid', fakeAsync(() => {
      component.caseField.display_context_parameter =
        '#ARGUMENT(CATEGORY-UNKNOWN)';

      component.filteredStaffUsers$.subscribe();

      component.staffUserControl.setValue('invalid');

      tick(300);

      expect(component.showAutocomplete).toBe(true);
      expect(component.invalidSearchTerm).toBe(true);
      expect(component.noResults).toBe(false);
    }));
  });

  describe('filterStaffUsers', () => {
    it('should search staff and judicial users for staff categories while QA override is enabled', () => {
      caseworkerService.searchStaffUsers.and.returnValue(
        of([
          {
            idamId: 'staff-id',
            displayName: 'Alex Admin',
            emailId: 'alex.admin@justice.gov.uk'
          }
        ])
      );

      jurisdictionService.searchJudicialUsers.and.returnValue(
        of([])
      );

      component.filterStaffUsers('alex').subscribe(staffUsers => {
        expect(staffUsers).toEqual([
          {
            idamId: 'staff-id',
            displayName: 'Alex Admin',
            emailId: 'alex.admin@justice.gov.uk'
          }
        ]);
      });

      expect(
        caseworkerService.searchStaffUsers
      ).toHaveBeenCalledWith(
        ['PRIVATELAW'],
        'alex',
        ['ADMIN']
      );

      // Current component explicitly forces judicial search:
      //
      // configuration.configuration.includesJudicial = true;
      // configuration.configuration.roleCategories.push('JUDICIAL');
      expect(
        jurisdictionService.searchJudicialUsers
      ).toHaveBeenCalledWith(
        'alex',
        'FIRST'
      );
    });

    it('should search the judicial source for CATEGORY-JUDICIAL', () => {
      component.caseField.display_context_parameter =
        '#ARGUMENT(CATEGORY-JUDICIAL)';

      jurisdictionService.searchJudicialUsers.and.returnValue(
        of([
          {
            idamId: 'judicial-id',
            fullName: 'Judge Judy',
            emailId: 'judge.judy@justice.gov.uk'
          }
        ])
      );

      component.filterStaffUsers('jud').subscribe(staffUsers => {
        expect(staffUsers).toEqual([
          {
            idamId: 'judicial-id',
            displayName: 'Judge Judy',
            emailId: 'judge.judy@justice.gov.uk'
          }
        ]);
      });

      expect(
        caseworkerService.searchStaffUsers
      ).not.toHaveBeenCalled();

      expect(
        jurisdictionService.searchJudicialUsers
      ).toHaveBeenCalledWith(
        'jud',
        'FIRST'
      );
    });

    it('should merge source results by idamId without duplicates', () => {
      component.caseField.display_context_parameter =
        '#ARGUMENT(CATEGORY-ADMIN,CATEGORY-JUDICIAL)';

      caseworkerService.searchStaffUsers.and.returnValue(
        of([
          {
            idamId: 'shared-id',
            displayName: 'Staff name'
          },
          {
            idamId: 'staff-id',
            displayName: 'Staff user'
          }
        ])
      );

      jurisdictionService.searchJudicialUsers.and.returnValue(
        of([
          {
            idamId: 'shared-id',
            fullName: 'Judicial name'
          },
          {
            idamId: 'judicial-id',
            fullName: 'Judicial user'
          }
        ])
      );

      component.filterStaffUsers('user').subscribe(staffUsers => {
        expect(staffUsers).toEqual([
          {
            idamId: 'shared-id',
            displayName: 'Staff name'
          },
          {
            idamId: 'staff-id',
            displayName: 'Staff user'
          },
          {
            idamId: 'judicial-id',
            displayName: 'Judicial user'
          }
        ]);
      });

      expect(
        caseFlagRefdataService.getHmctsServiceDetailsByCaseType
      ).toHaveBeenCalledTimes(1);
    });

    it('should map judicial users without an email address', () => {
      component.caseField.display_context_parameter =
        '#ARGUMENT(CATEGORY-JUDICIAL)';

      jurisdictionService.searchJudicialUsers.and.returnValue(
        of([
          {
            idamId: 'judicial-id',
            fullName: 'Judge Judy'
          }
        ])
      );

      component.filterStaffUsers('jud').subscribe(staffUsers => {
        expect(staffUsers).toEqual([
          {
            idamId: 'judicial-id',
            displayName: 'Judge Judy'
          }
        ]);
      });
    });

    it('should show an invalid search state for invalid configuration and skip requests', () => {
      component.caseField.display_context_parameter =
        '#ARGUMENT(CATEGORY-UNKNOWN)';

      component.filterStaffUsers('invalid').subscribe(staffUsers => {
        expect(staffUsers).toEqual([]);
      });

      expect(component.invalidSearchTerm).toBe(true);

      expect(
        caseworkerService.searchStaffUsers
      ).not.toHaveBeenCalled();

      expect(
        jurisdictionService.searchJudicialUsers
      ).not.toHaveBeenCalled();
    });

    it('should show an invalid search state when the staff source fails', () => {
      caseworkerService.searchStaffUsers.and.returnValue(
        throwError(new Error('search failed'))
      );

      component.filterStaffUsers('alex').subscribe(staffUsers => {
        expect(staffUsers).toEqual([]);
      });

      expect(component.invalidSearchTerm).toBe(true);
    });

    it('should show an invalid search state when the judicial source fails', () => {
      jurisdictionService.searchJudicialUsers.and.returnValue(
        throwError(new Error('search failed'))
      );

      component.filterStaffUsers('alex').subscribe(staffUsers => {
        expect(staffUsers).toEqual([]);
      });

      expect(component.invalidSearchTerm).toBe(true);
    });

    it('should use display context parameter from caseFields when absent from caseField', () => {
      component.caseField.display_context_parameter = undefined;

      component.caseFields = [
        {
          id: 'StaffUser',
          display_context_parameter: '#ARGUMENT(CATEGORY-ADMIN)'
        } as any
      ];

      component.filterStaffUsers('alex').subscribe();

      expect(
        caseworkerService.searchStaffUsers
      ).toHaveBeenCalledWith(
        ['PRIVATELAW'],
        'alex',
        ['ADMIN']
      );
    });
  });

  describe('displayStaffUser', () => {
    it('should return the display name', () => {
      expect(
        component.displayStaffUser({
          idamId: 'staff-id',
          displayName: 'Alex Admin'
        })
      ).toBe('Alex Admin');
    });

    it('should return undefined when there is no staff user', () => {
      expect(
        component.displayStaffUser(undefined)
      ).toBeUndefined();
    });
  });

  describe('selection', () => {
    it('should store the selected user idamId in the case field and complex group', () => {
      component.onSelectionChange({
        source: {
          value: {
            idamId: 'selected-id',
            displayName: 'Selected user'
          }
        }
      });

      expect(component.caseField.value).toEqual({
        idamId: 'selected-id'
      });

      expect(
        component.complexGroup.get('idamId')?.value
      ).toBe('selected-id');

      expect(component.staffUserSelected).toBe(true);
    });
  });

  describe('blur', () => {
    it('should clear an unselected value on blur', () => {
      component.staffUserSelected = false;
      component.staffUserControl.setValue('Unselected user');

      component.onBlur({
        relatedTarget: null
      });

      expect(component.staffUserControl.value).toBeNull();
      expect(component.caseField.value).toBeNull();

      expect(
        component.complexGroup.get('idamId')?.value
      ).toBeNull();
    });

    it('should not clear the control when focus moves to an autocomplete option', () => {
      component.staffUserSelected = false;
      component.staffUserControl.setValue('Alex');

      component.onBlur({
        relatedTarget: {
          role: 'option'
        }
      });

      expect(component.staffUserControl.value).toBe('Alex');
    });

    it('should preserve a selected user on blur', () => {
      component.staffUserSelected = true;

      component.staffUserControl.setValue({
        idamId: 'selected-id',
        displayName: 'Selected user'
      });

      component.caseField.value = {
        idamId: 'selected-id'
      };

      component.complexGroup
        .get('idamId')
        ?.setValue('selected-id');

      component.onBlur({
        relatedTarget: null
      });

      expect(component.caseField.value).toEqual({
        idamId: 'selected-id'
      });

      expect(
        component.complexGroup.get('idamId')?.value
      ).toBe('selected-id');
    });

    it('should clear persisted values when the control has no value', () => {
      component.staffUserControl.setValue(null);

      component.onBlur({
        relatedTarget: null
      });

      expect(component.caseField.value).toBeNull();

      expect(
        component.complexGroup.get('idamId')?.value
      ).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from the jurisdiction subscription', () => {
      spyOn(
        component.jurisdictionSubscription,
        'unsubscribe'
      ).and.callThrough();

      component.ngOnDestroy();

      expect(
        component.jurisdictionSubscription.unsubscribe
      ).toHaveBeenCalled();
    });

    it('should stop responding to jurisdiction changes after destroy', () => {
      component.ngOnDestroy();

      selectedJurisdiction.next({
        id: 'NEW-JURISDICTION',
        currentCaseType: {
          id: 'NEW-CASE-TYPE'
        }
      });

      expect(component.jurisdiction).toBe('FALLBACK');
      expect(component.caseType).toBe('FALLBACK-TEST');
    });

    it('should stop responding to case notifier changes after destroy', () => {
      component.ngOnDestroy();

      caseView.next({
        case_type: {
          id: 'NEW-CASE-TYPE',
          jurisdiction: {
            id: 'NEW-JURISDICTION'
          }
        }
      });

      expect(component.jurisdiction).toBe('FALLBACK');
      expect(component.caseType).toBe('FALLBACK-TEST');
    });
  });
});

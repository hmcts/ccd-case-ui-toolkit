import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import createSpyObj = jasmine.createSpyObj;
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { IsCompoundPipe } from '../../palette/utils/is-compound.pipe';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { OrderService } from '../../../services/order/order.service';
import { aWizardPage } from '../case-edit.spec';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { LogService } from '../../../services/logging/log.service';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FormValueService } from '../../../services/form/form-value.service';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { ProfileService, ProfileNotifier } from '../../../services/profile';
import { Profile } from '../../../domain';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { AbstractAppConfig } from '../../../../app.config';

describe('CaseEditSubmitComponent', () => {

  let comp: CaseEditSubmitComponent;
  let fixture: ComponentFixture<CaseEditSubmitComponent>;
  let de: DebugElement;

  const END_BUTTON_LABEL = 'Go now!';
  let formValueService: any;
  let formErrorService: any;
  let appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getLoggingCaseFieldList']);
  appConfig.getLoggingCaseFieldList.and.returnValue('respondents,staffUploadedDocuments');
  let logService = new LogService(appConfig);
  let caseFieldService = new CaseFieldService(logService);
  let fieldsUtils: FieldsUtils = new FieldsUtils();
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({ 'PersonLastName': new FormControl('Khaleesi') })
  });
  let caseEditComponent: any;
  let pages: WizardPage[];
  let wizard: Wizard;
  let orderService;
  let profileService;
  let profileNotifier;
  let profileNotifierSpy;
  let casesReferencePipe: any;
  let caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 3);
  let caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', 2);
  let caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', 1);
  const $EVENT_NOTES = By.css('#fieldset-event');
  let cancelled: any;
  let snapshot: any;

  let USER = {
    idam: {
      id: 'userId',
      email: 'string',
      forename: 'string',
      surname: 'string',
      roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
    }
  };
  let FUNC = () => false;
  let PROFILE: Profile = {
    channels: [],
    jurisdictions: [],
    default: {
      workbasket: {
        case_type_id: '',
        jurisdiction_id: '',
        state_id: ''
      }
    },
    user: USER,
    'isSolicitor': FUNC,
    'isCourtAdmin': FUNC,
  };

  let mockRoute: any = {
    snapshot: {
      data: {},
      params: {},
      pathFromRoot: [
        {},
        {
          data: {
            profile: PROFILE
          }
        }
      ]
    },
    params: of({})
  };

  describe('Save and Resume disabled', () => {
    pages  = [
      aWizardPage('page1', 'Page 1', 1),
      aWizardPage('page2', 'Page 2', 2),
      aWizardPage('page3', 'Page 3', 3)
    ];
    let firstPage = pages[0];
    wizard = new Wizard(pages);
    beforeEach(async(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP,
        'data': '',
        'eventTrigger':
          {'case_fields': [caseField1, caseField2, caseField3], 'end_button_label': END_BUTTON_LABEL, 'can_save_draft': false},
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'cancel': () => undefined,
        'cancelled': cancelled,
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseFieldService, useValue: caseFieldService},
          {provide: FieldsUtils, useValue: fieldsUtils},
          {provide: CaseReferencePipe, useValue: casesReferencePipe},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: ProfileService, useValue: profileService},
          {provide: ProfileNotifier, useValue: profileNotifier}
        ]
      }).compileComponents();

    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should announce profile when profile exists on a path from root set by Router', () => {
      expect(profileNotifierSpy.calls.mostRecent().args[0].user).toEqual(USER);
      expect(profileNotifierSpy.calls.mostRecent().args[0].isSolicitor.toString()).toEqual(FUNC.toString());
      expect(profileService.get).not.toHaveBeenCalled();
    });

    it('must render correct button label', () => {
      let buttons = de.queryAll(By.css('div>button'));
      expect(buttons[1].nativeElement.textContent.trim()).toEqual(END_BUTTON_LABEL);
    });

    it('should delegate navigateToPage calls to caseEditComponent', () => {
      comp.navigateToPage('somePage');
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should delegate cancel calls to caseEditComponent if save and resume disabled', () => {
      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalled();
    });

    it('should not allow changes for READONLY fields', () => {
      let changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'READONLY', null));
      expect(changeAllowed).toBeFalsy();
    });

    it('should allow changes for non READONLY fields', () => {
      let changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null));
      expect(changeAllowed).toBeTruthy();
    });

    it('should return TRUE for canShowFieldInCYA when caseField show_summary_change_option is TRUE', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      let canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeTruthy();
    });

    it('should return FALSE for canShowFieldInCYA when caseField show_summary_change_option is FALSE', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = false;
      let canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeFalsy();
    });

    it('should return lastPageShown', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();

      comp.previous();

      expect(comp.navigateToPage).toHaveBeenCalled();
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should return false when no field exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      let result = comp.checkYourAnswerFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      comp.wizard.pages[0].case_fields = [caseField];
      comp.eventTrigger.show_summary = true;

      let result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeTruthy();
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeTruthy();
    });

    it('should show event notes when set in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not set in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = null;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not defined in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should not show event notes when set to false in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = false;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeTruthy();
    });

    it('should sort case fields with show_summary_content_option', () => {
      expect(comp.eventTrigger.case_fields[0].show_summary_content_option).toBe(3);
      expect(comp.eventTrigger.case_fields[1].show_summary_content_option).toBe(2);
      expect(comp.eventTrigger.case_fields[2].show_summary_content_option).toBe(1);
      expect(orderService.sort).toHaveBeenCalledWith(
        comp.eventTrigger.case_fields,
        CaseEditSubmitComponent.SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION);
      expect(comp.showSummaryFields.length).toBe(3);
      expect(comp.showSummaryFields[0].show_summary_content_option).toBe(1);
      expect(comp.showSummaryFields[1].show_summary_content_option).toBe(2);
      expect(comp.showSummaryFields[2].show_summary_content_option).toBe(3);
    });

    it('should return "Cancel" text label for cancel button when save and resume disabled', () => {
      let result = comp.getCancelText();
      expect(result).toBe('Cancel');
    });

    it('should disable submit button, previous button and cancel link when isSubmitting is set to true', () => {
      comp.isSubmitting = true;
      fixture.detectChanges();

      let submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();

      let prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeTruthy();

      let cancelLink = de.query(By.css('a[class=disabled]'));
      console.log(cancelLink);
      expect(cancelLink.nativeElement).toBeTruthy();
    });

    it('should enable submit button, previous button and cancel link when isSubmitting is set to false', () => {
      comp.isSubmitting = false;
      fixture.detectChanges();

      let submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();

      let prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeFalsy();

      let cancelLink = de.query(By.css('a[class=disabled]'));
      expect(cancelLink).toBeNull();
    });

  });

  describe('CaseEditSubmitComponent without custom end button label and with Save and Resume enabled', () => {
    pages = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    let firstPage = pages[0];
    wizard = new Wizard(pages);
    let queryParamMapNoProfile = createSpyObj('queryParamMap', ['get']);
    let snapshotNoProfile = {
      pathFromRoot: [
        {},
        {
          data: {
            nonProfileData: {
              user: {
                idam: {
                  id: 'userId',
                  email: 'string',
                  forename: 'string',
                  surname: 'string',
                  roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
                }
              },
              'isSolicitor': () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);
    let mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };
    beforeEach(async(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP,
        'data': '',
        'eventTrigger': { 'case_fields': [], 'can_save_draft': true },
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'cancel': () => undefined,
        'cancelled': cancelled,
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileService.get.and.returnValue(PROFILE_OBS);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileService, useValue: profileService },
          { provide: ProfileNotifier, useValue: profileNotifier }
        ]
      }).compileComponents();

    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should announce profile when profile exists on a path from root set by Router', () => {
      expect(profileNotifierSpy.calls.mostRecent().args[0].user).toEqual(USER);
      expect(profileNotifierSpy.calls.mostRecent().args[0].isSolicitor.toString()).toEqual(FUNC.toString());
      expect(profileService.get).toHaveBeenCalled();
    });

    it('must render default button label when custom one is not supplied', () => {
      let buttons = de.queryAll(By.css('div>button'));
      expect(buttons[1].nativeElement.textContent.trim()).toEqual('Submit');
    });

    it('should emit RESUMED_FORM_DISCARD on create event if cancel triggered and originated from view case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    });

    it('should emit NEW_FORM_DISCARD on create event if cancel triggered and originated from create case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return '';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    });

    it('should return "Return to case list" text label for cancel button when save and resume enabled', () => {
      let result = comp.getCancelText();
      expect(result).toBe('Return to case list');
    });
  });
});

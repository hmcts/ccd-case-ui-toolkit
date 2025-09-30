import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of } from 'rxjs';
import { CaseEventData, CaseEventTrigger, CaseField, CaseView, FieldType, HttpError } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture';
import { CaseReferencePipe } from '../../../pipes';
import { ActivityPollingService, AlertService, FieldsUtils, LoadingService, SessionStorageService } from '../../../services';
import { CaseNotifier, CasesService } from '../../case-editor';
import { CaseEventTriggerComponent } from './case-event-trigger.component';
import createSpyObj = jasmine.createSpyObj;
import { EventTriggerResolver } from '../services';

describe('CaseEventTriggerComponent', () => {
  const PAGE_ID = 'pageId';
  const CASE_DETAILS: CaseView = new CaseView();
  CASE_DETAILS.case_id = '42';
  CASE_DETAILS.case_type = {
    id: 'TEST_CASE_TYPE',
    name: 'Test Case Type',
    jurisdiction: {
      id: 'TEST',
      name: 'Test'
    }
  };
  CASE_DETAILS.case_type.id = 'TEST_CASE_TYPE';
  CASE_DETAILS.case_type.jurisdiction.id = 'TEST';

  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    'TEST_TRIGGER',
    'Test Trigger',
    '3',
    true,
    [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        field_type: {
          id: 'Text',
          type: 'Text'
        } as FieldType,
        display_context: 'READONLY'
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        field_type: {
          id: 'Text',
          type: 'Text'
        } as FieldType,
        display_context: 'OPTIONAL'
      }) as CaseField
    ]
  );

  const SANITISED_EDIT_FORM: CaseEventData = {
    data: {
      PersonLastName: 'Khaleesi'
    },
    event: {
      id: EVENT_TRIGGER.id,
      summary: 'Some summary',
      description: 'Some description'
    },
    event_token: 'cbcdcbdh',
    ignore_warning: false
  };

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let fixture: ComponentFixture<CaseEventTriggerComponent>;
  let component: CaseEventTriggerComponent;

  const caseEditComponentMock: any = MockComponent({
    selector: 'ccd-case-edit',
    inputs: ['eventTrigger', 'submit', 'validate', 'caseDetails', 'saveDraft'],
    outputs: ['cancelled', 'submitted']
  });

  const caseActivityComponentMock: any = MockComponent({
    selector: 'ccd-activity',
    inputs: ['caseId', 'displayMode']
  });

  const caseHeaderComponentMock: any = MockComponent({
    selector: 'ccd-case-header',
    inputs: ['caseDetails']
  });

  const eventTriggerHeaderComponentMock: any = MockComponent({
    selector: 'ccd-event-trigger-header',
    inputs: ['eventTrigger']
  });

  const fieldReadComponentMock: any = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField']
  });

  const fieldWriteComponentMock: any = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'formGroup', 'idPrefix', 'isExpanded', 'parent']
  });

  const routerLinkComponentMock: any = MockComponent({
    selector: 'a'
  });

  const URL_SEGMENTS: UrlSegment[] = [
    new UrlSegment('a', {}),
    new UrlSegment('b', {})
  ];

  const URL_SEGMENTS_OBS: Observable<UrlSegment[]> = of(URL_SEGMENTS);

  const mockRoute: any = {
    snapshot: {
      data: {
        case: CASE_DETAILS,
        eventTrigger: EVENT_TRIGGER
      }
    },
    parent: {
      url: URL_SEGMENTS_OBS
    }
  };

  let router: any;
  let alertService: any;
  let caseNotifier: any;
  let casesService: any;
  let eventResolverService: any;
  let loadingService: any;
  let sessionStorageService: any;
  let casesReferencePipe: any;
  let activityPollingService: any;
  const finalUrl = '/cases/case-details/1707912713167104#Claim%20details';

  beforeEach(waitForAsync(() => {
    caseNotifier = createSpyObj<CaseNotifier>('caseService', ['announceCase']);
    casesService = createSpyObj<CasesService>('casesService', ['createEvent', 'validateCase']);
    eventResolverService = createSpyObj<EventTriggerResolver>('eventTriggerResolver', ['resetCachedEventTrigger']);
    loadingService = new LoadingService();
    casesService.createEvent.and.returnValue(of(true));
    casesService.validateCase.and.returnValue(of(true));

    casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);

    alertService = createSpyObj<AlertService>('alertService', ['success', 'warning', 'setPreserveAlerts']);
    activityPollingService = createSpyObj<ActivityPollingService>('activityPollingService', ['postEditActivity']);
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
    activityPollingService.postEditActivity.and.returnValue(of(true));
    router = {
      navigate: jasmine.createSpy('navigate'),
      url: '',
      getCurrentNavigation: jasmine.createSpy('getCurrentNavigation')
    };
    router.navigate.and.returnValue({ then: (f) => f() });
    router.getCurrentNavigation.and.returnValue({ previousNavigation: { finalUrl: finalUrl } });

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          caseEditComponentMock,
          caseActivityComponentMock,
          caseHeaderComponentMock,
          eventTriggerHeaderComponentMock,
          routerLinkComponentMock,
          fieldReadComponentMock,
          fieldWriteComponentMock
        ],
        declarations: [
          CaseEventTriggerComponent,
          // Mocks
          CaseReferencePipe
        ],
        providers: [
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: CasesService, useValue: casesService },
          { provide: Router, useValue: router },
          { provide: AlertService, useValue: alertService },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivityPollingService, useValue: activityPollingService },
          { provide: SessionStorageService, useValue: sessionStorageService },
          { provide: LoadingService, useValue: loadingService },
          { provide: EventTriggerResolver, useValue: eventResolverService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseEventTriggerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should edit case with sanitised data when form submitted', () => {
    component.submit()(SANITISED_EDIT_FORM);

    expect(casesService.createEvent).toHaveBeenCalledWith(CASE_DETAILS, SANITISED_EDIT_FORM);
  });

  it('should edit case with sanitised data when form validated', () => {
    component.validate()(SANITISED_EDIT_FORM, PAGE_ID);

    expect(casesService.validateCase).toHaveBeenCalledWith(CASE_DETAILS.case_type.id, SANITISED_EDIT_FORM, PAGE_ID);
  });

  it('should navigate to case view upon successful event creation', () => {
    casesService.createEvent.and.returnValue(of({}));

    component.submitted({ caseId: 123 });

    expect(router.navigate).toHaveBeenCalledWith([`/${URL_SEGMENTS[0].path}/${URL_SEGMENTS[1].path}`]);
  });

  it('should alert success message after navigation upon successful event creation', () => {
    casesService.createEvent.and.returnValue(of({}));

    component.submitted({ caseId: 123 });

    expect(alertService.success).toHaveBeenCalled();
  });

  it('should alert success message after navigation upon successful event creation and call back', () => {
    casesService.createEvent.and.returnValue(of({}));

    component.submitted({ caseId: 123, status: 'happy' });

    expect(alertService.success).toHaveBeenCalled();
  });

  it('should alert warning message after task completion error available and set to true in session storage', () => {
    casesService.createEvent.and.returnValue(of({}));
    sessionStorageService.getItem.and.returnValue('true');

    component.submitted({ caseId: 123, status: 'happy' });

    expect(alertService.warning).toHaveBeenCalled();
  });

  it('should alert warning message after navigation upon successful event creation but incomplete call back', () => {
    casesService.createEvent.and.returnValue(of({}));

    component.submitted({ caseId: 123, status: 'INCOMPLETE_CALLBACK' });

    expect(alertService.warning).toHaveBeenCalled();
  });

  it('should verify cancel navigate to the correct url', () => {
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/cases/case-details/1707912713167104'], { fragment: 'Claim details' });
  });

  it('should bypass validation if the eventTrigger case fields contain a FlagLauncher field', (done) => {
    spyOn(FieldsUtils, 'isCaseFieldOfType').and.callThrough();
    component.eventTrigger = {
      id: 'event',
      name: 'Dummy event',
      case_fields: [
        {
          id: 'caseFlagLauncherField1',
          field_type: {
            id: 'FlagLauncher',
            type: 'FlagLauncher'
          } as FieldType
        } as CaseField
      ],
      event_token: 'abc',
      wizard_pages: [],
      hasFields(): boolean {
        return true;
      },
      hasPages(): boolean {
        return false;
      }
    };
    SANITISED_EDIT_FORM.data = {
      caseFlagLauncherField1: null
    };

    component.validate()(SANITISED_EDIT_FORM, PAGE_ID).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
    expect(FieldsUtils.isCaseFieldOfType).toHaveBeenCalledWith(component.eventTrigger.case_fields[0], ['FlagLauncher']);
    expect(casesService.validateCase).not.toHaveBeenCalled();
  });

  it('should not bypass validation if the eventTrigger case fields do not contain a FlagLauncher field', (done) => {
    spyOn(FieldsUtils, 'isCaseFieldOfType').and.callThrough();
    component.eventTrigger = {
      id: 'event',
      name: 'Dummy event',
      case_fields: [
        {
          id: 'textField1',
          field_type: {
            id: 'Text',
            type: 'Text'
          } as FieldType
        } as CaseField
      ],
      event_token: 'abc',
      wizard_pages: [],
      hasFields(): boolean {
        return true;
      },
      hasPages(): boolean {
        return false;
      }
    };
    SANITISED_EDIT_FORM.data = {
      caseFlagLauncherField1: null
    };

    component.validate()(SANITISED_EDIT_FORM, PAGE_ID).subscribe((result) => {
      expect(result).not.toBeNull();
      done();
    });
    expect(FieldsUtils.isCaseFieldOfType).toHaveBeenCalledWith(component.eventTrigger.case_fields[0], ['FlagLauncher']);
    expect(casesService.validateCase).toHaveBeenCalled();
  });

  it('should not bypass validation if the eventTrigger has no case fields', (done) => {
    spyOn(FieldsUtils, 'isCaseFieldOfType').and.callThrough();
    component.eventTrigger = {
      id: 'event',
      name: 'Dummy event',
      case_fields: null,
      event_token: 'abc',
      wizard_pages: [],
      hasFields(): boolean {
        return true;
      },
      hasPages(): boolean {
        return false;
      }
    };
    SANITISED_EDIT_FORM.data = {
      caseFlagLauncherField1: null
    };

    component.validate()(SANITISED_EDIT_FORM, PAGE_ID).subscribe((result) => {
      expect(result).not.toBeNull();
      done();
    });
    expect(FieldsUtils.isCaseFieldOfType).not.toHaveBeenCalled();
    expect(casesService.validateCase).toHaveBeenCalled();
  });

  it('should not bypass validation if the eventTrigger is falsy', (done) => {
    spyOn(FieldsUtils, 'isCaseFieldOfType').and.callThrough();
    component.eventTrigger = null;

    component.validate()(SANITISED_EDIT_FORM, PAGE_ID).subscribe((result) => {
      expect(result).not.toBeNull();
      done();
    });
    expect(FieldsUtils.isCaseFieldOfType).not.toHaveBeenCalled();
    expect(casesService.validateCase).toHaveBeenCalled();
  });

  it('should cancel navigate to linked cases tab', () => {
    const routerWithModifiedUrl = TestBed.inject(Router);
    routerWithModifiedUrl.url = 'linkCases';
    component.caseDetails.case_id = '1111-2222-3333-4444';
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/cases/case-details/1707912713167104'], { fragment: 'Claim details' });
  });

  it('should call unregisterStoredSpinner if there is a stored spinnter', () => {
    spyOn(loadingService, 'hasSharedSpinner').and.returnValue(true);
    spyOn(loadingService, 'unregisterSharedSpinner');
    component.ngOnInit();
    expect(loadingService.hasSharedSpinner).toBeTruthy();
    expect(loadingService.unregisterSharedSpinner).toHaveBeenCalled();
  });
});

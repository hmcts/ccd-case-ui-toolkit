import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { plainToClassFromExist } from 'class-transformer';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of, throwError } from 'rxjs';
import { CaseView, HttpError } from '../../../domain';
import { AlertService, DraftService, NavigationNotifierService } from '../../../services';
import { CaseNotifier, CasesService } from '../../case-editor';
import { CaseViewComponent } from './case-view.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseViewComponent', () => {
  const CASE_REFERENCE = '1234123412341234';
  const DRAFT_REFERENCE = 'DRAFT1234';
  const CASE_VIEW: CaseView = plainToClassFromExist(new CaseView(), {
    case_id: CASE_REFERENCE,
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
    events: []
  });
  const CASE_VIEW_OBS: Observable<CaseView> = of(CASE_VIEW);

  let caseNotifier;
  let casesService;
  let alertService: any;
  let draftService: any;
  let navigationNotifierService: NavigationNotifierService;

  let fixture: ComponentFixture<CaseViewComponent>;
  let component: CaseViewComponent;
  let de: DebugElement;

  const caseViewerComponentMock: any = MockComponent({
    selector: 'ccd-case-viewer',
    inputs: ['hasPrint', 'hasEventSelector']
  });

  describe('Case', () => {
    describe('CaseViewComponent successfully resolves case view', () => {
      beforeEach(waitForAsync(() => {
        caseNotifier = createSpyObj('caseService', ['announceCase']);
        navigationNotifierService = new NavigationNotifierService();
        draftService = createSpyObj('draftService', ['getDraft']);

        casesService = createSpyObj('casesService', ['getCaseViewV2']);
        casesService.getCaseViewV2.and.returnValue(CASE_VIEW_OBS);

        alertService = createSpyObj('alertService', ['error']);
        alertService.error.and.returnValue(of({}));

        TestBed
          .configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
              CaseViewComponent,

              // Mocks
              caseViewerComponentMock
            ],
            providers: [
              {provide: NavigationNotifierService, useValue: navigationNotifierService},
              {provide: CaseNotifier, useValue: caseNotifier},
              {provide: CasesService, useValue: casesService},
              {provide: AlertService, useValue: alertService},
              {provide: DraftService, useValue: draftService},
            ]
          })
          .compileComponents();

        fixture = TestBed.createComponent(CaseViewComponent);
        component = fixture.componentInstance;
        component.case = CASE_REFERENCE;
        component.hasPrint = true;
        component.hasEventSelector = true;
        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should get case view on loading and announce it', () => {
        expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_VIEW.case_id);
        expect(caseNotifier.announceCase).toHaveBeenCalledWith(CASE_VIEW);
      });
    });

    describe('CaseViewComponent fails to resolve case view', () => {
      const ERROR_MSG = 'Critical error!';

      beforeEach(waitForAsync(() => {
        const ERROR: HttpError = new HttpError();
        ERROR.message = ERROR_MSG;
        const ERROR_OBS: Observable<HttpError> = throwError(ERROR);
        casesService.getCaseViewV2.and.returnValue(ERROR_OBS);

        caseNotifier = createSpyObj('caseService', ['announceCase']);
        alertService = createSpyObj('alertService', ['error']);

        TestBed
          .configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
              CaseViewComponent,

              // Mocks
              caseViewerComponentMock
            ],
            providers: [
              {provide: NavigationNotifierService, useValue: navigationNotifierService},
              {provide: CaseNotifier, useValue: caseNotifier},
              {provide: CasesService, useValue: casesService},
              {provide: AlertService, useValue: alertService},
              {provide: DraftService, useValue: draftService},
            ]
          })
          .compileComponents();

        fixture = TestBed.createComponent(CaseViewComponent);
        component = fixture.componentInstance;
        component.case = CASE_REFERENCE;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should call alert service and not announce case', () => {
        expect(alertService.error).toHaveBeenCalledWith(ERROR_MSG);
        expect(caseNotifier.announceCase).not.toHaveBeenCalledWith(CASE_VIEW);
      });
    });
  });

  describe('Draft', () => {
    describe('CaseViewComponent successfully resolves case view from draft', () => {
      beforeEach(waitForAsync(() => {
        caseNotifier = createSpyObj('caseService', ['announceCase']);
        casesService = createSpyObj('casesService', ['getCaseViewV2']);

        draftService = createSpyObj('draftService', ['getDraft']);
        draftService.getDraft.and.returnValue(CASE_VIEW_OBS);

        alertService = createSpyObj('alertService', ['error']);
        alertService.error.and.returnValue(of({}));

        TestBed
          .configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
              CaseViewComponent,

              // Mocks
              caseViewerComponentMock
            ],
            providers: [
              {provide: NavigationNotifierService, useValue: navigationNotifierService},
              {provide: CaseNotifier, useValue: caseNotifier},
              {provide: CasesService, useValue: casesService},
              {provide: AlertService, useValue: alertService},
              {provide: DraftService, useValue: draftService},
            ]
          })
          .compileComponents();

        fixture = TestBed.createComponent(CaseViewComponent);
        component = fixture.componentInstance;
        component.case = DRAFT_REFERENCE;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should get case view on loading and announce it', () => {
        expect(draftService.getDraft).toHaveBeenCalledWith(DRAFT_REFERENCE);
        expect(caseNotifier.announceCase).toHaveBeenCalledWith(CASE_VIEW);
      });
    });

    describe('CaseViewComponent fails to resolve case view from draft', () => {
      const ERROR_MSG = 'Critical error!';

      beforeEach(waitForAsync(() => {
        const ERROR: HttpError = new HttpError();
        ERROR.message = ERROR_MSG;
        const ERROR_OBS: Observable<HttpError> = throwError(ERROR);
        draftService.getDraft.and.returnValue(ERROR_OBS);

        caseNotifier = createSpyObj('caseService', ['announceCase']);
        alertService = createSpyObj('alertService', ['error']);

        TestBed
          .configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
              CaseViewComponent,

              // Mocks
              caseViewerComponentMock
            ],
            providers: [
              {provide: NavigationNotifierService, useValue: navigationNotifierService},
              {provide: CaseNotifier, useValue: caseNotifier},
              {provide: CasesService, useValue: casesService},
              {provide: AlertService, useValue: alertService},
              {provide: DraftService, useValue: draftService}
            ]
          })
          .compileComponents();

        fixture = TestBed.createComponent(CaseViewComponent);
        component = fixture.componentInstance;
        component.case = DRAFT_REFERENCE;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should call alert service and not announce case', () => {
        expect(alertService.error).toHaveBeenCalledWith(ERROR_MSG);
        expect(caseNotifier.announceCase).not.toHaveBeenCalledWith(CASE_VIEW);
      });
    });
  });
});

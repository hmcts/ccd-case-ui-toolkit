import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import createSpyObj = jasmine.createSpyObj;
import { CaseViewComponent } from './case-view.component';
import { CaseView, HttpError } from '../../../domain';
import { CasesService, CaseService } from '../../case-editor';
import { AlertService, DraftService } from '../../../services';
import { RouterTestingModule } from '@angular/router/testing'

describe('CaseViewComponent', () => {

  const CASE_REFERENCE = '1234123412341234';
  const DRAFT_REFERENCE = 'DRAFT1234';
  const CASE_VIEW: CaseView = {
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
  };
  const CASE_VIEW_OBS: Observable<CaseView> = Observable.of(CASE_VIEW);

  let caseService;
  let casesService;
  let alertService: any;
  let draftService: any;

  let fixture: ComponentFixture<CaseViewComponent>;
  let component: CaseViewComponent;
  let de: DebugElement;

  describe('Case', () => {
    describe('CaseViewComponent successfully resolves case view', () => {
        beforeEach(async(() => {

          caseService = createSpyObj('caseService', ['announceCase']);
          draftService = createSpyObj('draftService', ['getDraft']);

          casesService = createSpyObj('casesService', ['getCaseViewV2']);
          casesService.getCaseViewV2.and.returnValue(CASE_VIEW_OBS);

          alertService = createSpyObj('alertService', ['error']);
          alertService.error.and.returnValue(Observable.of({}));

          TestBed
            .configureTestingModule({
              imports: [ RouterTestingModule ],
              declarations: [
                CaseViewComponent,
              ],
              providers: [
                { provide: CaseService, useValue: caseService },
                { provide: CasesService, useValue: casesService },
                { provide: AlertService, useValue: alertService },
                { provide: DraftService, useValue: draftService },
              ]
            })
            .compileComponents();

          fixture = TestBed.createComponent(CaseViewComponent);
          component = fixture.componentInstance;
          component.case = CASE_REFERENCE;
          de = fixture.debugElement;
          fixture.detectChanges();
        }));

        it('should get case view on loading and announce it', () => {
            expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_VIEW.case_id);
            expect(caseService.announceCase).toHaveBeenCalledWith(CASE_VIEW);
        });
      });

    describe('CaseViewComponent fails to resolve case view', () => {

        const ERROR_MSG = 'Critical error!';

        beforeEach(async(() => {

        const ERROR: HttpError = new HttpError();
        ERROR.message = ERROR_MSG;
        const ERROR_OBS: Observable<HttpError> = throwError(ERROR);
        casesService.getCaseViewV2.and.returnValue(ERROR_OBS);

        caseService = createSpyObj('caseService', ['announceCase']);
        alertService = createSpyObj('alertService', ['error']);

        TestBed
            .configureTestingModule({
            imports: [ RouterTestingModule ],
            declarations: [
                CaseViewComponent,
            ],
            providers: [
                { provide: CaseService, useValue: caseService },
                { provide: CasesService, useValue: casesService },
                { provide: AlertService, useValue: alertService },
                { provide: DraftService, useValue: draftService },
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
            expect(caseService.announceCase).not.toHaveBeenCalledWith(CASE_VIEW);
        });
    });
  });

  describe('Draft', () => {
    describe('CaseViewComponent successfully resolves case view from draft', () => {
        beforeEach(async(() => {

        caseService = createSpyObj('caseService', ['announceCase']);
        casesService = createSpyObj('casesService', ['getCaseViewV2']);

        draftService = createSpyObj('draftService', ['getDraft']);
        draftService.getDraft.and.returnValue(CASE_VIEW_OBS);

        alertService = createSpyObj('alertService', ['error']);
        alertService.error.and.returnValue(Observable.of({}));

        TestBed
            .configureTestingModule({
            imports: [ RouterTestingModule ],
            declarations: [
                CaseViewComponent,
            ],
            providers: [
                { provide: CaseService, useValue: caseService },
                { provide: CasesService, useValue: casesService },
                { provide: AlertService, useValue: alertService },
                { provide: DraftService, useValue: draftService },
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
            expect(caseService.announceCase).toHaveBeenCalledWith(CASE_VIEW);
        });
    });

    describe('CaseViewComponent fails to resolve case view from draft', () => {

        const ERROR_MSG = 'Critical error!';

        beforeEach(async(() => {

        const ERROR: HttpError = new HttpError();
        ERROR.message = ERROR_MSG;
        const ERROR_OBS: Observable<HttpError> = throwError(ERROR);
        draftService.getDraft.and.returnValue(ERROR_OBS);

        caseService = createSpyObj('caseService', ['announceCase']);
        alertService = createSpyObj('alertService', ['error']);

        TestBed
            .configureTestingModule({
            imports: [ RouterTestingModule ],
            declarations: [
                CaseViewComponent,
            ],
            providers: [
                { provide: CaseService, useValue: caseService },
                { provide: CasesService, useValue: casesService },
                { provide: AlertService, useValue: alertService },
                { provide: DraftService, useValue: draftService },
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
            expect(caseService.announceCase).not.toHaveBeenCalledWith(CASE_VIEW);
        });
    });
  });

});

import createSpyObj = jasmine.createSpyObj;
import { CaseEditWizardGuard } from './case-edit-wizard.guard';
import { ActivatedRouteSnapshot } from '@angular/router';
import { createCaseEventTrigger } from '../../../fixture/shared.fixture';
import { TestRouteSnapshotBuilder } from '../../../test/test-route-snapshot-builder';
import { AlertService } from '../../../services/alert/alert.service';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { WizardPage } from '../domain/wizard-page.model';
import { EventTriggerService } from './event-trigger.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('CaseEditWizardGuard', () => {

  const PARENT_URL = '/case/123/trigger/editEvent';
  const PARENT_URL_SEGMENTS = PARENT_URL.split('/');

  let router: any;
  let routerHelper: any;
  let route: ActivatedRouteSnapshot;

  let eventTrigger: CaseEventTrigger;
  let routeParams: any;
  let queryParams: any;

  let wizardFactory: any;
  let wizard: any;
  let alertService: any;
  let eventTriggerService: any;

  let wizardGuard: CaseEditWizardGuard;

  beforeEach(() => {

    eventTrigger = createCaseEventTrigger('editCase', 'Edit case', 'caseId', false, [ new CaseField() ], [ page('pageX') ]);

    routeParams = {
      'page': 'pageX'
    };

    queryParams = { queryParams: [] };

    router = createSpyObj('router', ['navigate']);
    router.navigate.and.returnValues(Promise.resolve(true), Promise.resolve(true));
    routerHelper = createSpyObj('RouterHelperService', ['getUrlSegmentsFromRoot']);
    routerHelper.getUrlSegmentsFromRoot.and.returnValue(PARENT_URL_SEGMENTS);

    let parentRoute = new TestRouteSnapshotBuilder().withData({
      eventTrigger: eventTrigger
    }).build();
    route = new TestRouteSnapshotBuilder()
      .withParent(parentRoute)
      .withParams(routeParams)
      .build();

    wizard = createSpyObj('Wizard', ['firstPage', 'hasPage', 'getPage', 'nextPage']);
    wizard.hasPage.and.returnValue(true);
    wizard.getPage.and.returnValue(eventTrigger.wizard_pages[0]);

    wizardFactory = createSpyObj('WizardFactory', ['create']);
    wizardFactory.create.and.returnValue(wizard);

    alertService = createSpyObj<AlertService>('AlertService', ['error']);

    eventTriggerService = new EventTriggerService();

    wizardGuard = new CaseEditWizardGuard(router, routerHelper, wizardFactory, alertService, eventTriggerService);
  });

  it('by default, should not redirect', () => {
    wizardGuard.resolve(route);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('by default, should resolve successfully', done => {
    wizardGuard.resolve(route)
      .then(value => {
        expect(value).toBeTruthy();
      })
      .then(done)
      .catch(fail);
  });

  describe('when no fields', () => {

    it('should redirect to submit page when fields are `null`', () => {
      eventTrigger.case_fields = null;

      wizardGuard.resolve(route);

      expect(router.navigate).toHaveBeenCalledWith([...PARENT_URL_SEGMENTS, 'submit']);
    });

    it('should redirect to submit page when fields are empty', () => {
      eventTrigger.case_fields = [];

      wizardGuard.resolve(route);

      expect(router.navigate).toHaveBeenCalledWith([...PARENT_URL_SEGMENTS, 'submit']);
    });

  });

  describe('when no pages', () => {
    it('should redirect to submit page when pages are `null`', () => {
      eventTrigger.wizard_pages = null;

      wizardGuard.resolve(route);

      expect(router.navigate).toHaveBeenCalledWith([...PARENT_URL_SEGMENTS, 'submit']);
    });

    it('should redirect to submit page when pages are empty', () => {
      eventTrigger.wizard_pages = [];

      wizardGuard.resolve(route);

      expect(router.navigate).toHaveBeenCalledWith([...PARENT_URL_SEGMENTS, 'submit']);
    });

  });

  describe('when no `page` param in route', () => {
    beforeEach(() => {
      delete routeParams['page'];

      wizard.firstPage.and.returnValue(page('page1'));
    });

    it('should redirect to first visible page of wizard', done => {

      wizardGuard.resolve(route)
        .then(() => {
          expect(router.navigate.calls.allArgs()).toEqual([
            [ [ ...PARENT_URL_SEGMENTS ] ],
            [ [ ...PARENT_URL_SEGMENTS, 'page1' ], Object({ replaceUrl: true, queryParams: [  ] }) ]
          ]);
          expect(wizard.firstPage).toHaveBeenCalled();
        })
        .then(done)
        .catch(fail);

    });

    it('should redirect when `page` param is empty', done => {
      routeParams['page'] = '';

      wizardGuard.resolve(route)
        .then(() => {
          expect(router.navigate.calls.allArgs()).toEqual([
            [ [ ...PARENT_URL_SEGMENTS ] ],
            [ [ ...PARENT_URL_SEGMENTS, 'page1' ], Object({ replaceUrl: true, queryParams: [  ] }) ]
          ]);
          expect(wizard.firstPage).toHaveBeenCalled();
        })
        .then(done)
        .catch(fail);

    });

    it('should redirect to submit when all pages hidden', done => {
      wizard.firstPage.and.returnValue(null);

      wizardGuard.resolve(route)
        .then(() => {
          expect(router.navigate.calls.allArgs()).toEqual([
            [ [ ...PARENT_URL_SEGMENTS ] ],
            [ [ ...PARENT_URL_SEGMENTS, 'submit' ], Object({ replaceUrl: true, queryParams: [  ] }) ]
          ]);
          expect(wizard.firstPage).toHaveBeenCalled();
        })
        .then(done)
        .catch(fail);
    });
  });

  describe('when accessing an unknown page', () => {
    beforeEach(() => {
      routeParams['page'] = 'unknown';

      wizard.firstPage.and.returnValue(page('page1'));
      wizard.hasPage.and.returnValue(false);
    });

    it('should redirect to first wizard page', done => {
      wizardGuard.resolve(route)
        .then(() => {
          expect(router.navigate.calls.allArgs()).toEqual([
            [ [ ...PARENT_URL_SEGMENTS ] ],
            [ [ ...PARENT_URL_SEGMENTS, 'page1' ], Object({ replaceUrl: true, queryParams: [  ] }) ]
          ]);
          expect(wizard.hasPage).toHaveBeenCalledWith('unknown');
        })
        .then(done)
        .catch(fail);
    });

    it('should alert error', fakeAsync(() => {
      wizardGuard.resolve(route);
      tick();
      expect(alertService.error).toHaveBeenCalledWith(`No page could be found for 'unknown'`);
    }));

  });

  function page(pageId: string): WizardPage {
    let wp = new WizardPage();
    wp.id = pageId;
    return wp;
  }
});

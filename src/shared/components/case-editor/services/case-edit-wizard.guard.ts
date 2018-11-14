import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Predicate } from '../../../domain/predicate.model';
import { AlertService } from '../../../services/alert/alert.service';
import { RouterHelperService } from '../../../services/router/router-helper.service';
import { WizardFactoryService } from './wizard-factory.service';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { EventTriggerService } from './event-trigger.service';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';

@Injectable()
export class CaseEditWizardGuard implements Resolve<boolean> {

  constructor(
    private router: Router,
    private routerHelper: RouterHelperService,
    private wizardFactory: WizardFactoryService,
    private alertService: AlertService,
    private eventTriggerService: EventTriggerService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    this.eventTriggerService.eventTriggerSource.asObservable().first().subscribe(eventTrigger => {
      this.processEventTrigger(route, eventTrigger);
    });
    if (route.parent.data.eventTrigger) {
      this.eventTriggerService.announceEventTrigger(route.parent.data.eventTrigger);
    }
    return Promise.resolve(true);
  }

  private processEventTrigger(route: ActivatedRouteSnapshot, eventTrigger: CaseEventTrigger): Promise<boolean> {
    if (!eventTrigger.hasFields() || !eventTrigger.hasPages()) {
      this.goToSubmit(route);
      return Promise.resolve(false);
    }

    let wizard = this.wizardFactory.create(eventTrigger);
    let currentState = this.buildState(eventTrigger.case_fields);
    // TODO Extract predicate and state creation in a factory
    let canShowPredicate: Predicate<WizardPage> = (page: WizardPage): boolean => {
      return new ShowCondition(page.show_condition).match(currentState);
    };

    if (!route.params['page']) {
      this.goToFirst(wizard, canShowPredicate, route);
      return Promise.resolve(false);
    }

    let pageId = route.params['page'];

    if (!wizard.hasPage(pageId)) {
      this.goToFirst(wizard, canShowPredicate, route)
        .then(() => {
          this.alertService.error(`No page could be found for '${pageId}'`);
        });
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  private goToFirst(wizard: Wizard, canShowPredicate: Predicate<WizardPage>, route: ActivatedRouteSnapshot): Promise<boolean> {
    let firstPage = wizard.firstPage(canShowPredicate);
    // If there’s no specific wizard page called, it makes another navigation to either the first page available or to the submit page
    // TODO should find a way to navigate to target page without going through the whole loop (and make a second call to BE) again
    return this.router.navigate([...this.parentUrlSegments(route), firstPage ? firstPage.id : 'submit'],
      { queryParams: route.queryParams });
  }

  private goToSubmit(route: ActivatedRouteSnapshot): Promise<boolean> {
    return this.router.navigate([...this.parentUrlSegments(route), 'submit']);
  }

  private buildState(caseFields: CaseField[]): any {
    let state = {};

    caseFields.forEach(field => {
      state[field.id] = field.value;
    });

    return state;
  }

  private parentUrlSegments(route: ActivatedRouteSnapshot): string[] {
    return this.routerHelper.getUrlSegmentsFromRoot(route.parent);
  }
}

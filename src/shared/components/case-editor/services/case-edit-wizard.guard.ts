import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { Predicate } from '../../../domain/predicate.model';
import { AlertService } from '../../../services/alert/alert.service';
import { FieldsUtils } from '../../../services/fields';
import { RouterHelperService } from '../../../services/router/router-helper.service';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { EventTriggerService } from './event-trigger.service';
import { WizardFactoryService } from './wizard-factory.service';

@Injectable()
export class CaseEditWizardGuard implements Resolve<boolean> {

  constructor(
    private readonly router: Router,
    private readonly routerHelper: RouterHelperService,
    private readonly wizardFactory: WizardFactoryService,
    private readonly alertService: AlertService,
    private readonly eventTriggerService: EventTriggerService
  ) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
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

    const wizard = this.wizardFactory.create(eventTrigger);
    const currentState = this.buildState(eventTrigger.case_fields);
    // TODO Extract predicate and state creation in a factory
    const canShowPredicate: Predicate<WizardPage> = (page: WizardPage): boolean => {
      return ShowCondition.getInstance(page.show_condition).match(currentState);
    };

    if (!route.params['page']) {
      this.goToFirst(wizard, canShowPredicate, route);
      return Promise.resolve(false);
    }

    const pageId = route.params['page'];

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
    const firstPage = wizard.firstPage(canShowPredicate);
    // If there’s no specific wizard page called, it makes another navigation to either the first page available or to the submit page
    // TODO should find a way to navigate to target page without going through the whole loop (and make a second call to BE) again
    return this.router.navigate([...this.parentUrlSegments(route), firstPage ? firstPage.id : 'submit'],
      { queryParams: route.queryParams });
  }

  private goToSubmit(route: ActivatedRouteSnapshot): Promise<boolean> {
    return this.router.navigate([...this.parentUrlSegments(route), 'submit'], {queryParams: route.queryParams});
  }

  private buildState(caseFields: CaseField[]): any {
    const state = {};

    /**
     *
     * EUI-4873 SSCS - Dynamic lists in a collection within a complex type
     *
     * Catering for mid event callbacks, hence the call to re-evaluate
     * for DynamicList's
     *
     */
    FieldsUtils.handleNestedDynamicLists({case_fields: caseFields});

    caseFields.forEach(field => {
      state[field.id] = field.value;
    });

    return state;
  }

  private parentUrlSegments(route: ActivatedRouteSnapshot): string[] {
    return this.routerHelper.getUrlSegmentsFromRoot(route.parent);
  }
}

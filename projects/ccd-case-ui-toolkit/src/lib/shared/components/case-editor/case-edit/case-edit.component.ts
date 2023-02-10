import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';

import { ConditionalShowRegistrarService, GreyBarService } from '../../../directives';
import { CaseEditState, CaseEventData, CaseEventTrigger, CaseView, Draft, Profile } from '../../../domain';
import { FieldsPurger, FieldsUtils, SessionStorageService, WindowService } from '../../../services';
import { Wizard, WizardPage } from '../domain';
import { WizardFactoryService } from '../services';

@Component({
  selector: 'ccd-case-edit',
  templateUrl: 'case-edit.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: [GreyBarService]
})
export class CaseEditComponent implements OnInit {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  public static readonly ALERT_MESSAGE = 'Page is being refreshed so you will be redirected to the first page of this event.';

  @Input()
  public eventTrigger: CaseEventTrigger;

  @Input()
  public submit: (caseEventData: CaseEventData, profile?: Profile) => Observable<object>;

  @Input()
  public validate: (caseEventData: CaseEventData, pageId: string) => Observable<object>;

  @Input()
  public saveDraft: (caseEventData: CaseEventData) => Observable<Draft>;

  @Input()
  public caseDetails: CaseView;

  @Output()
  public cancelled: EventEmitter<any> = new EventEmitter();

  @Output()
  public submitted: EventEmitter<any> = new EventEmitter();

  public wizard: Wizard;

  public form: FormGroup;


  public navigationOrigin: any;

  public initialUrl: string;

  public isPageRefreshed: boolean;

  public caseEditState: Partial<CaseEditState>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly caseEditDataService: CaseEditDataService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fieldsUtils: FieldsUtils,
    private readonly fieldsPurger: FieldsPurger,
    private readonly registrarService: ConditionalShowRegistrarService,
    private readonly wizardFactory: WizardFactoryService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly windowsService: WindowService
  ) {
    this.caseEditDataService.caseEditState$
      .subscribe((state) => {
        this.caseEditState = state;

        if (!!state.submitResponse) {
          this.emitSubmitted(state.submitResponse);
        }
      });
  }

  public ngOnInit(): void {
    this.wizard = this.wizardFactory.create(this.eventTrigger);
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    this.isPageRefreshed = JSON.parse(this.sessionStorageService.getItem('isPageRefreshed'));

    this.checkPageRefresh();
    if (this.router.url && !this.isPageRefreshed) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }

    this.form = this.fb.group({
      data: new FormGroup({}),
      event: this.fb.group({
        id: [this.eventTrigger.id, Validators.required],
        summary: [''],
        description: ['']
      })
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.navigationOrigin = params[CaseEditComponent.ORIGIN_QUERY_PARAM];
    });
  }

  public checkPageRefresh(): boolean {
    if (this.isPageRefreshed && this.initialUrl) {
      this.sessionStorageService.removeItem('eventUrl');
      this.windowsService.alert(CaseEditComponent.ALERT_MESSAGE);
      this.router.navigate([this.initialUrl], { relativeTo: this.route});
      return true;
    }
    return false;
  }

  public getPage(pageId: string): WizardPage {
    return this.wizard.getPage(pageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  public first(): Promise<boolean> {
    const firstPage = this.wizard.firstPage(this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    return this.router.navigate([firstPage ? firstPage.id : 'submit'], { relativeTo: this.route });
  }

  public navigateToPage(pageId: string): Promise<boolean> {
    const page = this.getPage(pageId);
    return this.router.navigate([page ? page.id : 'submit'], { relativeTo: this.route });
  }

  public next(currentPageId: string): Promise<boolean> {
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    if (this.router.url && !this.initialUrl) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    const nextPage = this.caseEditDataService.getNextPage({
      currentPageId,
      wizard: this.wizard,
      eventTrigger: this.eventTrigger,
      form: this.form,
    });

    if(!nextPage && !this.eventTrigger.show_summary) {
      this.caseEditDataService.submitForm({
        eventTrigger: this.eventTrigger,
        form: this.form,
        caseEditState: this.caseEditState,
        submit: this.submit,
        caseDetails: this.caseDetails,
      });
      return;
    }

    this.registrarService.reset();

    const theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    return this.router.navigate([nextPage ? nextPage.id : 'submit'], { queryParams: theQueryParams, relativeTo: this.route });
  }

  public previous(currentPageId: string): Promise<boolean> {
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    this.registrarService.reset();

    const previousPage = this.wizard.previousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    if (!previousPage) {
      return Promise.resolve(false);
    }

    const theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    return this.router.navigate([previousPage.id], { queryParams: theQueryParams, relativeTo: this.route });
  }

  public hasPrevious(currentPageId: string): boolean {
    return this.wizard.hasPreviousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  public cancel(): void {
    this.cancelled.emit();
  }

  public emitSubmitted(response: Record<string, any>): void {
    this.submitted.emit({caseId: response['id'], status: this.caseEditDataService.getStatus(response)});
    this.caseEditDataService.updateSubmitResponse(null);
  }
}

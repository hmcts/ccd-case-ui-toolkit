import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ConditionalShowRegistrarService, GreyBarService } from '../../../directives';
import { CaseEventTrigger, CaseView, Draft, Profile } from '../../../domain';
import { FieldsPurger, FieldsUtils, SessionStorageService, WindowService } from '../../../services';
import { Confirmation, Wizard, WizardPage } from '../domain';
import { WizardFactoryService } from '../services';

@Component({
  selector: 'ccd-case-edit',
  templateUrl: 'case-edit.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: [GreyBarService]
})
export class CaseEditComponent implements OnInit {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  static readonly ALERT_MESSAGE = 'Page is being refreshed so you will be redirected to the first page of this event.';

  @Input()
  eventTrigger: CaseEventTrigger;

  @Input()
  submit: (CaseEventData, profile?: Profile) => Observable<object>;

  @Input()
  validate: (CaseEventData, pageId: string) => Observable<object>;

  @Input()
  saveDraft: (CaseEventData) => Observable<Draft>;

  @Input()
  caseDetails: CaseView;

  @Output()
  cancelled: EventEmitter<any> = new EventEmitter();

  @Output()
  submitted: EventEmitter<any> = new EventEmitter();

  wizard: Wizard;

  form: FormGroup;

  confirmation: Confirmation;

  navigationOrigin: any;

  initialUrl: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsUtils: FieldsUtils,
    private fieldsPurger: FieldsPurger,
    private registrarService: ConditionalShowRegistrarService,
    private wizardFactory: WizardFactoryService,
    private sessionStorageService: SessionStorageService,
    private windowsService: WindowService
  ) {}

  ngOnInit(): void {
    this.wizard = this.wizardFactory.create(this.eventTrigger);
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    const isPageRefreshed = JSON.parse(this.sessionStorageService.getItem('isPageRefreshed'));
    if (isPageRefreshed && this.initialUrl) {
      this.sessionStorageService.removeItem('eventUrl');
      this.windowsService.alert(CaseEditComponent.ALERT_MESSAGE);
      this.router.navigateByUrl(this.initialUrl).then(() => {
        window.location.reload();
      });
    }

    if (this.router.url && !isPageRefreshed) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }

    this.form = this.fb.group({
      'data': new FormGroup({}),
      'event': this.fb.group({
        'id': [this.eventTrigger.id, Validators.required],
        'summary': [''],
        'description': ['']
      })
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.navigationOrigin = params[CaseEditComponent.ORIGIN_QUERY_PARAM];
    });
  }

  getPage(pageId: string): WizardPage {
    return this.wizard.getPage(pageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  first(): Promise<boolean> {
    let firstPage = this.wizard.firstPage(this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    return this.router.navigate([firstPage ? firstPage.id : 'submit'], { relativeTo: this.route });
  }

  navigateToPage(pageId: string): Promise<boolean> {
    let page = this.getPage(pageId);
    return this.router.navigate([page ? page.id : 'submit'], { relativeTo: this.route });
  }

  next(currentPageId: string): Promise<boolean> {
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    if (this.router.url && !this.initialUrl) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    this.registrarService.reset();

    let theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    let nextPage = this.wizard.nextPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    return this.router.navigate([nextPage ? nextPage.id : 'submit'], { queryParams: theQueryParams, relativeTo: this.route });
  }

  previous(currentPageId: string): Promise<boolean> {
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    this.registrarService.reset();

    let previousPage = this.wizard.previousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    if (!previousPage) {
      return Promise.resolve(false);
    }

    let theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    return this.router.navigate([previousPage.id], { queryParams: theQueryParams, relativeTo: this.route });
  }

  hasPrevious(currentPageId: string): boolean {
    return this.wizard.hasPreviousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  cancel(): void {
    this.cancelled.emit();
  }

  confirm(confirmation: Confirmation): Promise<boolean> {
    this.confirmation = confirmation;
    return this.router.navigate(['confirm'], {relativeTo: this.route});
  }

}

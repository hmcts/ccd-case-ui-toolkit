import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ConditionalShowRegistrarService } from '../../../directives/conditional-show/services/conditional-show-registrar.service';
import { GreyBarService } from '../../../directives/conditional-show/services/grey-bar.service';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { Draft } from '../../../domain/draft.model';
import { Profile } from '../../../domain/profile/profile.model';
import { FieldsPurger } from '../../../services/fields/fields.purger';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { Confirmation } from '../domain/confirmation.model';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { WizardFactoryService } from '../services/wizard-factory.service';



@Component({
  selector: 'ccd-case-edit',
  templateUrl: 'case-edit.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: [GreyBarService]
})
export class CaseEditComponent implements OnInit {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';

  @Input()
  public eventTrigger: CaseEventTrigger;

  @Input()
  public submit: (CaseEventData, profile?: Profile) => Observable<object>;

  @Input()
  public validate: (CaseEventData, pageId: string) => Observable<object>;

  @Input()
  public saveDraft: (CaseEventData) => Observable<Draft>;

  @Input()
  public caseDetails: CaseView;

  @Output()
  public cancelled: EventEmitter<any> = new EventEmitter();

  @Output()
  public submitted: EventEmitter<any> = new EventEmitter();

  public wizard: Wizard;

  public form: FormGroup;

  public confirmation: Confirmation;

  public navigationOrigin: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fieldsUtils: FieldsUtils,
    private readonly fieldsPurger: FieldsPurger,
    private readonly registrarService: ConditionalShowRegistrarService,
    private readonly wizardFactory: WizardFactoryService,
  ) {}

  public ngOnInit(): void {
    this.wizard = this.wizardFactory.create(this.eventTrigger);

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
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    this.registrarService.reset();

    const theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    const nextPage = this.wizard.nextPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
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

  public confirm(confirmation: Confirmation): Promise<boolean> {
    this.confirmation = confirmation;
    return this.router.navigate(['confirm'], {relativeTo: this.route});
  }

}

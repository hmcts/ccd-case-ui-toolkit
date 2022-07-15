import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CaseEditPageComponent } from '../../case-editor';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { LinkedCasesState } from './domain';
import { LinkedCasesErrorMessages, LinkedCasesEventTriggers } from './enums';
import { LinkedCasesService } from './services';

enum MODE {
  TABLE,
  MANAGE
}
@Component({
  selector: 'ccd-read-case-link-field',
  templateUrl: 'read-case-link-field.html',
})

export class ReadCaseLinkFieldComponent extends AbstractFieldReadComponent {

  @Input()
  formGroup: FormGroup;

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;
  
  dspMode = MODE;
  displayMode: MODE = MODE.TABLE;
  public isDisplayContextParameterUpdate: any;

  constructor(private router: Router,
    private readonly route: ActivatedRoute,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }
  
  public paletteContext = PaletteContext;

  public ngOnInit(): void {
    if (this.route.snapshot.data && this.route.snapshot.data.eventTrigger) {
      this.displayMode = MODE.MANAGE;
    } else {
      this.displayMode = MODE.TABLE;
    }
    //this.isDisplayContextParameterUpdate = ((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[]);
  }

  public hasReference(): boolean {
    return this.caseField.value && this.caseField.value.CaseReference;
  }

  public hasCaseLinkCollection(): boolean {
    return (
      this.caseField.field_type &&
      this.caseField.field_type.type === 'Collection' &&
      this.caseField.field_type.collection_field_type.id === 'CaseLink'
    );
  }

  public isLinkedCasesEventTrigger(): boolean {
    return this.route.snapshot.data && this.route.snapshot.data.eventTrigger.name === LinkedCasesEventTriggers.LINK_CASES;
  }

  public submitLinkedCases(): void {
    const formGroup = this.formGroup;
    if (formGroup.value && formGroup.value.caseLinks && this.linkedCasesService.linkedCases) {
      this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue;
      // this.caseEditPageComponent.submit();
    }
    this.context = this.paletteContext.CHECK_YOUR_ANSWER;
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    this.caseEditPageComponent.validationErrors = [];

    // if (linkedCasesState.navigateToNextPage) {
    //   // this.linkedCasesPage = this.getNextPage(linkedCasesState);
    //   // this.setContinueButtonValidationErrorMessage();
    //   // this.proceedToNextPage();
    // } else {
    //   linkedCasesState.errorMessages.forEach(errorMessage => {
    //     this.caseEditPageComponent.validationErrors.push({ id: errorMessage.fieldId, message: errorMessage.description});
    //   });
    // }
  }

  public setContinueButtonValidationErrorMessage(): void {
    const errorMessage = this.linkedCasesService.linkedCases.length === 0
      ? LinkedCasesErrorMessages.BackNavigationError
      : this.router && this.router.url && this.router.url.includes(LinkedCasesEventTriggers.LINK_CASES)
        ? LinkedCasesErrorMessages.LinkCasesNavigationError
        : LinkedCasesErrorMessages.UnlinkCasesNavigationError;

    const buttonId = this.linkedCasesService.linkedCases.length === 0
      ? 'back-button'
      : 'next-button';

    this.caseEditPageComponent.caseLinkError = {
      componentId: buttonId,
      errorMessage: errorMessage
    };
  }

}

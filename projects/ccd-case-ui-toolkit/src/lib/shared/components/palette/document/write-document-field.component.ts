import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { Constants } from '../../../commons/constants';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { DocumentData, FormDocument } from '../../../domain/document/document-data.model'
import { HttpError } from '../../../domain/http/http-error.model';
import { DocumentManagementService } from '../../../services/document-management/document-management.service'
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { DocumentDialogComponent } from '../../dialogs/document-dialog/document-dialog.component';
import { initDialog } from '../../helpers/init-dialog-helper';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FileUploadStateService } from './file-upload-state.service';

@Component({
  selector: 'ccd-write-document-field',
  templateUrl: './write-document-field.html'
})
export class WriteDocumentFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {
  public static readonly DOCUMENT_URL = 'document_url';
  public static readonly DOCUMENT_BINARY_URL = 'document_binary_url';
  public static readonly DOCUMENT_FILENAME = 'document_filename';
  public static readonly DOCUMENT_HASH = 'document_hash';
  public static readonly UPLOAD_TIMESTAMP = 'upload_timestamp';
  public static readonly UPLOAD_ERROR_FILE_REQUIRED = 'File required';
  public static readonly UPLOAD_ERROR_NOT_AVAILABLE = 'Document upload facility is not available at the moment';
  public static readonly UPLOAD_ERROR_INVALID_FORMAT = 'Document format is not supported';
  public static readonly UPLOAD_WAITING_FILE_STATUS = 'Uploading...';
  public static readonly ERROR_UPLOADING_FILE = 'Error Uploading File';

  @ViewChild('fileInput', { static: false }) public fileInput: ElementRef;

  public selectedFile: File;
  public valid = true;
  public fileUploadMessages: string;
  public confirmReplaceResult: string;
  public clickInsideTheDocument: boolean;

  // these are public so that they can be mocked for tests
  public fileUploadSubscription: Subscription;
  public dialogSubscription: Subscription;
  public caseNotifierSubscription: Subscription;
  public jurisdictionSubs: Subscription;

  private uploadedDocument: FormGroup;
  private dialogConfig: MatDialogConfig;
  private secureModeOn: boolean;

  public jurisdictionId: string;
  public caseTypeId: string;

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private readonly caseNotifier: CaseNotifier,
    private readonly documentManagement: DocumentManagementService,
    public dialog: MatDialog,
    private readonly fileUploadStateService: FileUploadStateService,
    private readonly jurisdictionService: JurisdictionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.secureModeOn = this.appConfig.getDocumentSecureMode();
    if (this.secureModeOn) {
      this.subscribeToCaseDetails();
    }
    this.dialogConfig = initDialog();
    // EUI-3403. The field was not being registered when there was no value and the field
    // itself was not mandatory, which meant that show_conditions would not be evaluated.
    // I've cleaned up the logic and it's now always registered.
    let document = this.caseField.value || { document_url: null, document_binary_url: null, document_filename: null };
    document = this.secureModeOn && !document.document_hash ? { ...document, document_hash: null } : document;
    if (this.isAMandatoryComponent()) {
      this.createDocumentFormWithValidator(document);
    } else {
      this.createDocumentForm(document);
    }
  }

  public ngOnDestroy(): void {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
    if (this.caseNotifierSubscription) {
      this.caseNotifierSubscription.unsubscribe();
    }
    if (this.jurisdictionSubs) {
      this.jurisdictionSubs.unsubscribe();
    }
  }

  public isUploadInProgress(): boolean {
    return this.fileUploadStateService.isUploadInProgress();
  }

  public cancelUpload(): void {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }

    this.fileUploadStateService.setUploadInProgress(false);
    this.fileInput.nativeElement.value = '';
    this.resetUpload();
  }

  public fileValidationsOnTab(): void {
    if (this.isAMandatoryComponent()) {
      if (this.validateFormUploadedDocument()) {
        this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
      }
    }
  }

  public fileChangeEvent(fileInput: any, allowedRegex?: string): void {
    let fileTypeRegex;
    console.log('Service specified regex: ', allowedRegex);
    if (allowedRegex){
      fileTypeRegex = new RegExp(`(${allowedRegex.replace(/,/g, '|')})`);
    }
    if (fileInput.target?.files[0] && !fileInput.target?.files[0]?.name?.match(fileTypeRegex)){
      this.invalidFileFormat();
    } else if (fileInput.target.files[0]) {
      this.selectedFile = fileInput.target.files[0];
      this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_WAITING_FILE_STATUS);
      const documentUpload: FormData = this.buildDocumentUploadData(this.selectedFile);
      this.fileUploadStateService.setUploadInProgress(true);

      this.fileUploadSubscription = this.documentManagement.uploadFile(documentUpload).subscribe({
        next: (resultDocument: DocumentData) => this.handleDocumentUploadResult(resultDocument),
        error: (error: HttpError) => this.handleDocumentUploadError(error)
      });
    } else {
      this.resetUpload();
    }
  }

  public openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  public fileSelectEvent(): void {
    if ((this.caseField.value && this.caseField.value.document_filename) ||
      (this.selectedFile && this.selectedFile.name)) {
      this.openDialog(this.dialogConfig);
    } else {
      this.openFileDialog();
    }
  }

  public triggerReplace(): boolean {
    if (this.confirmReplaceResult === 'Replace') {
      this.openFileDialog();
      return true;
    }
    return false;
  }

  public invalidFileFormat(): void {
    this.updateDocumentForm(null, null, null);
    this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_INVALID_FORMAT);
  }

  public getUploadedFileName(): any {
    if (this.uploadedDocument) {
      return this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).value;
    } else {
      return undefined;
    }
  }

  private resetUpload(): void {
    this.selectedFile = null;
    if (this.isAMandatoryComponent()) {
      this.updateDocumentForm(null, null, null);
      this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
    } else {
      this.valid = true;
    }
  }

  private fileValidations(): void {
    if (this.isAMandatoryComponent()) {
      if (this.clickInsideTheDocument && this.validateFormUploadedDocument() && !this.isUpLoadingAFile()) {
        this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
      }
    }
  }

  private openDialog(dialogConfig): void {
    const dialogRef = this.dialog.open(DocumentDialogComponent, dialogConfig);
    this.dialogSubscription = dialogRef.beforeClosed().subscribe(result => {
      this.confirmReplaceResult = result;
      this.triggerReplace();
    });
  }

  // Depending on the context, we can get the case type and jurisdiction from different sources
  // If we are running an event, the caseNotifier will have the current case
  // If we are creating a case, the case doesn't exist yet, so the caseNotifier can't help
  // Instead we can use the eventTrigger to get the case type, and the jurisdiction service to
  // get the currently selected jurisdiction
  private subscribeToCaseDetails(): void {
    this.caseNotifierSubscription = this.caseNotifier.caseView.subscribe({
      next: (caseDetails: CaseView) => {
        this.caseTypeId = caseDetails?.case_type.id;
        this.jurisdictionId = caseDetails?.case_type?.jurisdiction?.id;
      }
    });
    this.jurisdictionSubs = this.jurisdictionService.selectedJurisdictionBS.subscribe({
      next: (jurisdiction) => {
        if (jurisdiction) {
          this.jurisdictionId = jurisdiction.id;
          if (jurisdiction.currentCaseType) {
            this.caseTypeId = jurisdiction.currentCaseType.id
          }
        }
      }
    });
  }

  private isAMandatoryComponent(): boolean {
    return this.caseField.display_context && this.caseField.display_context === Constants.MANDATORY;
  }

  private displayFileUploadMessages(fileUploadMessage: string): void {
    this.valid = false;
    this.fileUploadMessages = fileUploadMessage;
  }

  private isUpLoadingAFile(): boolean {
    return this.fileUploadMessages === WriteDocumentFieldComponent.UPLOAD_WAITING_FILE_STATUS;
  }
  private validateFormUploadedDocument(): boolean {
    if (!this.uploadedDocument) {
      return true;
    }

    let validation = !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_BINARY_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).valid;

    if (this.secureModeOn) {
      validation = validation && !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_HASH).valid;
    }

    return validation;
  }

  private updateDocumentForm(url: string, binaryUrl: string, filename: string, documentHash?: string): void {
    this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_URL).setValue(url);
    this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_BINARY_URL).setValue(binaryUrl);
    this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).setValue(filename);
    if (documentHash) {
      this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_HASH).setValue(documentHash);
    }
    if(this.uploadedDocument.get(WriteDocumentFieldComponent.UPLOAD_TIMESTAMP)){
      this.uploadedDocument.removeControl(WriteDocumentFieldComponent.UPLOAD_TIMESTAMP);
    }
  }

  private createDocumentFormWithValidator(document: FormDocument): void {
    let documentFormGroup = {
      document_url: new FormControl(document.document_url, Validators.required),
      document_binary_url: new FormControl(document.document_binary_url, Validators.required),
      document_filename: new FormControl(document.document_filename, Validators.required)
    };

    if(document.upload_timestamp && (typeof document.upload_timestamp === 'string' )){
      documentFormGroup = {
        ...documentFormGroup,
        ...{ upload_timestamp: new FormControl(document.upload_timestamp) }
      }
    }

    documentFormGroup = this.secureModeOn ? {
      ...documentFormGroup,
      ...{ document_hash: new FormControl(document.document_hash) }
    } : documentFormGroup;

    this.uploadedDocument = this.registerControl(new FormGroup(documentFormGroup), true) as FormGroup;
  }

  private createDocumentForm(document: FormDocument): void {
    let documentFormGroup = {
      document_url: new FormControl(document.document_url),
      document_binary_url: new FormControl(document.document_binary_url),
      document_filename: new FormControl(document.document_filename)
    };

    if(document.upload_timestamp && (typeof document.upload_timestamp === 'string' )){
      documentFormGroup = {
        ...documentFormGroup,
        ...{ upload_timestamp: new FormControl(document.upload_timestamp) }
      }
    }

    documentFormGroup = this.secureModeOn ? {
      ...documentFormGroup,
      ...{ document_hash: new FormControl(document.document_hash) }
    } : documentFormGroup;

    this.uploadedDocument = this.registerControl(new FormGroup(documentFormGroup), true) as FormGroup;
  }

  private getErrorMessage(error: HttpError): string {
    switch (error.status) {
      case 0:
      case 502:
        return WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
      case 422:
        {
          let errorMsg = WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
          if (error?.error) {
            const fullError = error.error;
            const start = fullError.indexOf('{');
            if (start >= 0) {
              const json = fullError.substring(start, fullError.length - 1).split('<EOL>').join('');
              const obj = JSON.parse(json);
              if (obj?.error) {
                errorMsg = obj.error;
              }
            }
          }
          return errorMsg;
        }
      case 429:
        return error?.error;
      default:
        return WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
    }
  }

  private buildDocumentUploadData(selectedFile: File): FormData {
    const documentUpload: FormData = new FormData();
    documentUpload.append('files', selectedFile, selectedFile.name);
    documentUpload.append('classification', 'PUBLIC');

    if (this.appConfig.getDocumentSecureMode()) {
      const caseTypeId = this.caseTypeId ? this.caseTypeId : null;
      const caseTypeJurisdictionId = this.jurisdictionId ? this.jurisdictionId : null;
      documentUpload.append('caseTypeId', caseTypeId);
      documentUpload.append('jurisdictionId', caseTypeJurisdictionId);
    }

    return documentUpload;
  }

  private handleDocumentUploadResult(result: DocumentData): void {
    if (!this.uploadedDocument) {
      if (this.secureModeOn) {
        this.createDocumentForm({ document_url: null, document_binary_url: null, document_filename: null, document_hash: null });
      } else {
        this.createDocumentForm({ document_url: null, document_binary_url: null, document_filename: null });
      }
    }

    const document = this.secureModeOn ? result.documents[0] : result._embedded.documents[0];

    if (this.secureModeOn) {
      this.updateDocumentForm(
        document._links.self.href,
        document._links.binary.href,
        document.originalDocumentName,
        document.hashToken
      );
    } else {
      this.updateDocumentForm(
        document._links.self.href,
        document._links.binary.href,
        document.originalDocumentName,
      );
    }

    this.valid = true;
    this.fileUploadStateService.setUploadInProgress(false);

    // refresh replaced document info
    if (this.caseField.value) {
      this.caseField.value.document_binary_url = document._links.binary.href;
      this.caseField.value.document_filename = document.originalDocumentName;
      this.caseField.value.document_url = document._links.self.href;

      if (this.secureModeOn) {
        this.caseField.value.document_hash = document.hashToken;
      }
    }
  }

  private handleDocumentUploadError(error: HttpError): void {
    this.fileUploadMessages = this.getErrorMessage(error);
    this.valid = false;
    this.fileUploadStateService.setUploadInProgress(false);
  }
}

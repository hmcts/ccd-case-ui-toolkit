import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { Subscription, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
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
    templateUrl: './write-document-field.html',
    standalone: false
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

  public jurisdictionId: string;
  public caseTypeId: string;
  public caseTypeExclusions: string;
  // Should the file upload use CDAM
  public fileSecureModeOn: boolean = false;

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
    // Wait for both observables to emit at least once
    this.caseNotifierSubscription = combineLatest([
      this.caseNotifier.caseView.pipe(take(1)),
      this.jurisdictionService.getSelectedJurisdiction()
    ]).subscribe(([caseDetails, jurisdiction]) => {
      if (caseDetails) {
        this.caseTypeId = caseDetails?.case_type?.id;
        this.jurisdictionId = caseDetails?.case_type?.jurisdiction?.id;
      }
      if (jurisdiction) {
        this.jurisdictionId = jurisdiction.id;
        if (jurisdiction.currentCaseType) {
          this.caseTypeId = jurisdiction.currentCaseType.id;
        }
      }
      //if we havent set the value of caseTypeId yet, we can check if its in the url. e.g. case-creation
      if (!this.caseTypeId) {
        const url = window.location.pathname;
        if (url.indexOf('/case-create/') > -1) {
          const parts = url.split('/');
          this.jurisdictionId = parts[parts.indexOf('case-create') + 1];
          this.caseTypeId = parts[parts.indexOf('case-create') + 2];
        }
      }
      // use the documentManagement service to check if the document upload should use CDAM
      if (this.documentManagement.isDocumentSecureModeEnabled()) {
        this.fileSecureModeOn = true;
      }
      this.dialogConfig = initDialog();
      let document = this.caseField.value || { document_url: null, document_binary_url: null, document_filename: null };
      document = this.fileSecureModeOn && !document.document_hash ? { ...document, document_hash: null } : document;
      if (this.isAMandatoryComponent()) {
        this.createDocumentFormWithValidator(document);
      } else {
        this.createDocumentForm(document);
      }
    });
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
    if (allowedRegex) {
      fileTypeRegex = new RegExp(`(${allowedRegex.replace(/,/g, '|')})`, 'i');
    }
    if (fileInput.target?.files[0] && !fileInput.target?.files[0]?.name?.match(fileTypeRegex)) {
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

    // fix active form group so that additional attachments in invalid format are not accepted
    this.formGroup.setErrors({ invalidFileFormat: true });
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

    if (this.fileSecureModeOn) {
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
    if (this.uploadedDocument.get(WriteDocumentFieldComponent.UPLOAD_TIMESTAMP)) {
      this.uploadedDocument.removeControl(WriteDocumentFieldComponent.UPLOAD_TIMESTAMP);
    }
  }

  private createDocumentFormWithValidator(document: FormDocument): void {
    let documentFormGroup = {
      document_url: new FormControl(document.document_url, Validators.required),
      document_binary_url: new FormControl(document.document_binary_url, Validators.required),
      document_filename: new FormControl(document.document_filename, Validators.required)
    };

    if (document.upload_timestamp && (typeof document.upload_timestamp === 'string')) {
      documentFormGroup = {
        ...documentFormGroup,
        ...{ upload_timestamp: new FormControl(document.upload_timestamp) }
      }
    }

    documentFormGroup = this.fileSecureModeOn ? {
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

    if (document.upload_timestamp && (typeof document.upload_timestamp === 'string')) {
      documentFormGroup = {
        ...documentFormGroup,
        ...{ upload_timestamp: new FormControl(document.upload_timestamp) }
      }
    }

    documentFormGroup = this.fileSecureModeOn ? {
      ...documentFormGroup,
      ...{ document_hash: new FormControl(document.document_hash) }
    } : documentFormGroup;

    this.uploadedDocument = this.registerControl(new FormGroup(documentFormGroup), true) as FormGroup;
  }

  private getErrorMessage(error: HttpError): string {
    if (error.status === 0 || error.status === 502) {
      return WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
    }
    if (error.status === 422 || error.status === 500) {
      if (this.fileSecureModeOn) {
        return this.extractSecureErrorMessage(error) || WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
      }
      return error.error || WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
    }
    if (error.status === 429) {
      return error?.error;
    }
    return WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
  }

  private extractSecureErrorMessage(error: HttpError): string | undefined {
    if (!error?.error) {
      return WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
    }
    const fullError = error.error;
    const start = fullError.indexOf('{');
    if (start < 0) {
      return WriteDocumentFieldComponent.ERROR_UPLOADING_FILE;
    }
    try {
      const json = fullError.substring(start, fullError.length - 1).replace(/<EOL>/g, '');
      const obj = JSON.parse(json);
      return obj?.error;
    } catch {
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
      if (this.fileSecureModeOn) {
        this.createDocumentForm({ document_url: null, document_binary_url: null, document_filename: null, document_hash: null });
      } else {
        this.createDocumentForm({ document_url: null, document_binary_url: null, document_filename: null });
      }
    }

    const document = this.fileSecureModeOn ? result.documents[0] : result._embedded.documents[0];

    if (this.fileSecureModeOn) {
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

      if (this.fileSecureModeOn) {
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

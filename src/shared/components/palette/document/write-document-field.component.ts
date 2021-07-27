import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';

import { Constants } from '../../../commons/constants';
import { DocumentData } from '../../../domain';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { DocumentManagementService } from '../../../services/document-management/document-management.service';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { DocumentDialogComponent } from '../../dialogs/document-dialog/document-dialog.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FileUploadStateService } from './file-upload-state.service';

@Component({
  selector: 'ccd-write-document-field',
  templateUrl: './write-document-field.html'
})
export class WriteDocumentFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {
  static readonly DOCUMENT_URL = 'document_url';
  static readonly DOCUMENT_BINARY_URL = 'document_binary_url';
  static readonly DOCUMENT_FILENAME = 'document_filename';
  static readonly DOCUMENT_HASH = 'document_hash';
  static readonly UPLOAD_ERROR_FILE_REQUIRED = 'File required';
  static readonly UPLOAD_ERROR_NOT_AVAILABLE = 'Document upload facility is not available at the moment';
  static readonly UPLOAD_WAITING_FILE_STATUS = 'Uploading...';

  private caseDetails: CaseView;
  private uploadedDocument: FormGroup;
  public selectedFile: File;
  private dialogConfig: MatDialogConfig;
  @ViewChild('fileInput') fileInput: ElementRef;

  valid = true;
  fileUploadMessages: string;
  confirmReplaceResult: string;
  clickInsideTheDocument: boolean;

  fileUploadSubscription: Subscription;
  dialogSubscription: Subscription;
  caseEventSubscription: Subscription;


  private secureModeOn: boolean = false;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // Capturing the event of of the associated  ElementRef <input type="file" #fileInpu

    if (this.fileInput.nativeElement.contains(event.target)) {
      this.clickInsideTheDocument = true
    } else {
      this.fileValidations()
    }
  }

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private readonly caseNotifier: CaseNotifier,
    private documentManagement: DocumentManagementService,
    public dialog: MatDialog,
    private fileUploadStateService: FileUploadStateService,
  ) {
    super();
  }

  ngOnInit() {
    this.secureModeOn = this.appConfig.getDocumentSecureMode();
    this.initDialog();
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

    if (this.appConfig.getDocumentSecureMode()) {
      this.subscribeToCaseDetails();
    }
  }

  ngOnDestroy() {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
    if (this.caseEventSubscription) {
      this.caseEventSubscription.unsubscribe();
    }
  }

  isUploadInProgress() {
    return this.fileUploadStateService.isUploadInProgress();
  }

  cancelUpload() {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }

    this.fileUploadStateService.setUploadInProgress(false);
    this.fileInput.nativeElement.value = '';
    this.resetUpload();
  }

  resetUpload() {
    this.selectedFile = null;
    if (this.isAMandatoryComponent()) {
      this.updateDocumentForm(null, null, null);
      this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
    } else {
      this.valid = true;
    }
  }

  fileValidations() {

    if (this.isAMandatoryComponent()) {
      if (this.clickInsideTheDocument && this.validateFormUploadedDocument() && !this.isUpLoadingAFile()) {
        this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
      }
    }
  }

  fileValidationsOnTab() {

    if (this.isAMandatoryComponent()) {
      if (this.validateFormUploadedDocument()) {
        this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_ERROR_FILE_REQUIRED);
      }
    }
  }

  fileChangeEvent(fileInput: any) {

    if (fileInput.target.files[0]) {
      this.selectedFile = fileInput.target.files[0];
      this.displayFileUploadMessages(WriteDocumentFieldComponent.UPLOAD_WAITING_FILE_STATUS);
      const documentUpload: FormData = this.buildDocumentUploadData(this.selectedFile);
      this.fileUploadStateService.setUploadInProgress(true);

      const uploadFile = this.secureModeOn ?
        this.documentManagement.secureUploadFile(documentUpload) :
        this.documentManagement.uploadFile(documentUpload);

      this.fileUploadSubscription = uploadFile.subscribe({
        next: (resultDocument: DocumentData) => this.handleDocumentUploadResult(resultDocument),
        error: (error: HttpError) => this.handleDocumentUploadError(error)
      });
    } else {
      this.resetUpload();
    }
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  fileSelectEvent() {
    if ((this.caseField.value && this.caseField.value.document_filename) ||
      (this.selectedFile && this.selectedFile.name)) {
      this.openDialog(this.dialogConfig);
    } else {
      this.openFileDialog();
    }
  }

  openDialog(dialogConfig) {
    const dialogRef = this.dialog.open(DocumentDialogComponent, dialogConfig);
    this.dialogSubscription = dialogRef.beforeClosed().subscribe(result => {
      this.confirmReplaceResult = result;
      this.triggerReplace();
    });
  }

  triggerReplace() {
    if (this.confirmReplaceResult === 'Replace') {
      this.openFileDialog();
    }
  }

  getUploadedFileName() {
    if (this.uploadedDocument) {
      return this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).value;
    } else {
      return undefined;
    }
  }

  private initDialog() {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = true;
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.ariaLabel = 'Label';
    this.dialogConfig.height = '245px';
    this.dialogConfig.width = '550px';
    this.dialogConfig.panelClass = 'dialog';

    this.dialogConfig.closeOnNavigation = false;
    this.dialogConfig.position = {
      top: window.innerHeight / 2 - 120 + 'px', left: window.innerWidth / 2 - 275 + 'px'
    }
  }

  private subscribeToCaseDetails(): void {
    this.caseEventSubscription = this.caseNotifier.caseView.subscribe({
      next: (caseDetails) => {
        this.caseDetails = caseDetails;
      }
    });
  }

  private isAMandatoryComponent() {
    return this.caseField.display_context && this.caseField.display_context === Constants.MANDATORY;
  }

  private displayFileUploadMessages(fileUploadMessage: string) {
    this.valid = false;
    this.fileUploadMessages = fileUploadMessage;
  }

  private isUpLoadingAFile(): boolean {
    return this.fileUploadMessages === WriteDocumentFieldComponent.UPLOAD_WAITING_FILE_STATUS
  }
  private validateFormUploadedDocument(): boolean {
    if (!this.uploadedDocument) {
      return true;
    }

    let validation = !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_BINARY_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).valid;

    if (this.secureModeOn) {
      validation = validation && !this.uploadedDocument.get(WriteDocumentFieldComponent.DOCUMENT_HASH).valid
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
  }

  private createDocumentFormWithValidator(document: {url: string, binaryUrl: string, filename: string, documentHash?: string}) {
    let documentFormGroup;

    if (document.documentHash) {
      documentFormGroup = {
        document_url: new FormControl(document.url, Validators.required),
        document_binary_url: new FormControl(document.binaryUrl, Validators.required),
        document_filename: new FormControl(document.filename, Validators.required),
        document_hash: new FormControl(document.documentHash, Validators.required)
      };
    } else {
      documentFormGroup = {
        document_url: new FormControl(document.url, Validators.required),
        document_binary_url: new FormControl(document.binaryUrl, Validators.required),
        document_filename: new FormControl(document.filename, Validators.required)
      };
    }

    this.uploadedDocument = this.registerControl(new FormGroup(documentFormGroup), true) as FormGroup;
  }

  private createDocumentForm(document: {url: string, binaryUrl: string, filename: string, documentHash?: string}) {
    let documentFormGroup;

    if (document.documentHash) {
      documentFormGroup = {
        document_url: new FormControl(document.url),
        document_binary_url: new FormControl(document.binaryUrl),
        document_filename: new FormControl(document.filename),
        document_hash: new FormControl(document.documentHash)
      };
    } else {
      documentFormGroup = {
        document_url: new FormControl(document.url),
        document_binary_url: new FormControl(document.binaryUrl),
        document_filename: new FormControl(document.filename)
      };
    }

    this.uploadedDocument = this.registerControl(new FormGroup(documentFormGroup), true) as FormGroup;
  }

  private getErrorMessage(error: HttpError): string {
    // Document Management unavailable
    if (0 === error.status || 502 === error.status) {
      return WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
    }
    return error.error;
  }

  private buildDocumentUploadData(selectedFile: File): FormData {
    const documentUpload: FormData = new FormData();
    documentUpload.append('files', selectedFile, selectedFile.name);
    documentUpload.append('classification', 'PUBLIC');

    if (this.appConfig.getDocumentSecureMode()) {
      documentUpload.append('caseTypeId', this.caseDetails.case_type.id);
      documentUpload.append('jurisdictionId', this.caseDetails.case_type.jurisdiction.id);
    }

    return documentUpload;
  }

  private handleDocumentUploadResult(result: DocumentData): void {
    if (!this.uploadedDocument) {
      if (this.secureModeOn) {
        this.createDocumentForm({url: null, binaryUrl: null, filename: null, documentHash: null});
      } else {
        this.createDocumentForm({url: null, binaryUrl: null, filename: null});
      }
    }

    let document = this.secureModeOn ? result.documents[0] : result._embedded.documents[0];

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

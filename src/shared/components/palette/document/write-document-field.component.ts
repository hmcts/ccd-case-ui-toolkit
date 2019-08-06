import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DocumentManagementService } from '../../../services/document-management/document-management.service';
import { HttpError } from '../../../domain/http/http-error.model';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DocumentDialogComponent } from '../../dialogs/document-dialog/document-dialog.component';
import { Constants } from '../../../commons/constants'

@Component({
  selector: 'ccd-write-document-field',
  templateUrl: './write-document-field.html'
})
export class WriteDocumentFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  private uploadedDocument: FormGroup;
  private selectedFile: File;
  private dialogConfig: MatDialogConfig;
  @ViewChild('fileInput') fileInput: ElementRef;

  valid = true;
  uploadError: string;
  confirmReplaceResult: string;
  clickInsideTheDocument: boolean

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // Capturing the event of of the associated  ElementRef <input type="file" #fileInpu

    if (this.fileInput.nativeElement.contains(event.target)) {
      this.clickInsideTheDocument = true
    } else {
      this.fileValidations()
    }
  }

  constructor(private documentManagement: DocumentManagementService, private dialog: MatDialog) {
    super();
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

  ngOnInit() {
    this.initDialog();
    let document = this.caseField.value;

    if (document) {
      this.createDocumentGroup(
        document.document_url,
        document.document_binary_url,
        document.document_filename,
      )
    } else {
      this.createDocumentGroup(
        WriteDocumentFieldDefinitions.DOCUMENT_URL,
        WriteDocumentFieldDefinitions.DOCUMENT_BINARY_URL,
        WriteDocumentFieldDefinitions.DOCUMENT_FILENAME);
      this.setComponentToInitialValues();
    }
  }

  fileValidations () {

    if (this.isAMandatoryComponent()) {

      if ( this.clickInsideTheDocument && this.validateFormUploadedDocument() ) {
        this.displayFileErrors();
      }
    }
  }

  fileValidationsOnTab () {

    if (this.isAMandatoryComponent()) {

      if ( this.validateFormUploadedDocument() ) {
        this.displayFileErrors();
      }
    }
  }

  private isAMandatoryComponent() {

    return this.caseField.display_context && this.caseField.display_context === Constants.MANDATORY;
  }

  private displayFileErrors () {

    this.valid = false;
    this.uploadError = WriteDocumentFieldDefinitions.UPLOAD_ERROR_FILE_REQUIRED;
  }

  private  validateFormUploadedDocument():  boolean {
    if (!this.uploadedDocument ) {
      return true;
    }

    let validation = !this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_BINARY_URL).valid &&
      !this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_FILENAME).valid;

    return validation;
  }

  fileChangeEvent(fileInput: any) {

    if (fileInput.target.files[0]) {
      this.selectedFile = fileInput.target.files[0];

      // Perform the file upload immediately on file selection
      let documentUpload: FormData = new FormData();
      documentUpload.append('files', this.selectedFile, this.selectedFile.name);
      documentUpload.append('classification', 'PUBLIC');
      this.documentManagement.uploadFile(documentUpload).subscribe(result => {
        if (!this.uploadedDocument) {
            this.uploadedDocument = this.registerControl(new FormGroup({
              document_url: new FormControl(WriteDocumentFieldDefinitions.DOCUMENT_URL),
              document_binary_url: new FormControl(WriteDocumentFieldDefinitions.DOCUMENT_BINARY_URL),
              document_filename: new FormControl(WriteDocumentFieldDefinitions.DOCUMENT_FILENAME)
            }));
        }
        let document = result._embedded.documents[0];
        this.setDocumentGroupValues(
          document._links.self.href,
          document._links.binary.href,
          document.originalDocumentName,
        );

        this.valid = true;
      }, (error: HttpError) => {
        this.uploadError = this.getErrorMessage(error);
        this.valid = false;
      });
    } else {

      this.setComponentToInitialValues();
      if (this.isAMandatoryComponent()) {
        this.displayFileErrors();
      }
    }
  }
  private setComponentToInitialValues() {
    if (this.isAMandatoryComponent()) {
      this.selectedFile = null;
      this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_URL).setValue(null);
      this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_BINARY_URL).setValue(null);
      this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_FILENAME).setValue(null);
    }
  }
  private createDocumentGroup(url: string, binaryUrl: string, filename: string): void {

    if (this.isAMandatoryComponent()) {
      this.uploadedDocument = this.registerControl(new FormGroup({
        document_url: new FormControl(url, Validators.required),
        document_binary_url: new FormControl(binaryUrl, Validators.required),
        document_filename: new FormControl(filename, Validators.required)
      }));
    }
  }

  private setDocumentGroupValues(url: string, binaryUrl: string, filename: string): void {
    this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_URL).setValue(url);
    this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_BINARY_URL).setValue(binaryUrl);
    this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_FILENAME).setValue(filename);
  }

  private getErrorMessage(error: HttpError): string {
    // Document Management unavailable
    if (0 === error.status || 502 === error.status) {
      return WriteDocumentFieldDefinitions.UPLOAD_ERROR_NOT_AVAILABLE;
    }

    return error.error;
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  fileSelectEvent() {
    if (this.caseField.value) {
      this.openDialog(this.dialogConfig);
    } else {
      this.openFileDialog();
    }
  }

  openDialog(dialogConfig) {
    const dialogRef = this.dialog.open(DocumentDialogComponent, dialogConfig);
    dialogRef.beforeClose().subscribe(result => {
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
      return this.uploadedDocument.get(WriteDocumentFieldDefinitions.DOCUMENT_FILENAME).value;
    } else {
      return undefined;
    }
  }
}

class WriteDocumentFieldDefinitions {
  static readonly DOCUMENT_URL = 'document_url';
  static readonly DOCUMENT_BINARY_URL = 'document_binary_url';
  static readonly DOCUMENT_FILENAME = 'document_filename';
  static readonly UPLOAD_ERROR_FILE_REQUIRED = 'File required';
  static readonly UPLOAD_ERROR_NOT_AVAILABLE = 'Document upload facility is not available at the moment';
}

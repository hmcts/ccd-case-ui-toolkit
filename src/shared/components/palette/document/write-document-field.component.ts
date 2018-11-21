import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup } from '@angular/forms';
import { DocumentManagementService } from '../../../services/document-management/document-management.service';
import { HttpError } from '../../../domain/http/http-error.model';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DocumentDialogComponent } from '../../dialogs/document-dialog/document-dialog.component';

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
  selectedFileName: string;

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
      );
    }
/*  else {
      this.createDocumentGroup();
    } */
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
          this.createDocumentGroup();
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
      this.selectedFile = null;
      this.valid = true;
    }
  }

  private createDocumentGroup(url?: string, binaryUrl?: string, filename?: string): void {
    this.uploadedDocument = this.registerControl(new FormGroup({
      document_url: new FormControl(url || ''),
      document_binary_url: new FormControl(binaryUrl || ''),
      document_filename: new FormControl(filename || '')
    }));
  }

  private setDocumentGroupValues(url: string, binaryUrl: string, filename: string): void {
    this.uploadedDocument.get('document_url').setValue(url);
    this.uploadedDocument.get('document_binary_url').setValue(binaryUrl);
    this.uploadedDocument.get('document_filename').setValue(filename);
    this.selectedFileName = filename;
  }

  private getErrorMessage(error: HttpError): string {
    // Document Management unavailable
    if (0 === error.status || 502 === error.status) {
      return 'Document upload facility is not available at the moment';
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
      return this.uploadedDocument.get('document_filename').value;
    } else {
      return undefined;
    }
  }
}

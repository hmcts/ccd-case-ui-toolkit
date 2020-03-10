import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { WriteDocumentFieldComponent } from './write-document-field.component';
import { FileUploadStateService } from './file-upload-state.service';

@Injectable()
export class FileUploadProgressGuard implements CanDeactivate<WriteDocumentFieldComponent> {

    static readonly CONFIRM_MESSAGE = 'File upload in progress. Press “Cancel” to cancel the upload. Press “Ok” to continue the document upload.';

    constructor(
        private fileUploadStateService: FileUploadStateService
    ) {}
    
    canDeactivate(target: WriteDocumentFieldComponent) {
        if (this.fileUploadStateService.isUploadInProgress()) {
            const userDecision = !window.confirm(FileUploadProgressGuard.CONFIRM_MESSAGE);
            if (userDecision) {
                this.fileUploadStateService.setUploadInProgress(false);
            }
            return userDecision;
        }
        return true;
    }

}

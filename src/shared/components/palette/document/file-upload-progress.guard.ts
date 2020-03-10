import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { WriteDocumentFieldComponent } from './write-document-field.component';
import { FileUploadStateService } from './file-upload-state.service';

@Injectable()
export class FileUploadProgressGuard implements CanDeactivate<WriteDocumentFieldComponent> {

    constructor(
        private fileUploadStateService: FileUploadStateService
    ) {}
    
    canDeactivate(target: WriteDocumentFieldComponent) {
        if (this.fileUploadStateService.isUploadInProgress()) {
            const userDecision = window.confirm('Do you really want to hurt me?');
            if (userDecision) {
                this.fileUploadStateService.setUploadInProgress(false);
            }
            return userDecision;
        }
        return true;
    }

}

import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { FileUploadStateService } from './file-upload-state.service';
import { WindowService } from '../../../services';

@Injectable()
export class FileUploadProgressGuard implements CanDeactivate<any> {

    static readonly CONFIRM_MESSAGE = 'File upload in progress. Press “Cancel” to cancel the upload. Press “Ok” to continue the document upload.';

    constructor(
        private fileUploadStateService: FileUploadStateService,
        private windowService: WindowService
    ) {}

    canDeactivate() {
        if (this.fileUploadStateService.isUploadInProgress()) {
            const userDecision = !this.windowService.confirm(FileUploadProgressGuard.CONFIRM_MESSAGE);
            if (userDecision) {
                this.fileUploadStateService.setUploadInProgress(false);
            }
            return userDecision;
        }
        return true;
    }

}

import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { WindowService } from '../../../services/window/window.service';
import { FileUploadStateService } from './file-upload-state.service';

@Injectable()
export class FileUploadProgressGuard implements CanDeactivate<any> {

    public static readonly CONFIRM_MESSAGE = 'File upload in progress. Press “Cancel” to cancel the upload. Press “Ok” to continue the document upload.';

    constructor(
        private readonly fileUploadStateService: FileUploadStateService,
        private readonly windowService: WindowService
    ) {}

    public canDeactivate() {
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

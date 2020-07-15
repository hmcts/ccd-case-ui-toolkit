import { Injectable } from '@angular/core';

@Injectable()
export class FileUploadStateService {
    uploadInProgress: boolean;

    setUploadInProgress(value: boolean): void {
        this.uploadInProgress = value;
    }

    isUploadInProgress(): boolean {
        return this.uploadInProgress;
    }
}

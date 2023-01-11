import { Injectable } from '@angular/core';

@Injectable()
export class FileUploadStateService {
    public uploadInProgress: boolean;

    public setUploadInProgress(value: boolean): void {
        this.uploadInProgress = value;
    }

    public isUploadInProgress(): boolean {
        return this.uploadInProgress;
    }
}

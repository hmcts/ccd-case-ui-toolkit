import { FileUploadStateService } from './file-upload-state.service';

describe('FileUploadStateService', () => {

    let fileUploadStateService: FileUploadStateService;

    beforeEach(() => {
        fileUploadStateService = new FileUploadStateService();
    });

    describe('setUploadInProgress', () => {

        it('should set "uploadInProgress" to true when called with true', () => {
            fileUploadStateService.setUploadInProgress(true);
            expect(fileUploadStateService.uploadInProgress).toBeTruthy();
        });

        it('should set "uploadInProgress" to false when called with false', () => {
            fileUploadStateService.setUploadInProgress(false);
            expect(fileUploadStateService.uploadInProgress).toBeFalsy();
        });
    });

    describe('isUploadInProgress', () => {

        it('should return state of "uploadInProgress"', () => {
            fileUploadStateService.uploadInProgress = false;
            expect(fileUploadStateService.isUploadInProgress()).toBeFalsy();
            fileUploadStateService.uploadInProgress = true;
            expect(fileUploadStateService.isUploadInProgress()).toBeTruthy();
        });
    });
});

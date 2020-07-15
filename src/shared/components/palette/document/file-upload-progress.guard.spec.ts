import { FileUploadProgressGuard } from './file-upload-progress.guard';
import createSpyObj = jasmine.createSpyObj;
import { FileUploadStateService } from './file-upload-state.service';
import { WindowService } from '../../../services';

describe('FileUploadProgressGuard', () => {
    let guard: FileUploadProgressGuard;
    let mockFileUploadStateService: any;
    let mockWindowService: any;

    beforeEach(() => {
        mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', ['isUploadInProgress', 'setUploadInProgress']);
        mockWindowService = createSpyObj<WindowService>('WindowService', ['confirm']);
        guard = new FileUploadProgressGuard(mockFileUploadStateService, mockWindowService);
    });

    it('should not deactiavte when upload in progress and user clicks "OK"', () => {
        mockFileUploadStateService.isUploadInProgress.and.returnValue(true);
        mockWindowService.confirm.and.returnValue(true);
        const result = guard.canDeactivate();
        expect(result).toBeFalsy();
    });

    it('should deactiavte when upload in progress and user clicks "Cancel"', () => {
        mockFileUploadStateService.isUploadInProgress.and.returnValue(true);
        mockWindowService.confirm.and.returnValue(false);
        const result = guard.canDeactivate();
        expect(result).toBeTruthy();
    });

    it('should deactiavte when no upload in progress', () => {
        mockFileUploadStateService.isUploadInProgress.and.returnValue(false);
        const result = guard.canDeactivate();
        expect(result).toBeTruthy();
    });
});

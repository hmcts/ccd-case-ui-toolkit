import { WindowService } from '../../../services';
import { UnsavedChangesTestComponent } from '../unsaved-changes/unsaved-changes.component.spec';
import { UnsavedChangesGuard } from './unsaved-changes.guard';

import createSpyObj = jasmine.createSpyObj;

describe('UnsavedChangesGuard', () => {
  let guard: UnsavedChangesGuard;
  let component: UnsavedChangesTestComponent
  let mockWindowService: any;

  beforeEach(() => {
    component = new UnsavedChangesTestComponent();
    mockWindowService = createSpyObj<WindowService>('WindowService', ['confirm']);
    guard = new UnsavedChangesGuard(mockWindowService);
  });

  it('should deactivate when the component can deactivate', () => {
    const componentSpy = spyOn(component, 'canDeactivate').and.callThrough();
    component.canActuallyDeactivate = true;

    const result = guard.canDeactivate(component);
    expect(componentSpy).toHaveBeenCalled();
    expect(mockWindowService.confirm).not.toHaveBeenCalled();
    expect(result).toEqual(true);
  });

  it('should warn of unsaved changes when the component cannot deactivate', () => {
    const componentSpy = spyOn(component, 'canDeactivate').and.callThrough();
    component.canActuallyDeactivate = false;

    const result = guard.canDeactivate(component);
    expect(componentSpy).toHaveBeenCalled();
    expect(mockWindowService.confirm).toHaveBeenCalledWith(UnsavedChangesGuard.CONFIRM_MESSAGE);
  });

  it('should allow deactivation when user cannot deactivate but user confirms changes can be lost', () => {
    const componentSpy = spyOn(component, 'canDeactivate').and.callThrough();
    component.canActuallyDeactivate = false;
    mockWindowService.confirm.and.returnValue(true);

    const result = guard.canDeactivate(component);
    expect(componentSpy).toHaveBeenCalled();
    expect(mockWindowService.confirm).toHaveBeenCalledWith(UnsavedChangesGuard.CONFIRM_MESSAGE);
    expect(result).toEqual(true);
  });

  it('should warn of unsaved changes when the component cannot deactivate', () => {
    const componentSpy = spyOn(component, 'canDeactivate').and.callThrough();
    component.canActuallyDeactivate = false;
    mockWindowService.confirm.and.returnValue(false);

    const result = guard.canDeactivate(component);
    expect(componentSpy).toHaveBeenCalled();
    expect(mockWindowService.confirm).toHaveBeenCalledWith(UnsavedChangesGuard.CONFIRM_MESSAGE);
    expect(result).toEqual(false);
  });
});

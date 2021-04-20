import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UnsavedChangesGuard } from '../guards/unsaved-changes.guard';
import { UnsavedChangesComponent } from './unsaved-changes.component';

@Component({
  selector: 'unsaved-changes-test',
  template: '<div></div>',
})
export class UnsavedChangesTestComponent extends UnsavedChangesComponent {
  public canActuallyDeactivate = true;

  canDeactivate(): boolean {
    return this.canActuallyDeactivate;
  }
}

describe('UnsavedChangesComponent', () => {
  let component: UnsavedChangesTestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ UnsavedChangesComponent, UnsavedChangesTestComponent ]
    });
    component = TestBed.get(UnsavedChangesTestComponent);
  });

  describe('unloadNotification', () => {

    it('should return true when canDeactivate() is true', () => {
      const canDeactivateSpy = spyOn(component, 'canDeactivate').and.callThrough();
      component.canActuallyDeactivate = true;
      const EVENT = { returnValue: undefined };

      const result = component.unloadNotification(EVENT);
      expect(canDeactivateSpy).toHaveBeenCalled();
      expect(result).toEqual(true);
      expect(EVENT.returnValue).toBeUndefined(); // Should be untouched.
    });

    it('should return false and update event returnValue when canDeactivate() is false', () => {
      component.canActuallyDeactivate = false;
      const canDeactivateSpy = spyOn(component, 'canDeactivate').and.callThrough();
      const EVENT = { returnValue: undefined };

      const result = component.unloadNotification(EVENT);
      expect(canDeactivateSpy).toHaveBeenCalled();
      expect(result).toEqual(false);
      expect(EVENT.returnValue).toEqual(UnsavedChangesGuard.CONFIRM_MESSAGE);
    });

  });

});

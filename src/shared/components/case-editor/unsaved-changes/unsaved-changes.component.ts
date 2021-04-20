import { HostListener } from '@angular/core';

import { ComponentCanDeactivate } from '../domain';
import { UnsavedChangesGuard } from '../guards';

export class UnsavedChangesComponent implements ComponentCanDeactivate {
  /**
   * Indicates whether or not this component can be deactivated immediately.
   * NOTE: This needs to be overridden in any component that extends this.
   * @returns a boolean indication of whether this component can deactivate.
   */
  public canDeactivate(): boolean {
    return true;
  }

  /**
   * @HostListener allows us to also guard against browser refresh, close, etc.
   * @param $event The unload event, used only for IE11/Edge.
   * @returns a boolean indication of whether this component can unloaded.
   */
  @HostListener('window:beforeunload', ['$event'])
  public unloadNotification($event: any): boolean {
    const canUnload = this.canDeactivate();
    if (!canUnload) {
      // Note that this is for IE11/Edge ONLY. There is no override
      // for modern browsers - they simply show a default message.
      $event.returnValue = UnsavedChangesGuard.CONFIRM_MESSAGE;
    }
    return canUnload;
  }
}

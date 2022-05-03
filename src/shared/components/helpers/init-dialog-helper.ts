import { MatDialogConfig } from '@angular/material/dialog';

export function initDialog(dialogConfig: MatDialogConfig): MatDialogConfig {
  dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.ariaLabel = 'Label';
  dialogConfig.height = '245px';
  dialogConfig.width = '550px';
  dialogConfig.panelClass = 'dialog';
  dialogConfig.closeOnNavigation = false;
  dialogConfig.position = {
    top: window.innerHeight / 2 - 120 + 'px', left: window.innerWidth / 2 - 275 + 'px'
  }
  return dialogConfig;
}

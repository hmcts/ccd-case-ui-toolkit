import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CaseFileViewOverlayMenuItem } from './case-file-view-overlay-menu-item.model';

@Component({
  selector: 'ccd-case-file-view-overlay-menu',
  templateUrl: './case-file-view-overlay-menu.component.html',
  styleUrls: ['./case-file-view-overlay-menu.component.scss']
})
export class CaseFileViewOverlayMenuComponent {
  @Input() public title: string = '';
  @Input() public menuItems: CaseFileViewOverlayMenuItem[];

  @Input() public isOpen = false;
  @Output() public isOpenChange = new EventEmitter<boolean>();

  public setOpen() {
    this.isOpen = !this.isOpen;
    if(this.isOpen) {
      console.log('open');
      const el = document.getElementById("overlay-menu__item0");
      console.log("element =", el);
      if( el ) {
        setTimeout(()=>{
          (el as HTMLElement).focus();
          console.log("element to focus=", el);
        },0); 
      }
    }
  }

  public closeOverlay(): void {
    const isOpen = false;

    this.isOpen = isOpen;
    this.isOpenChange.emit(isOpen);
  }

  public actionAndClose(func: any): void {
    func();
    this.closeOverlay();
  }
}

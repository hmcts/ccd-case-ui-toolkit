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

  public closeOverlay(): void {
    const isOpen = false;

    this.isOpen = isOpen;
    this.isOpenChange.emit(isOpen);
  }

  public setOpen() {
    this.isOpen = !this.isOpen;
    if(this.isOpen) {
      setTimeout(()=>{
        const el = document.querySelector('.overlay-menu__item:first-of-type');
        if(el) { (el as HTMLElement).focus(); }
      },0); 
    }
  }
}

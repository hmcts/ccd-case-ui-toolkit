import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseFileViewOverlayMenuItem } from '../../shared/case-file-view-overlay-menu/case-file-view-overlay-menu-item.model';

@Component({
  selector: 'ccd-case-file-view-folder-document-actions',
  templateUrl: './case-file-view-folder-document-actions.component.html',
  styleUrls: ['./case-file-view-folder-document-actions.component.scss']
})
export class CaseFileViewFolderDocumentActionsComponent implements OnInit {
  public isOpen = false;

  @Input() public allowMoving: boolean;

  @Output() public changeFolderAction = new EventEmitter<void>();
  @Output() public openInANewTabAction = new EventEmitter<void>();
  @Output() public downloadAction = new EventEmitter<void>();
  @Output() public printAction = new EventEmitter<void>();

  public overlayMenuItems: CaseFileViewOverlayMenuItem[] = [
    { actionText: 'Open in a new tab', iconSrc: '/assets/img/case-file-view/document-menu/open_in_new.svg', actionFn: () => this.openInANewTabAction.emit() },
    { actionText: 'Download', iconSrc: '/assets/img/case-file-view/document-menu/download.svg', actionFn: () => this.downloadAction.emit() },
    { actionText: 'Print', iconSrc: '/assets/img/case-file-view/document-menu/print.svg', actionFn: () => this.printAction.emit() },
  ];

  constructor() {}

  public ngOnInit() {
    if (this.allowMoving) {
      this.overlayMenuItems.unshift({ actionText: 'Change folder', iconSrc: '/assets/img/case-file-view/document-menu/open_with.svg', actionFn: () => this.changeFolderAction.emit() });
    }
  }
}

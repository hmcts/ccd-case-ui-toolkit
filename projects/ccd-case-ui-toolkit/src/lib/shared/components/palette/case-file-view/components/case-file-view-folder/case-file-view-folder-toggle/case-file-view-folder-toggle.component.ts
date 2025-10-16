import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractAppConfig } from '../../../../../../../app.config';
import { CaseFileViewOverlayMenuItem } from '../../shared/case-file-view-overlay-menu/case-file-view-overlay-menu-item.model';

@Component({
  selector: "ccd-case-file-view-folder-toggle",
  templateUrl: "./case-file-view-folder-toggle.component.html",
  styleUrls: ["./case-file-view-folder-toggle.component.scss"],
  standalone: false
})
export class CaseFileViewFolderToggleComponent {
  public isOpen = false;

  @Output() public expandAll = new EventEmitter<boolean>();
  @Output() public collapseAll = new EventEmitter<boolean>();

  public overlayMenuItems: CaseFileViewOverlayMenuItem[] = [
    {
      actionText: "Expand All",
      iconSrc: "/assets/img/accordion-plus.png",
      actionFn: () => this.expandAll.emit(true),
    },
    {
      actionText: "Collapse All",
      iconSrc: "/assets/img/accordion-minus.png",
      actionFn: () => this.collapseAll.emit(true),
    },
  ];

  constructor(private readonly appConfig: AbstractAppConfig) {}
}

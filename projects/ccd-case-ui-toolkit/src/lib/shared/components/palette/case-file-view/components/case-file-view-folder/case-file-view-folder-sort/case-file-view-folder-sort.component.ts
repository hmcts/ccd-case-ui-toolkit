import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseFileViewOverlayMenuItem } from '../../shared/case-file-view-overlay-menu/case-file-view-overlay-menu-item.model';

@Component({
  selector: 'ccd-case-file-view-folder-sort',
  templateUrl: './case-file-view-folder-sort.component.html',
  styleUrls: ['./case-file-view-folder-sort.component.scss']
})
export class CaseFileViewFolderSortComponent implements OnInit {
  public isOpen = false;

  @Output() public sortAscending = new EventEmitter<void>();
  @Output() public sortDescending = new EventEmitter<void>();

  public overlayMenuItems: CaseFileViewOverlayMenuItem[] = [
    { actionText: 'A to Z descending', iconSrc: '/assets/img/sort/sort-down-arrow.svg', actionFn: () => this.sortAscending.emit() },
    { actionText: 'Z to A descending', iconSrc: '/assets/img/sort/sort-up-arrow.svg', actionFn: () => this.sortDescending.emit() },
  ];
  constructor() { }

  public ngOnInit() {
  }
}

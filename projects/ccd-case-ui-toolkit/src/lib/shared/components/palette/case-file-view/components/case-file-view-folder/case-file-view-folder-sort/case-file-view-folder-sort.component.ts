import { Component, EventEmitter, Output } from '@angular/core';
import { CaseFileViewSortColumns } from '../../../../../../domain/case-file-view/case-file-view-sort-columns.enum';
import { CaseFileViewOverlayMenuItem } from '../../shared/case-file-view-overlay-menu/case-file-view-overlay-menu-item.model';

@Component({
  selector: 'ccd-case-file-view-folder-sort',
  templateUrl: './case-file-view-folder-sort.component.html',
  styleUrls: ['./case-file-view-folder-sort.component.scss']
})
export class CaseFileViewFolderSortComponent {
  public isOpen = false;

  @Output() public sortAscending = new EventEmitter<number>();
  @Output() public sortDescending = new EventEmitter<number>();

  public overlayMenuItems: CaseFileViewOverlayMenuItem[] = [
    { actionText: 'A to Z ascending', iconSrc: '/assets/img/sort/sort-down-arrow.svg', actionFn: () => this.sortAscending.emit(CaseFileViewSortColumns.DOCUMENT_NAME) },
    { actionText: 'Z to A descending', iconSrc: '/assets/img/sort/sort-up-arrow.svg', actionFn: () => this.sortDescending.emit(CaseFileViewSortColumns.DOCUMENT_NAME) },
    { actionText: 'Recent first', iconSrc: '/assets/img/sort/sort-up-arrow.svg', actionFn: () => this.sortDescending.emit(CaseFileViewSortColumns.DOCUMENT_UPLOAD_TIMESTAMP) },
    { actionText: 'Oldest first', iconSrc: '/assets/img/sort/sort-up-arrow.svg', actionFn: () => this.sortAscending.emit(CaseFileViewSortColumns.DOCUMENT_UPLOAD_TIMESTAMP) },
  ];
  constructor() { }
}

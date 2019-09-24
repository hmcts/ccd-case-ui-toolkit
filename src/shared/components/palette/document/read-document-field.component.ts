import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Router } from '@angular/router';
import { WindowService } from '../../../services/window';
import { DocumentManagementService } from '../../../services/document-management';

const MEDIA_VIEWER_INFO = 'media-viewer-info';

@Component({
  selector: 'ccd-read-document-field',
  templateUrl: './read-document-field.html'
})
export class ReadDocumentFieldComponent extends AbstractFieldReadComponent {

  constructor(private windowService: WindowService,
              private documentManagement: DocumentManagementService,
              private router: Router) {
    super();
  }

  showMediaViewer(): void {
    this.windowService.removeLocalStorage(MEDIA_VIEWER_INFO);
    if (this.caseField && this.caseField.value) {
      this.windowService.setLocalStorage(MEDIA_VIEWER_INFO, this.documentManagement.getMediaViewerInfo(this.caseField.value));
    }
    this.windowService.openOnNewTab(this.getMediaViewerUrl());
  }

  getMediaViewerUrl(): string {
    let routerMediaViewer = this.router.createUrlTree(['/media-viewer']);
    if (routerMediaViewer) {
      return routerMediaViewer.toString();
    }
  }
}

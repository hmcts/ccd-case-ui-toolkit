import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Router } from '@angular/router';
import { WindowService } from '../../../services/window';
import { DocumentManagementService } from '../../../services/document-management';

const MEDIA_VIEWER = 'media-viewer';

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
    let routerMediaViewer = this.router.createUrlTree(['/media-viewer']);
    this.windowService.setLocalStorage(MEDIA_VIEWER, this.documentManagement.createMediaViewer(this.caseField));
    window.open(routerMediaViewer.toString(), '_blank');
  }

}

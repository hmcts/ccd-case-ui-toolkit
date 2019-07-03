import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Router } from '@angular/router';
import { WindowService } from '../../../services/window';
import { DocumentManagementService } from '../../../services/document-management';

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

  showDocViewer(): void {
    let routerDocViewer = this.router.createUrlTree(['/doc-viewer']);
    this.windowService.setLocalStorage('DOC_VIEWER', this.documentManagement.createDocViewer(this.caseField));
    window.open(routerDocViewer.toString(), '_blank');
  }

}

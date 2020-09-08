import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '../../../services/window';
import { DocumentManagementService } from '../../../services/document-management';
import { CasesService } from '../../case-editor/services/cases.service';
import { Subscription } from 'rxjs';

const MEDIA_VIEWER_INFO = 'media-viewer-info';

@Component({
  selector: 'ccd-read-document-field',
  templateUrl: './read-document-field.html'
})
export class ReadDocumentFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  caseId: string = '';
  caseViewSubscription: Subscription;

  constructor(
    private windowService: WindowService,
    private documentManagement: DocumentManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private casesService: CasesService
  ) {
    super();
  }

  ngOnInit() {
    this.caseId = this.route.snapshot.params['cid'];
  }

  showMediaViewer(): void {
    this.windowService.removeLocalStorage(MEDIA_VIEWER_INFO);
    this.caseViewSubscription = this.casesService.getCaseViewV2(this.caseId).subscribe(caseView => {
      if (this.caseField && this.caseField.value) {
        const mergedInfo = {
          ...this.caseField.value,
          id: caseView.case_id,
          jurisdiction: caseView.case_type.jurisdiction.id
        };
        this.windowService.setLocalStorage(MEDIA_VIEWER_INFO, this.documentManagement.getMediaViewerInfo(mergedInfo));
      }
      this.windowService.openOnNewTab(this.getMediaViewerUrl());
    });
  }

  getMediaViewerUrl(): string {
    let routerMediaViewer = this.router.createUrlTree(['/media-viewer']);
    if (routerMediaViewer) {
      return routerMediaViewer.toString();
    }
  }

  ngOnDestroy() {
    if (this.caseViewSubscription) {
      this.caseViewSubscription.unsubscribe();
    }
  }
}

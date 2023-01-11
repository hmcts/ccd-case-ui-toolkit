import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DocumentManagementService } from '../../../services/document-management';
import { WindowService } from '../../../services/window';
import { CasesService } from '../../case-editor/services/cases.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

const MEDIA_VIEWER_INFO = 'media-viewer-info';

@Component({
  selector: 'ccd-read-document-field',
  templateUrl: './read-document-field.html'
})
export class ReadDocumentFieldComponent extends AbstractFieldReadComponent implements OnDestroy {

  public caseViewSubscription: Subscription;

  constructor(
    private readonly windowService: WindowService,
    private readonly documentManagement: DocumentManagementService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly casesService: CasesService
  ) {
    super();
  }

  public showMediaViewer(): void {
    const caseId = this.route.snapshot.params['cid'];
    this.windowService.removeLocalStorage(MEDIA_VIEWER_INFO);
    if (caseId) {
      this.caseViewSubscription = this.casesService.getCaseViewV2(caseId).subscribe(caseView => {
        if (this.caseField && this.caseField.value) {
          const mergedInfo = {
            ...this.caseField.value,
            id: caseView.case_id,
            jurisdiction: caseView.case_type.jurisdiction.id
          };
          this.openMediaViewer(mergedInfo);
        }
      });
    } else {
      if (this.caseField && this.caseField.value) {
        this.openMediaViewer(this.caseField.value);
      }
    }
  }

  public openMediaViewer(documentFieldValue): void {
    this.windowService.setLocalStorage(MEDIA_VIEWER_INFO, this.documentManagement.getMediaViewerInfo(documentFieldValue));
    this.windowService.openOnNewTab(this.getMediaViewerUrl());
  }

  public getMediaViewerUrl(): string {
    const routerMediaViewer = this.router.createUrlTree(['/media-viewer']);
    if (routerMediaViewer) {
      return routerMediaViewer.toString();
    }
  }

  public ngOnDestroy(): void {
    if (this.caseViewSubscription) {
      this.caseViewSubscription.unsubscribe();
    }
  }
}

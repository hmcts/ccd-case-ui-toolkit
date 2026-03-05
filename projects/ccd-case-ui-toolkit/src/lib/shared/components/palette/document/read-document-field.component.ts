import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DocumentManagementService } from '../../../services/document-management';
import { WindowService } from '../../../services/window';
import { CasesService } from '../../case-editor/services/cases.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { FieldsUtils } from '../../../services/fields/fields.utils';

const MEDIA_VIEWER_INFO = 'media-viewer-info';

@Component({
  selector: 'ccd-read-document-field',
  templateUrl: './read-document-field.html',
  standalone: false
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
    const documentBinaryUrl = this.documentManagement.getDocumentBinaryUrl(documentFieldValue);
    const isHtmlDocument = this.documentManagement.isHtmlDocument(documentFieldValue);
    if (isHtmlDocument && documentBinaryUrl) {
      // HTML files are opened directly in a separate tab; all other types continue to use media viewer.
      this.windowService.openOnNewTab(documentBinaryUrl);
      return;
    }

    const token = FieldsUtils.createToken();
    const storageKey = `${MEDIA_VIEWER_INFO}:${token}`;

    const payload = this.documentManagement.getMediaViewerInfo(documentFieldValue);
    this.windowService.setLocalStorage(storageKey, payload);

    this.windowService.openOnNewTab(this.getMediaViewerUrl(token));
  }

  public getMediaViewerUrl(token: string): string {
    const routerMediaViewer = this.router.createUrlTree(
      ['/media-viewer'],
      { queryParams: { mvToken: token } }
    );
    return routerMediaViewer.toString();
  }

  public ngOnDestroy(): void {
    if (this.caseViewSubscription) {
      this.caseViewSubscription.unsubscribe();
    }
  }
}

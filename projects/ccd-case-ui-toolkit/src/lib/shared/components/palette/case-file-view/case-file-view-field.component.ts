import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { fromEvent, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { CaseField } from '../../../domain';
import { CaseFileViewDocument, CategoriesAndDocuments, DocumentTreeNode } from '../../../domain/case-file-view';
import { UserInfo } from '../../../domain/user/user-info.model';
import { CaseFileViewService, DocumentManagementService, LoadingService, SessionStorageService } from '../../../services';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseNotifier } from '../../case-editor/services';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
})
export class CaseFileViewFieldComponent implements OnInit, AfterViewInit, OnDestroy {
  public static readonly PARAM_CASE_ID = 'cid';
  public allowMoving = true;
  public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;
  public categoriesAndDocumentsSubscription: Subscription;
  public getCategoriesAndDocumentsError = false;
  public currentDocument: CaseFileViewDocument | undefined;
  public errorMessages = [] as string[];
  private caseVersion: number;
  public caseField: CaseField;
  public icp_jurisdictions: string[] = [];
  public icpEnabled: boolean = false;
  public caseId: string;

  constructor(private readonly elementRef: ElementRef,
    private readonly route: ActivatedRoute,
    private caseFileViewService: CaseFileViewService,
    private documentManagementService: DocumentManagementService,
    private readonly loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly caseNotifier: CaseNotifier,
    private readonly abstractConfig: AbstractAppConfig,
  ) { }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    this.categoriesAndDocuments$ = this.caseFileViewService.getCategoriesAndDocuments(this.caseId);
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments$.subscribe({
      next: data => {
        this.caseVersion = data.case_version;
      },
      error: _ => this.getCategoriesAndDocumentsError = true
    });

    // EXUI-8000
    const userInfo: UserInfo = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    // Get acls that intersects from acl roles and user roles
    const acls = this.caseField.acls.filter(acl => userInfo.roles.includes(acl.role));
    // As there can be more than one intersecting role, if any acls are update: true
    this.allowMoving = acls.some(acl => acl.update);
    this.icp_jurisdictions = this.abstractConfig.getIcpJurisdictions();
    this.icpEnabled = this.abstractConfig.getIcpEnable();
  }

  public ngAfterViewInit(): void {
    const slider = this.elementRef.nativeElement.querySelector('.slider');
    const documentTreeContainer = this.elementRef.nativeElement.querySelector('.document-tree-container');

    const mousedown$ = fromEvent<MouseEvent>(slider, 'mousedown');
    const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
    const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');
    const drag$ = mousedown$.pipe(
      switchMap(
        (start) => {
          const x = start.clientX;
          const documentTreeContainerWidth = documentTreeContainer.getBoundingClientRect().width;
          return mousemove$.pipe(map(move => {
            move.preventDefault();
            return {
              dx: move.clientX - x,
              documentTreeContainerWidth
            };
          }),
          takeUntil(mouseup$));
        }
      )
    );

    drag$.subscribe(pos => {
      const calculatedWidth = ((pos.documentTreeContainerWidth + pos.dx) * 100) / slider.parentElement.getBoundingClientRect().width;
      documentTreeContainer.setAttribute('style', `width: ${calculatedWidth}%`);
    });
  }

  public setMediaViewerFile(document: DocumentTreeNode): void {
    const mediaViewerInfo = this.documentManagementService.getMediaViewerInfo({
      document_binary_url: document.document_binary_url,
      document_filename: document.document_filename
    });
    this.currentDocument = JSON.parse(mediaViewerInfo);
  }

  public moveDocument(data: { document: DocumentTreeNode, newCategory: string }): void {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    const loadingToken = this.loadingService.register();
    this.caseFileViewService.updateDocumentCategory(cid, this.caseVersion, data.document.attribute_path, data.newCategory)
      .pipe(
        finalize(() => {
          this.loadingService.unregister(loadingToken);
        }),
        catchError((err) => {
          this.errorMessages = [this.moveDocumentError(err)];
          return of(null);
        }),
      )
      .subscribe(res => {
        if (res) {
          this.resetErrorMessages();
          this.reloadPage();
        }
      });
  }

  public reloadPage(): void {
    location.reload();
  }

  public resetErrorMessages(): void {
    this.errorMessages = [];
  }

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }

  public isIcpEnabled(): boolean {
    return this.icpEnabled && ((this.icp_jurisdictions?.length < 1) || this.icp_jurisdictions.includes(
      this.caseNotifier?.cachedCaseView?.case_type?.jurisdiction.id));
  }

  private moveDocumentError(err): string {
    const defaultMsg = 'We couldn\'t move the document. Please try again.';

    if (!(err instanceof HttpErrorResponse)) {
      return defaultMsg;
    }

    switch (err.status) {
      case HttpStatusCode.BadRequest:
      // e.g. malformed PUT, invalid attribute_path, invalid target category
        return 'The request was invalid. Check the document path and destination folder.';
      case HttpStatusCode.Conflict:
      // optimistic concurrency / stale case version
        return 'This case changed since you opened it. Refresh and try again.';
      case HttpStatusCode.NotFound:
        return 'The document or destination folder could not be found.';
      case HttpStatusCode.Forbidden:
      case HttpStatusCode.Unauthorized:
        return 'You do not have permission to move this document to the selected folder.';
      case HttpStatusCode.ServiceUnavailable:
      case HttpStatusCode.GatewayTimeout:
        return 'The service is temporarily unavailable. Please try again in a moment.';
      default:
      // Any other status (including 500)
        return defaultMsg;
    }
  }
}

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createNgModule,
  ElementRef,
  EnvironmentInjector,
  NgModuleRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { CaseField } from '../../../domain';
import { CaseFileViewDocument, CategoriesAndDocuments, DocumentTreeNode } from '../../../domain/case-file-view';
import { UserInfo } from '../../../domain/user/user-info.model';
import { CaseFileViewService, DocumentManagementService, LoadingService, SessionStorageService, WindowService } from '../../../services';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseNotifier } from '../../case-editor/services';
import { safeJsonParse } from '../../../json-utils';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
  standalone: false
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
  @ViewChild('mediaViewerHost', { read: ViewContainerRef })
  private mediaViewerHost: ViewContainerRef;
  private mediaViewerComponentRef: ComponentRef<unknown>;
  private mediaViewerModuleRef: NgModuleRef<unknown>;
  private mediaViewerRenderId = 0;

  constructor(private readonly elementRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly environmentInjector: EnvironmentInjector,
    private readonly route: ActivatedRoute,
    private caseFileViewService: CaseFileViewService,
    private documentManagementService: DocumentManagementService,
    private readonly loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly windowService: WindowService,
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
    const userInfo = safeJsonParse<UserInfo>(this.sessionStorageService.getItem('userDetails'), null);
    const userRoles = userInfo?.roles || [];
    // Get acls that intersects from acl roles and user roles
    const acls = this.caseField.acls.filter(acl => userRoles.includes(acl.role));
    // As there can be more than one intersecting role, if any acls are update: true
    this.allowMoving = acls.some(acl => acl.update);
    this.icp_jurisdictions = this.abstractConfig.getIcpJurisdictions();
    this.icpEnabled = true;
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
    const documentDetails = {
      document_binary_url: document.document_binary_url,
      document_filename: document.document_filename,
      content_type: document.content_type
    };
    if (this.documentManagementService.isHtmlDocument(documentDetails)) {
      const documentBinaryUrl = this.documentManagementService.getDocumentBinaryUrl(documentDetails);
      if (documentBinaryUrl) {
        this.destroyMediaViewer();
        this.currentDocument = undefined;
        this.windowService.openOnNewTab(documentBinaryUrl);
        return;
      }
    }

    const mediaViewerInfo = this.documentManagementService.getMediaViewerInfo(documentDetails);
    this.currentDocument = JSON.parse(mediaViewerInfo);
    void this.renderMediaViewer();
  }

  public moveDocument(data: { document: DocumentTreeNode, newCategory: string }): void {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    const loadingToken = this.loadingService.register();
    this.caseFileViewService.updateDocumentCategory(cid, this.caseVersion, data.document.attribute_path, data.newCategory)
      .pipe(
        finalize(() => {
          this.loadingService.unregister(loadingToken);
        }),
        catchError(() => {
          this.errorMessages = ['You do not have permission to move this document to the selected folder.'];
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
    this.mediaViewerRenderId++;
    this.destroyMediaViewer();
    this.mediaViewerModuleRef?.destroy();
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }

  public isIcpEnabled(): boolean {
    return this.icpEnabled && ((this.icp_jurisdictions?.length < 1) || this.icp_jurisdictions.includes(
      this.caseNotifier?.cachedCaseView?.case_type?.jurisdiction.id));
  }

  private async renderMediaViewer(): Promise<void> {
    const renderId = ++this.mediaViewerRenderId;
    this.destroyMediaViewer();
    this.changeDetectorRef.detectChanges();

    let mediaViewer;
    try {
      mediaViewer = await import('@hmcts/media-viewer');
    } catch {
      if (renderId === this.mediaViewerRenderId) {
        this.errorMessages = ['The document viewer could not be loaded. Please try again.'];
      }
      return;
    }
    if (renderId !== this.mediaViewerRenderId || !this.currentDocument || !this.mediaViewerHost) {
      return;
    }

    const { MediaViewerComponent, MediaViewerModule } = mediaViewer;
    this.mediaViewerModuleRef ??= createNgModule(MediaViewerModule, this.environmentInjector);
    this.mediaViewerComponentRef = this.mediaViewerHost.createComponent(MediaViewerComponent, {
      ngModuleRef: this.mediaViewerModuleRef
    });
    this.mediaViewerComponentRef.setInput('url', this.currentDocument.document_binary_url);
    this.mediaViewerComponentRef.setInput('downloadFileName', this.currentDocument.document_filename);
    this.mediaViewerComponentRef.setInput('showToolbar', true);
    this.mediaViewerComponentRef.setInput('contentType', this.currentDocument.content_type);
    this.mediaViewerComponentRef.setInput('enableAnnotations', true);
    this.mediaViewerComponentRef.setInput('enableRedactions', true);
    this.mediaViewerComponentRef.setInput('height', '94.5vh');
    this.mediaViewerComponentRef.setInput('caseId', this.caseId);
    this.mediaViewerComponentRef.setInput('multimediaPlayerEnabled', true);
    this.mediaViewerComponentRef.setInput('enableICP', this.isIcpEnabled());
  }

  private destroyMediaViewer(): void {
    this.mediaViewerHost?.clear();
    this.mediaViewerComponentRef = undefined;
  }
}

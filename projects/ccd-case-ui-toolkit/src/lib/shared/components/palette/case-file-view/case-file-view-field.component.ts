import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CategoriesAndDocuments, DocumentTreeNode } from '../../../domain/case-file-view';
import { CaseFileViewService, DocumentManagementService } from '../../../services';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
})
export class CaseFileViewFieldComponent implements OnInit, AfterViewInit, OnDestroy {
  public allowMoving = true;
  public static readonly PARAM_CASE_ID = 'cid';
  public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;
  public categoriesAndDocumentsSubscription: Subscription;
  public getCategoriesAndDocumentsError = false;
  public currentDocument: { document_binary_url: string, document_filename: string, content_type: string } | undefined;
  private caseVersion: number;

  constructor(private readonly elementRef: ElementRef,
              private readonly route: ActivatedRoute,
              private caseFileViewService: CaseFileViewService,
              private documentManagementService: DocumentManagementService
  ) {
  }

  public ngOnInit(): void {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    this.categoriesAndDocuments$ = this.caseFileViewService.getCategoriesAndDocuments(cid);
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments$.subscribe({
      next: data => {
        this.caseVersion = data.case_version;
      },
      error: _ => this.getCategoriesAndDocumentsError = true
    });
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

  public moveDocument(data:any) {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    this.caseFileViewService.updateDocumentCategory(cid, this.caseVersion, data.document.attribute_path, data.newCategory).subscribe(_ => {
      location.reload();
    });
  }

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }
}

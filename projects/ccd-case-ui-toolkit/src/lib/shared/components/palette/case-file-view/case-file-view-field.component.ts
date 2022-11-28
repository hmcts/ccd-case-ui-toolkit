import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CategoriesAndDocuments } from '../../../domain/case-file-view';
import { CaseFileViewService } from '../../../services';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
})
export class CaseFileViewFieldComponent implements OnInit, AfterViewInit, OnDestroy {

  public static readonly PARAM_CASE_ID = 'cid';
  public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;
  public categoriesAndDocumentsSubscription: Subscription;
  public getCategoriesAndDocumentsError = false;

  constructor(private readonly elementRef: ElementRef,
              private readonly route: ActivatedRoute,
              private caseFileViewService: CaseFileViewService) {
  }

  public ngOnInit(): void {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    this.categoriesAndDocuments$ = this.caseFileViewService.getCategoriesAndDocuments(cid);
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments$.subscribe({
      next: _ => {},
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

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }
}

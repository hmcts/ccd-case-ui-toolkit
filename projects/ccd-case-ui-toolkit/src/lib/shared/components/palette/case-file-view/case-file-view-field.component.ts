import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CategoriesAndDocuments } from '../../../domain/case-file-view';
import { CaseFileViewService } from '../../../services/case-file-view/case-file-view.service';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss']
})
export class CaseFileViewFieldComponent implements OnInit, AfterViewInit {

  public static readonly PARAM_CASE_ID = 'cid';
  public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;

  constructor(private readonly elementRef: ElementRef,
              private readonly route: ActivatedRoute,
              private caseFileViewService: CaseFileViewService) {
  }

  public ngOnInit(): void {
    const cid = this.route.snapshot.paramMap.get(CaseFileViewFieldComponent.PARAM_CASE_ID);
    this.categoriesAndDocuments$ = this.caseFileViewService.getCategoriesAndDocuments(cid);
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
              documentTreeContainerWidth: documentTreeContainerWidth
            }
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
}

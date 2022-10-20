import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { AbstractFieldReadComponent } from "../base-field/abstract-field-read.component";

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
	styleUrls: ['./case-file-view-field.component.scss']
})
export class CaseFileViewFieldComponent extends AbstractFieldReadComponent implements OnInit, AfterViewInit, OnDestroy {

	@ViewChild('resizer') public resizerElRef: ElementRef;
	public resizer: HTMLElement;

	public x = 0;
	public y = 0;
	public leftWidth = 0;
	public leftSide: Element;
	public rightSide: Element;

	public mouseDownSubscription: Subscription;
	public mouseMoveSubscription: Subscription;
	public mouseUpSubscription: Subscription;

  constructor(private readonly elementRef: ElementRef) {
		super();
	}

	public ngOnInit(): void {
	}
	
	public ngAfterViewInit(): void {
		this.resizer = this.elementRef.nativeElement.querySelector('#resizer');
		this.leftSide = this.elementRef.nativeElement.querySelector('.left');
		this.rightSide = this.elementRef.nativeElement.querySelector('.right');

		const mousedown$ = fromEvent<MouseEvent>(this.resizer, 'mousedown');
		const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
		const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

		const drag$ = mousedown$.pipe(
			switchMap(
				(start) => {
					const x = start.clientX;
					const leftWidth = this.leftSide.getBoundingClientRect().width;
					return mousemove$.pipe(map(move => {
						move.preventDefault();
						return {
							dx: move.clientX - x,
							leftWidth: leftWidth
						}
					}),
					takeUntil(mouseup$));
				}
			)
		);

		drag$.subscribe(pos => {
			console.log('pos', pos);
			const newLeftWidth = ((pos.leftWidth + pos.dx) * 100) / this.resizer.parentElement.getBoundingClientRect().width;
			this.leftSide.setAttribute('style', `width: ${newLeftWidth}%`);
		});
	}

	public ngOnDestroy(): void {
		if (this.mouseDownSubscription) {
			this.mouseDownSubscription.unsubscribe();
		}
		if(this.mouseMoveSubscription) {
			this.mouseMoveSubscription.unsubscribe();
		}
		if(this.mouseUpSubscription) {
			this.mouseUpSubscription.unsubscribe();
		}
	}
}

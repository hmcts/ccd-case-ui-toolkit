import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { fromEvent, Observable, Subscription } from "rxjs";
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

    const mouseDown$ = fromEvent(this.resizer, 'mousedown');

		this.mouseDownSubscription = mouseDown$.subscribe((event: MouseEvent) => {
			const mouseMove$ = fromEvent(this.resizer, 'mousemove');
			const mouseUp$ = fromEvent(document, 'mouseup');
			this.x = event.clientX;
			this.y = event.clientY;
			this.leftWidth = this.leftSide.getBoundingClientRect().width;

			this.mouseMoveSubscription = mouseMove$.subscribe((event: MouseEvent) => {
				const dx = event.clientX - this.x;
				const dy = event.clientY - this.y;
				const newLeftWidth = ((this.leftWidth + dx) * 100) / this.resizer.parentElement.getBoundingClientRect().width;
				this.leftSide.setAttribute('style', `width: ${newLeftWidth}%`);
			});

			this.mouseUpSubscription = mouseUp$.subscribe(() => {
				this.mouseMoveSubscription.unsubscribe();
			});
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

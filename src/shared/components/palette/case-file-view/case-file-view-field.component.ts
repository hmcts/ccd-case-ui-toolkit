import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { fromEvent, Observable, Subscription } from "rxjs";
import { exhaustMap } from "rxjs-compat/operator/exhaustMap";
import { takeUntil } from "rxjs-compat/operator/takeUntil";
import { AbstractFieldReadComponent } from "../base-field/abstract-field-read.component";

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss']
})
export class CaseFileViewFieldComponent extends AbstractFieldReadComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('dragMe') public dragMeElRef: ElementRef;
  @ViewChild('resizer') public resizerElRef: ElementRef;
  public dragMe: HTMLElement;
  public resizer: HTMLElement;

  public x = 0;
  public y = 0;
  public leftWidth = 0;
  public leftSide: Element;
  public rightSide: Element;

  public mouseDowns$: Observable<any>;
  public mouseMoves$: Observable<any>;
  public mouseUps$: Observable<any>;
  public mouseDownsSubscription: Subscription;
  public mouseMovesSubscription: Subscription;
  public mouseUpsSubscription: Subscription;

  constructor(private readonly elementRef: ElementRef, private renderer2: Renderer2) {
    super();
  }

  public ngOnInit(): void {
    
  }

  
  public ngAfterViewInit(): void {

    this.dragMe = this.elementRef.nativeElement.querySelector('#dragMe');
    this.resizer = this.elementRef.nativeElement.querySelector('#resizer');
    this.leftSide = this.elementRef.nativeElement.querySelector('.left');
    this.rightSide = this.elementRef.nativeElement.querySelector('.right');

    this.mouseDowns$ = fromEvent(this.resizer, 'mousedown');
    


    this.mouseDownsSubscription = this.mouseDowns$.subscribe(event => {
      this.mouseMoves$ = fromEvent(this.resizer, 'mousemove');
      this.mouseUps$ = fromEvent(this.resizer, 'mouseup');
      console.log('Mouse down', event);
      this.x = event.clientX;
      this.y = event.clientY;
      this.leftWidth = this.leftSide.getBoundingClientRect().width;

      this.mouseMovesSubscription = this.mouseMoves$.subscribe(event => {
        console.log('RESIZER', this.resizer);
        console.log(this.resizer.parentElement);
        console.log(this.resizer.parentElement.getBoundingClientRect().width);
  
  
        console.log('Mouse move');
        const dx = event.clientX - this.x;
        const dy = event.clientY - this.y;
        const newLeftWidth = ((this.leftWidth + dx) * 100) / this.resizer.parentElement.getBoundingClientRect().width;
        this.leftSide.setAttribute('style', `width: ${newLeftWidth}%`);
      });

      this.mouseUpsSubscription = this.mouseUps$.subscribe(() => {
        console.log('Mouse up');
        // this.mouseDownsSubscription.unsubscribe();
        this.mouseMovesSubscription.unsubscribe();
      });
    });
  }

  public ngOnDestroy(): void {
    if (this.mouseDownsSubscription) {
      this.mouseDownsSubscription.unsubscribe();
    }
    if(this.mouseMovesSubscription) {
      this.mouseMovesSubscription.unsubscribe();
    }
    if(this.mouseUpsSubscription) {
      this.mouseUpsSubscription.unsubscribe();
    }
  }
}

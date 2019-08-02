import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[focusElement]'
})
export class FocusElementDirective implements AfterViewInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    if (this.el.nativeElement) {
      const focusElement = this.renderer.selectRootElement(this.el.nativeElement);
      if (focusElement) {
        focusElement.focus();
      }
    }
  }

}

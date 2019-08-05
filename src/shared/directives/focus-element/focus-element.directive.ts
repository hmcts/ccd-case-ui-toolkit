import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[focusElement]'
})
/**
 * Focuses the host element after the view has been initialised. Works on writable fields. If the directive is used
 * on more than one element, the last element to be initialised will be in focus.
 */
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

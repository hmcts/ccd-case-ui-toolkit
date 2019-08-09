import { AfterContentInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[focusElement]'
})
/**
 * Focuses the host element after the content of the view has been initialised. Works on writable fields. If the
 * directive is used on more than one element, the last element to be initialised will be in focus.
 * NOTE:
 * The directive focuses on the element only for the very first time when the content into the component's view, the
 * view that the directive is in is initialised. Refocusing the element will require explicit focusing for e.g. by
 * calling this directives focus() method from the host component.
 */
export class FocusElementDirective implements AfterContentInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngAfterContentInit(): void {
    this.focus();
  }

  focus(): void {
    if (this.el.nativeElement) {
      const focusElement = this.renderer.selectRootElement(this.el.nativeElement, true);
      if (focusElement) {
        focusElement.focus();
      }
    }
  }

}

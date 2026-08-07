import { Component, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { sanitiseRichTextHtml } from './rich-text-sanitizer';

@Component({
  selector: 'ccd-read-rich-text-area-field',
  template: `<div class="ccd-rich-text-area-read" [innerHTML]="sanitisedValue()"></div>`,
  styleUrls: ['./read-rich-text-area-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class ReadRichTextAreaFieldComponent extends AbstractFieldReadComponent {
  public constructor(private readonly sanitizer: DomSanitizer) {
    super();
  }

  public sanitisedValue(): string {
    const supportedHtml = sanitiseRichTextHtml(this.caseField.value || '');
    const documentElement = new DOMParser().parseFromString(supportedHtml, 'text/html');
    const indentedElements = Array.prototype.slice.call(
      documentElement.body.querySelectorAll('[data-indent]')
    ) as HTMLElement[];

    indentedElements.forEach((element) => {
      const indent = element.dataset.indent;
      element.removeAttribute('data-indent');
      element.classList.add(`ccd-rich-text-indent-${indent}`);
    });

    return this.sanitizer.sanitize(SecurityContext.HTML, documentElement.body.innerHTML) || '';
  }
}

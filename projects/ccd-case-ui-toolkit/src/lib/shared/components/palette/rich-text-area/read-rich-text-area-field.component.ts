import { Component, ViewEncapsulation } from '@angular/core';
import DOMPurify from 'dompurify';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { sanitiseRichTextHtml } from './rich-text-sanitizer';

@Component({
  selector: 'ccd-read-rich-text-area-field',
  template: '<div class="ccd-rich-text-area-read" [innerHTML]="sanitisedValue()"></div>',
  styleUrls: ['./read-rich-text-area-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class ReadRichTextAreaFieldComponent extends AbstractFieldReadComponent {
  public constructor() {
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
      delete element.dataset.indent;
      element.classList.add(`ccd-rich-text-indent-${indent}`);
    });

    return DOMPurify.sanitize(documentElement.body.innerHTML, {
      ALLOWED_ATTR: ['align', 'class', 'start', 'type'],
      ALLOWED_TAGS: ['b', 'blockquote', 'br', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'strong', 'u', 'ul']
    });
  }
}

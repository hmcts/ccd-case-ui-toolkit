import { Component, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-text-area-field',
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
    return this.sanitizer.sanitize(SecurityContext.HTML, this.caseField.value || '') || '';
  }
}

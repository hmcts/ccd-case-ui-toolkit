import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BrowserService } from '../../../services/browser/browser.service';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
    selector: 'ccd-write-text-area-field',
    templateUrl: './write-text-area-field.html',
    providers: [BrowserService],
    standalone: false
})
export class WriteTextAreaFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  public textareaControl: FormControl;

  constructor(private readonly browserService: BrowserService) {
    super();
  }

  public ngOnInit(): void {
    this.textareaControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  public autoGrow(event): void {
    if (this.browserService.isIEOrEdge()) {
      event.target.style.height = 'auto';
      event.target.style.height = `${event.target.scrollHeight}px`;
      event.target.scrollTop = event.target.scrollHeight;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormatTranslatorService } from '../../../services';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { DatePipe } from '../utils';

@Component({
  selector: 'ccd-read-date-field',
  template: '<span class="text-16">{{formattedDate}}</span>'
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public static readonly datePipe: DatePipe = new DatePipe(new FormatTranslatorService());

  public formattedDate: string;

  private get displayFormat(): string {
    if (this.caseField.display_context_parameter) {
      return this.extractFormat(this.caseField.display_context_parameter, '#DATETIMEDISPLAY');
    }
    return null;
  }

  private extractFormat(fmt: string, paramName: string, leftBracket = '(', rightBracket = ')'): string {
    fmt = fmt.split(',')
      .find(a => a.trim().startsWith(paramName));
    if (fmt) {
      const s = fmt.indexOf(leftBracket) + 1;
      const e = fmt.indexOf(rightBracket, s);
      if (e > s && s >= 0) {
        return fmt.substr(s, (e - s));
      }
    }
    return null;
  }

  public ngOnInit() {
    this.formattedDate = ReadDateFieldComponent.datePipe.transform(
      this.caseField.value,
      'utc',
      this.displayFormat
    );
  }
}

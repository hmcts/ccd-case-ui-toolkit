import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ccd-unsupported-field',
  template: `<em>Field type not supported</em>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class UnsupportedFieldComponent {}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { fieldBoundaryFields } from '../mocks/field-boundary.mock';

@Component({
  selector: 'toolkit-field-boundary-controls',
  imports: [CommonModule, PaletteModule],
  template: `
    <div *ngFor="let field of fields" [attr.data-testid]="field.id">
      <ccd-field-read [caseField]="field" />
    </div>
  `
})
export class FieldBoundaryControlsComponent {
  readonly fields = fieldBoundaryFields;
}

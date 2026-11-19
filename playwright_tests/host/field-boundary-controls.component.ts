
import { Component } from '@angular/core';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { fieldBoundaryFields } from '../mocks/field-boundary.mock';

@Component({
  selector: 'toolkit-field-boundary-controls',
  imports: [PaletteModule],
  template: `
    @for (field of fields; track field) {
      <div [attr.data-testid]="field.id">
        <ccd-field-read [caseField]="field" />
      </div>
    }
    `
})
export class FieldBoundaryControlsComponent {
  readonly fields = fieldBoundaryFields;
}

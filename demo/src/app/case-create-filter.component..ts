import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'case-create-filter',
  template: `<div class="container-fluid">
                <ccd-create-case-filters></ccd-create-case-filters>
             </div>`
})
export class CaseCreateFilterComponent {
    constructor(
    ) {}
}

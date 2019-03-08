import { Component, Input } from '@angular/core';
import { CaseViewEvent } from '../../domain';

@Component({
  selector: 'ccd-case-timeline',
  templateUrl: './case-timeline.component.html'
})
export class CaseTimelineComponent {

  @Input()
  events: CaseViewEvent[];

}

import { Component, Input } from '@angular/core';

@Component({
    selector: 'cut-phase-bar',
    templateUrl: './phase.html',
    styleUrls: ['./phase.scss']
})
export class PhaseComponent {

  @Input()
  public phaseLabel: string;

  @Input()
  public phaseLink: string;

}

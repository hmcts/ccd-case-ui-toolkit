import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'cut-phase-bar',
    templateUrl: './phase.html',
    styleUrls: ['./phase.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PhaseComponent {

  @Input()
  public phaseLabel: string;

  @Input()
  public phaseLink: string;

  @Input()
  public isSolicitor: boolean;

}

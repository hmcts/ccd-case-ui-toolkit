import { Component, Input } from '@angular/core';

@Component({
  selector: 'ccd-activity-icon',
  templateUrl: './activity-icon.component.html',
  standalone: false,
  styleUrls: ['./activity-icon.component.scss']
})
export class ActivityIconComponent {
  @Input()
  public description: string;

  @Input()
  public imageLink: string;

  constructor() { }
}

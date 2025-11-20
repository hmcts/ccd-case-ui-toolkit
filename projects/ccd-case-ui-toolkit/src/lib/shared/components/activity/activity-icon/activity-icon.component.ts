import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-activity-icon',
  templateUrl: './activity-icon.component.html',
  styleUrls: ['./activity-icon.component.css'],
  standalone: false
})
export class ActivityIconComponent implements OnInit {
  @Input()
  public description: string;

  @Input()
  public imageLink: string;

  constructor() { }

  public ngOnInit() {
  }
}

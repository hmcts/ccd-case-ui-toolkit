import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ccd-activity-banner',
  templateUrl: './activity-banner.component.html',
  styleUrls: ['./activity-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ActivityBannerComponent implements OnInit {
  @Input()
  public bannerType: string;

  @Input()
  public description: string;

  @Input()
  public imageLink: string;

  constructor() { }

  public ngOnInit() {
  }
}

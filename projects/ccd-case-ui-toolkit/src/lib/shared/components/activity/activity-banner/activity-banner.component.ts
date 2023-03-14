import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-activity-banner',
  templateUrl: './activity-banner.component.html',
  styleUrls: ['./activity-banner.component.scss']
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

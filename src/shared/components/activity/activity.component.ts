import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { Activity, ActivityInfo } from '../../domain/activity/activity.model';
import { DisplayMode } from '../../domain/activity/activity.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'ccd-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit, OnDestroy {
  private VIEWERS_PREFIX = '';
  private VIEWERS_SUFFIX = 'viewing this case';
  private EDITORS_PREFIX = 'This case is being updated by ';
  private EDITORS_SUFFIX = '';
  activity: Activity;
  dspMode = DisplayMode;

  viewersText: string;
  editorsText: string;

  subscription: Subject<Activity>;

  @Input()
  public caseId: string;

  @Input()
  displayMode: DisplayMode;

  constructor(private activityPollingService: ActivityPollingService) {}

  ngOnInit() {
    this.activity = new Activity();
    this.activity.caseId = this.caseId;
    this.activity.editors = [];
    this.activity.unknownEditors = 0;
    this.activity.viewers = [];
    this.activity.unknownViewers = 0;
    this.viewersText = '';
    this.editorsText = '';
    this.subscription = this.activityPollingService.subscribeToActivity(this.caseId, newActivity => this.onActivityChange(newActivity));
  }

  onActivityChange(newActivity: Activity) {
    this.activity = newActivity;
    this.viewersText = this.generateDescription(this.VIEWERS_PREFIX,
      this.VIEWERS_SUFFIX,
      this.activity.viewers,
      this.activity.unknownViewers);
    this.editorsText = this.generateDescription(this.EDITORS_PREFIX,
      this.EDITORS_SUFFIX,
      this.activity.editors,
      this.activity.unknownEditors);
  }

  isActivityEnabled() {
    return this.activityPollingService.isEnabled;
  }

  isActiveCase() {
    return this.activity.editors.length || this.activity.viewers.length || this.activity.unknownEditors || this.activity.unknownViewers;
  }

  viewersPresent(): boolean {
    return (this.activity.viewers.length > 0 || this.activity.unknownViewers > 0)
  }

  editorsPresent(): boolean {
    return (this.activity.editors.length > 0 || this.activity.unknownEditors > 0)
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.complete();
      this.subscription.unsubscribe();
    }

    this.activityPollingService.stopPolling();
  }

  generateDescription(prefix: string, suffix: string, namesArray: Array<ActivityInfo>, unknownCount) {
    let resultText = prefix;
    resultText += namesArray.map(activityInfo => activityInfo.forename + ' ' + activityInfo.surname).join(', ');
    if (unknownCount > 0) {
      resultText += (namesArray.length > 0 ? ' and ' + unknownCount + ' other' : unknownCount + ' user');
      resultText += ( unknownCount > 1 ? 's' : '');
    } else {
      resultText = this.replaceLastCommaWithAnd(resultText);
    }
    if (suffix.length > 0) {
      if (namesArray.length + unknownCount > 1) {
        resultText += ' are ' + suffix;
      } else {
        resultText += ' is ' + suffix;
      }
    }
    return resultText;
  }

  private replaceLastCommaWithAnd(str: String) {
    return str.replace(/(.*)\,(.*?)$/, '$1 and$2');
  }
}

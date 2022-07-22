import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Activity, ActivityInfo } from '../../domain/activity/activity.model';
import { DisplayMode } from '../../domain/activity/activity.model';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';

@Component({
  selector: 'ccd-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit, OnDestroy {
  public activity: Activity;
  public dspMode = DisplayMode;

  public viewersText: string;
  public editorsText: string;

  public subscription: Subject<Activity>;

  @Input()
  public caseId: string;

  @Input()
  public displayMode: DisplayMode;
  private readonly VIEWERS_PREFIX = '';
  private readonly VIEWERS_SUFFIX = 'viewing this case';
  private readonly EDITORS_PREFIX = 'This case is being updated by ';
  private readonly EDITORS_SUFFIX = '';

  constructor(private readonly activityPollingService: ActivityPollingService) {}

  public ngOnInit() {
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

  public onActivityChange(newActivity: Activity) {
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

  public isActivityEnabled() {
    return this.activityPollingService.isEnabled;
  }

  public isActiveCase() {
    return this.activity.editors.length || this.activity.viewers.length || this.activity.unknownEditors || this.activity.unknownViewers;
  }

  public viewersPresent(): boolean {
    return (this.activity.viewers.length > 0 || this.activity.unknownViewers > 0);
  }

  public editorsPresent(): boolean {
    return (this.activity.editors.length > 0 || this.activity.unknownEditors > 0);
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.complete();
      this.subscription.unsubscribe();
    }
    this.activityPollingService.stopPolling();
  }

  public generateDescription(prefix: string, suffix: string, namesArray: ActivityInfo[], unknownCount) {
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

  private replaceLastCommaWithAnd(str: string): string {
    return str.replace(/(.*)\,(.*?)$/, '$1 and$2');
  }
}

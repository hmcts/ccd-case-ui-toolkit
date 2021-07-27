import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { Activity, CaseActivityInfo } from '../../domain/activity';
import { ActivityPollingService, ActivityService, ActivitySocketService } from '../../services';
import { Utils, MODES } from '../../services/activity/utils';

interface ActivityDetails {
  viewers: string;
  editors: string;
}

@Component({
  selector: 'ccd-case-activity',
  templateUrl: './case-activity.component.html',
  styleUrls: ['./case-activity.component.scss']
})
export class CaseActivityComponent implements OnInit, OnDestroy {
  @Input() public caseId: string;
  @Input() public iconOnly: boolean;

  private pActivity: ActivityDetails;
  public get activity(): ActivityDetails {
    return this.pActivity;
  }

  private modeSubscription: Subscription;
  private pollingSubject: Subject<Activity>;
  private socketSubscription: Subscription;

  constructor(
    private readonly activityService: ActivityService,
    private readonly polling: ActivityPollingService,
    private readonly socket: ActivitySocketService
  ) {}

  public ngOnInit(): void {
    this.modeSubscription = this.activityService.modeSubject
      .pipe(filter(mode => !!mode))
      .pipe(distinctUntilChanged())
      .subscribe(mode => {
        this.destroy();
        if (mode === MODES.polling) {
          this.initPolling();
        } else if (ActivitySocketService.SOCKET_MODES.indexOf(mode) > -1) {
          this.initSocket();
        }
      });
  }

  public ngOnDestroy(): void {
    if (this.modeSubscription) {
      this.modeSubscription.unsubscribe();
      this.modeSubscription = undefined;
    }
    this.destroy();
  }

  private initPolling(): void {
    this.pollingSubject = this.polling.subscribeToActivity(this.caseId, (activity: Activity) => {
      this.handleActivity(activity);
    });
  }

  private initSocket(): void {
    this.socketSubscription = this.socket.activity.subscribe(activity => {
      if (Array.isArray(activity)) {
        const thisCase: CaseActivityInfo = activity.find(item => item.caseId === this.caseId);
        // Only do something if this update is one we care about - i.e., it's the current case.
        if (thisCase) {
          this.handleActivity(Utils.activity.stripUserFromActivity(thisCase, this.socket.user));
        }
      } else {
        this.handleActivity(undefined);
      }
    });
  }

  private destroy(): void {
    this.destroyPolling();
    this.destroySocket();
  }

  private destroyPolling(): void {
    if (this.pollingSubject) {
      this.pollingSubject.complete();
      this.pollingSubject.unsubscribe();
      this.pollingSubject = undefined;
      this.polling.stopPolling();
    }
  }

  private destroySocket(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
      this.socketSubscription = undefined;
    }
  }

  private handleActivity(activity: Activity | CaseActivityInfo): void {
    if (Utils.activity.hasViewersOrEditors(activity)) {
      this.pActivity = {
        viewers: Utils.activity.viewersDescription(activity),
        editors: Utils.activity.editorsDescription(activity)
      };
    } else {
      this.pActivity = undefined;
    }
  }
}

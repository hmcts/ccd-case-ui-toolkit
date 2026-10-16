import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';
import { ProfileNotifier } from '../../../shared/services/profile/profile.notifier';
import { ProfileService } from '../../../shared/services/profile/profile.service';

@Component({
  selector: 'cut-header-bar',
  templateUrl: './header-bar.html',
  styleUrls: ['./header-bar.scss'],
  standalone: false
})
export class HeaderBarComponent {

  constructor(
    @Optional() private readonly profileService: ProfileService,
    @Optional() private readonly profileNotifier: ProfileNotifier
  ) {}

  @Input()
  public title: string;

  @Input()
  public isSolicitor: boolean;

  @Input()
  public username: string;

  @Output()
  private readonly signOutRequest: EventEmitter<any> = new EventEmitter();

  public signOut() {
    this.profileService?.clearProfileCache();
    this.profileNotifier?.clearProfile();
    this.signOutRequest.emit();
  }
}

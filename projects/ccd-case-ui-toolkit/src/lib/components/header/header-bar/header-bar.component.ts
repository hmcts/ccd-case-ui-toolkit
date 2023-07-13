import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cut-header-bar',
  templateUrl: './header-bar.html',
  styleUrls: ['./header-bar.scss']
})
export class HeaderBarComponent {

  @Input()
  public title: string;

  @Input()
  public isSolicitor: boolean;

  @Input()
  public username: string;

  @Output()
  private readonly signOutRequest: EventEmitter<any> = new EventEmitter();

  public signOut() {
    this.signOutRequest.emit();
  }
}

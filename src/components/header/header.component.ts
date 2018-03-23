import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'cut-header-bar',
    templateUrl: './header.html',
    styleUrls: ['./header.scss']
})
export class HeaderComponent {

  @Input()
  public title: string;

  @Input()
  public username: string;

  @Output()
  private signOutRequest: EventEmitter<any> = new EventEmitter();

  public signOut() {
    this.signOutRequest.emit();
  }
}

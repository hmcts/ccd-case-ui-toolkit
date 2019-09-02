import { Component, OnInit } from '@angular/core';
import { NavigationListenerService } from './navigation-listener.service';

@Component({
  selector: 'core-app',
  templateUrl: './core.component.html',
  styleUrls: ['./navigation.scss']
})
export class CoreComponent implements OnInit {

  constructor(private navigationListenerService: NavigationListenerService) {}

  ngOnInit() {
    this.navigationListenerService.init();
  }
}

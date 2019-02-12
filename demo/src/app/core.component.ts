import { Component } from '@angular/core';

@Component({
  selector: 'core-app',
  template: `<div class="global-navigation">
                <div class="nav-left">
                    <ul id="menu-links-left">
                        <li>
                        <a [routerLink]="'/case/create'" [routerLinkActive]="'item-bold'">Create Case</a>
                        </li>
                        <li>
                        <a [routerLink]="'/case/progress'" [routerLinkActive]="'item-bold'">Progress Case</a>
                        </li>
                        <li>
                        <a [routerLink]="'/case'" [routerLinkActive]="'item-bold'">View Case</a>
                        </li>
                    </ul>
                </div>
            </div>
            <router-outlet></router-outlet>`,
  styleUrls: ['./navigation.scss']
})
export class CoreComponent {
}

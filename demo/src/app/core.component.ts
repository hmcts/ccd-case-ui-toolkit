import { Component } from '@angular/core';

@Component({
  selector: 'core-app',
  template: `<div>
                <ul id="proposition-links">
                    <li>
                    <a [routerLink]="'/case/create'">Create Case</a>
                    </li>
                    <li>
                    <a [routerLink]="'/case/progress'">Progress Case</a>
                    </li>
                </ul>
            </div>
            <router-outlet></router-outlet>`
})
export class CoreComponent {
}

import { Component, Input } from '@angular/core';
import '../../style/app.scss';

@Component({
    selector: 'event-details',
    templateUrl: './eventDetails.component.html'
})
export class EventDetails {
    @Input()
    messages:string[];
}

import { Component } from "@angular/core";

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent { 

  public flagTypeSelected: string;
  public otherFlagTypeClass = 'hidden';

  public onFlagTypeChanged(event: any): void {
    this.flagTypeSelected = event.target.value;
    console.log(this.flagTypeSelected);
    this.otherFlagTypeClass = this.flagTypeSelected === 'others' ? '' : 'hidden';
  }
}

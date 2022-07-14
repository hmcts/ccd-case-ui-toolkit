import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseViewTrigger } from '../../domain';
import { OrderService } from '../../services';

@Component({
  selector: 'ccd-event-trigger',
  templateUrl: './event-trigger.component.html',
  styleUrls: ['./event-trigger.component.scss']
})
export class EventTriggerComponent implements OnChanges {

  @Input()
  public triggers: CaseViewTrigger[];

  @Input()
  public triggerText: string;

  @Input()
  public isDisabled: boolean;

  @Output()
  public onTriggerSubmit: EventEmitter<CaseViewTrigger> = new EventEmitter();

  @Output()
  public onTriggerChange: EventEmitter<any> = new EventEmitter();

  public triggerForm: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly orderService: OrderService) {}

  public ngOnChanges(changes?: SimpleChanges): void {
    if (changes.triggers && changes.triggers.currentValue) {
      this.triggers = this.orderService.sort(this.triggers);

      this.triggerForm = this.fb.group({
        trigger: [this.getDefault(), Validators.required]
      });
    }
  }

  public isButtonDisabled(): boolean {
    return !this.triggerForm.valid || this.isDisabled;
  }

  public triggerSubmit() {
    this.onTriggerSubmit.emit(this.triggerForm.value['trigger']);
  }

  public triggerChange() {
    this.onTriggerChange.emit(null);
  }

  private getDefault(): any {
    return this.triggers.length === 1 ? this.triggers[0] : '';
  }
}

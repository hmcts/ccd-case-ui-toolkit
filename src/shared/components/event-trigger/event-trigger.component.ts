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
  triggers: CaseViewTrigger[];

  @Input()
  triggerText: string;

  @Input()
  isDisabled: boolean;

  @Output()
  onTriggerSubmit: EventEmitter<CaseViewTrigger> = new EventEmitter();

  @Output()
  onTriggerChange: EventEmitter<any> = new EventEmitter();

  triggerForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) {}

  ngOnChanges(changes?: SimpleChanges): void {
    if (changes.triggers) {
      this.triggers = this.orderService.sort(this.triggers);

      this.triggerForm = this.fb.group({
        'trigger': [this.getDefault(), Validators.required]
      });
    }
  }

  isButtonDisabled(): boolean {
    return !this.triggerForm.valid || this.isDisabled;
  }

  private getDefault(): any {
    return this.triggers.length === 1 ? this.triggers[0] : '';
  }

  triggerSubmit() {
    this.onTriggerSubmit.emit(this.triggerForm.value['trigger']);
  }

  triggerChange() {
    this.onTriggerChange.next(null);
  }

}

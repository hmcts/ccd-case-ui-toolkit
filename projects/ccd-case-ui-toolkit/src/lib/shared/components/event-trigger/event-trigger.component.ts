import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseViewTrigger } from '../../domain/case-view/case-view-trigger.model';
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'ccd-event-trigger',
  templateUrl: './event-trigger.component.html',
  styleUrls: ['./event-trigger.component.scss']
})
export class EventTriggerComponent implements OnChanges, OnInit {

  @Input()
  public triggers: CaseViewTrigger[];

  @Input()
  public triggerText: string;

  @Input()
  public isDisabled: boolean;

  @Input()
  public eventId:  string = '';

  @Output()
  public onTriggerSubmit: EventEmitter<CaseViewTrigger> = new EventEmitter();

  @Output()
  public onTriggerChange: EventEmitter<any> = new EventEmitter();

  public triggerForm: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly orderService: OrderService) { }

  public ngOnInit(): void {
    this.triggers = this.orderService.sort(this.triggers);
   if(this.eventId){
    const eventBundle = this.triggers.find(ev => ev.id === this.eventId);
      this.triggerForm.controls['trigger'].patchValue(
        {id : eventBundle.id, name: eventBundle.name, description: eventBundle.description}
     )
   } 
  
  }
  public ngOnChanges(changes?: SimpleChanges): void {
    if (changes.triggers && changes.triggers.currentValue) {
      this.triggerForm = this.fb.group({
        trigger: [this.getDefault(), Validators.required]
      });
    }
  }

  compareFn(c1: any, c2:any): boolean {     
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
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

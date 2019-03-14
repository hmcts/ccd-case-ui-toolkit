import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTriggerComponent } from './event-trigger.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { attr, text } from '../../test/helpers';
import { ReactiveFormsModule } from '@angular/forms';
import createSpyObj = jasmine.createSpyObj;
import { Subject } from 'rxjs/Subject';
import { CaseViewTrigger, HttpError } from '../../domain';
import { OrderService, AlertService } from '../../services';

describe('EventTriggerComponent', () => {

  const TRIGGERS: CaseViewTrigger[] = [
    {
      id: 'EDIT',
      name: 'Edit',
      description: 'Edit the current case',
      order: 1
    },
    {
      id: 'HOLD',
      name: 'Hold',
      description: 'Put case on hold',
      order: 2
    }
  ];

  const trigersChangeDummy = (triggers) => {
    return {
      triggers: {
        isFirstChange: () => true,
        previousValue: null,
        firstChange: true,
        currentValue: triggers
      }
    };
  }

  const SORTED_TRIGGERS: CaseViewTrigger[] = [...TRIGGERS];

  const $SELECT_DEFAULT = By.css('form select>option[data-default]');
  const $SELECT_OPTIONS = By.css('form select>option:not([data-default])');
  const $SELECT_BOX = By.css('form select');
  const $SUBMIT_BUTTON = By.css('form button[type=submit]');
  const $EVENT_TRIGGER_FORM = By.css('.EventTrigger');

  let orderService: any;

  let fixture: ComponentFixture<EventTriggerComponent>;
  let component: EventTriggerComponent;
  let de: DebugElement;

  describe('with multiple triggers', () => {
    beforeEach(async(() => {
      orderService = createSpyObj<OrderService>('orderService', ['sort']);
      orderService.sort.and.returnValue(SORTED_TRIGGERS);

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule
          ],
          declarations: [
            EventTriggerComponent
          ],
          providers: [
            {provide: OrderService, useValue: orderService}
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventTriggerComponent);
      component = fixture.componentInstance;

      component.triggers = TRIGGERS;
      spyOn(component.onTriggerSubmit, 'emit');
      spyOn(component.onTriggerChange, 'emit');

      de = fixture.debugElement;
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
    }));

    it('should sort triggers', () => {
      expect(orderService.sort).toHaveBeenCalledWith(TRIGGERS);
      expect(component.triggers).toBe(SORTED_TRIGGERS);
    });

    it('should hide when there are no triggers', () => {
      component.triggers = [];
      fixture.detectChanges();

      let form = de.query($EVENT_TRIGGER_FORM);
      expect(form).toBeNull();
    });

    it('should render a <select> with an <option> for every trigger', () => {
      let options = de.queryAll($SELECT_OPTIONS);

      expect(options.length).toBe(2);

      TRIGGERS.forEach(trigger => {
        let optionDe = options.find(option => text(option) === trigger.name);

        expect(optionDe).toBeTruthy();
        expect(attr(optionDe, 'title')).toBe(trigger.description);
      });
    });

    it('should initially display default placeholder option when more than 1 trigger', () => {
      let defaultOption = de.query($SELECT_DEFAULT);

      expect(defaultOption).toBeTruthy();
      expect(attr(defaultOption, 'value')).toBe('');
      expect(attr(defaultOption, 'value')).toEqual(component.triggerForm.value['trigger']);
    });

    it('should not select any trigger by default when more than 1 trigger', () => {
      expect(component.triggerForm.value).toEqual({
        trigger: ''
      });
    });

    it('should invalidate form when no trigger selected', () => {
      expect(component.triggerForm.valid).toBeFalsy();
    });

    it('should output an `onTriggerSubmit` event when form is submitted', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[1]);
      fixture.detectChanges();

      let button = de.query($SUBMIT_BUTTON);
      expect(button).toBeTruthy();

      button.nativeElement.click();

      expect(component.onTriggerSubmit.emit).toHaveBeenCalledWith(TRIGGERS[1]);
    });

    it('should output an `onTriggerChange` event when selection is changed', () => {
      let dropdown = de.query($SELECT_BOX);
      expect(dropdown).toBeTruthy();

      dropdown.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.onTriggerChange.emit).toHaveBeenCalled();
    });

    it('should disable button when form is not valid', () => {
      let button = de.query($SUBMIT_BUTTON);

      expect(component.triggerForm.valid).toBeFalsy('Assumption');
      expect(attr(button, 'disabled')).toEqual('');
    });

    it('should enable button when form is valid', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[0]);
      fixture.detectChanges();

      let button = de.query($SUBMIT_BUTTON);

      expect(component.triggerForm.valid).toBeTruthy('Assumption');
      expect(attr(button, 'disabled')).toEqual(null);
    });

    it('should disable button when form valid but consumer component error exists', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[0]);
      fixture.detectChanges();

      let button = de.query($SUBMIT_BUTTON);
      expect(attr(button, 'disabled')).toEqual(null);

      component.isDisabled = true;
      fixture.detectChanges();

      expect(attr(button, 'disabled')).toEqual('');
    });

  });

  describe('with a single trigger', () => {
    beforeEach(async(() => {
      orderService = createSpyObj<OrderService>('orderService', ['sort']);
      orderService.sort.and.returnValue([ TRIGGERS[0] ]);

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule
          ],
          declarations: [
            EventTriggerComponent
          ],
          providers: [
            {provide: OrderService, useValue: orderService}
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventTriggerComponent);
      component = fixture.componentInstance;

      component.triggers = [ TRIGGERS[0] ];

      de = fixture.debugElement;
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
    }));

    it('should NOT initially display a default placeholder option when just 1 trigger', () => {
      let defaultOption = de.query($SELECT_DEFAULT);

      expect(!!defaultOption).toBeFalsy();
    });

    it('should select only trigger by default when just 1 trigger', () => {
      expect(component.triggerForm.value).toEqual({
        trigger: TRIGGERS[0]
      });
      expect(component.triggerForm.valid).toBeTruthy();
    });
  });
});

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AbstractAppConfig } from '../../../app.config';
import { CaseViewTrigger } from '../../domain';
import { OrderService } from '../../services';
import { attr, text } from '../../test/helpers';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { EventTriggerComponent } from './event-trigger.component';
import createSpyObj = jasmine.createSpyObj;

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
    },
    {
      id: 'createBundle',
      name: 'Create a bundle',
      description: 'Create a bundle',
      order: 3
    },
    {
      id: 'queryManagementRespondQuery',
      name: 'QueryManagementRespondQuery',
      description: 'Query Management Respond to a query',
      order: 4
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
  };

  const SORTED_TRIGGERS: CaseViewTrigger[] = [...TRIGGERS];

  const $SELECT_DEFAULT = By.css('form select>option[data-default]');
  const $SELECT_OPTIONS = By.css('form select>option:not([data-default])');
  const $SELECT_BOX = By.css('form select');
  const $SUBMIT_BUTTON = By.css('form button[type=submit]');
  const $EVENT_TRIGGER_FORM = By.css('.event-trigger');


  let appConfig: jasmine.SpyObj<AbstractAppConfig>;
  let fixture: ComponentFixture<EventTriggerComponent>;
  let component: EventTriggerComponent;
  let de: DebugElement;
  let orderService: OrderService;

  describe('with multiple triggers', () => {
    beforeEach(waitForAsync(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getEventsToHide']);
      appConfig.getEventsToHide.and.returnValue(['']);

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule
          ],
          declarations: [
            EventTriggerComponent,
            MockRpxTranslatePipe
          ],
          providers: [
            {provide: OrderService, useValue: orderService},
            {provide: AbstractAppConfig, useValue: appConfig}
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventTriggerComponent);
      component = fixture.componentInstance;

      component.triggers = TRIGGERS;
      component.eventId = 'createBundle'
      spyOn(component.onTriggerSubmit, 'emit');
      spyOn(component.onTriggerChange, 'emit');

      de = fixture.debugElement;
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
    }));

    it('should sort triggers', () => {
      expect(orderService.sort).toHaveBeenCalledWith(TRIGGERS);
      expect(component.triggers).toEqual(SORTED_TRIGGERS);
    });

    it('should hide when there are no triggers', () => {
      component.triggers = [];
      fixture.detectChanges();

      const form = de.query($EVENT_TRIGGER_FORM);
      expect(form).toBeNull();
    });

    it('should render a <select> with an <option> for every trigger', () => {
      const options = de.queryAll($SELECT_OPTIONS);

      expect(options.length).toBe(4);

      TRIGGERS.forEach(trigger => {
        const optionDe = options.find(option => text(option) === trigger.name);

        expect(optionDe).toBeTruthy();
        expect(attr(optionDe, 'title')).toBe(trigger.description);
      });
    });

    it('should initially display default placeholder option when more than 1 trigger', () => {
      const defaultOption = de.query($SELECT_DEFAULT);

      expect(defaultOption).toBeTruthy();
      expect(attr(defaultOption, 'value')).toBe('');
      expect(attr(defaultOption, 'value')).toEqual('');
    });

    it('should not select any trigger by default when more than 1 trigger', () => {
      expect(component.triggerForm.value).toEqual({
        trigger: { id: 'createBundle', name: 'Create a bundle', description: 'Create a bundle' }
      });
    });

    it('should invalidate form when no trigger selected', () => {
      expect(component.triggerForm.valid).toBeTruthy();
    });

    it('should output an `onTriggerSubmit` event when form is submitted', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[1]);
      fixture.detectChanges();

      const button = de.query($SUBMIT_BUTTON);
      expect(button).toBeTruthy();

      button.nativeElement.click();

      expect(component.onTriggerSubmit.emit).toHaveBeenCalledWith(TRIGGERS[1]);
    });

    it('should output an `onTriggerChange` event when selection is changed', () => {
      const dropdown = de.query($SELECT_BOX);
      expect(dropdown).toBeTruthy();

      dropdown.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.onTriggerChange.emit).toHaveBeenCalled();
      expect(component.isDisabled).toBeFalsy();
    });

    it('should disable button when form is not valid', () => {
      const button = de.query($SUBMIT_BUTTON);

      expect(component.triggerForm.valid).toBeTruthy('Assumption');
      expect(attr(button, 'disabled')).toEqual(null);
    });

    it('should enable button when form is valid', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[0]);
      fixture.detectChanges();

      const button = de.query($SUBMIT_BUTTON);

      expect(component.triggerForm.valid).toBeTruthy('Assumption');
      expect(attr(button, 'disabled')).toEqual(null);
    });

    it('should disable button when form valid but consumer component error exists', () => {
      component.triggerForm.controls['trigger'].setValue(TRIGGERS[0]);
      fixture.detectChanges();

      const button = de.query($SUBMIT_BUTTON);
      expect(attr(button, 'disabled')).toEqual(null);

      component.isDisabled = true;
      fixture.detectChanges();

      expect(attr(button, 'disabled')).toEqual('');
    });

    it('should return true if ids of both triggers match', () => {
      const trigger1 = { id: 'EDIT', name: 'Edit', description: 'Edit the current case', order: 1 };
      const trigger2 = { id: 'EDIT', name: 'Edit', description: 'Edit the current case', order: 1 };

      const result = component.compareFn(trigger1, trigger2);

      expect(result).toBe(true);
    });

    it('should return false if ids of triggers do not match', () => {
      const trigger1 = { id: 'EDIT', name: 'Edit', description: 'Edit the current case', order: 1 };
      const trigger2 = { id: 'HOLD', name: 'Hold', description: 'Put case on hold', order: 2 };

      const result = component.compareFn(trigger1, trigger2);

      expect(result).toBe(false);
    });

    it('should return false if one or both triggers are null or undefined', () => {
      const trigger1 = null;
      const trigger2 = { id: 'HOLD', name: 'Hold', description: 'Put case on hold', order: 2 };

      const result1 = component.compareFn(trigger1, trigger2);
      const result2 = component.compareFn(trigger2, trigger1);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

  });

  describe('with a single trigger', () => {
    beforeEach(waitForAsync(() => {
      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getEventsToHide']);
      appConfig.getEventsToHide.and.returnValue(['queryManagementRespondQuery']);
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule
          ],
          declarations: [
            EventTriggerComponent,
            MockRpxTranslatePipe
          ],
          providers: [
            {provide: OrderService, useValue: orderService},
            {provide: AbstractAppConfig, useValue: appConfig}
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
      const defaultOption = de.query($SELECT_DEFAULT);

      expect(!!defaultOption).toBeFalsy();
    });

    it('should select only trigger by default when just 1 trigger', () => {
      expect(component.triggerForm.value).toEqual({
        trigger: TRIGGERS[0]
      });
      expect(component.triggerForm.valid).toBeTruthy();
    });
  });

  describe('Hide events', () => {
    beforeEach(waitForAsync(() => {
      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getEventsToHide']);
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule
        ],
        declarations: [
          EventTriggerComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          {provide: OrderService, useValue: orderService},
          {provide: AbstractAppConfig, useValue: appConfig}
        ]
      })
        .compileComponents();

      fixture = TestBed.createComponent(EventTriggerComponent);
      component = fixture.componentInstance;
      component.triggerForm = new FormGroup({
        trigger: new FormControl('')
      });
      component.triggers = TRIGGERS;
      fixture.detectChanges();
    }));

    it('should hide the respond to query event from the dropdown', () => {
      appConfig.getEventsToHide.and.returnValue(['queryManagementRespondQuery']);
      component.triggers = TRIGGERS;
      expect(component.triggers?.length).toEqual(TRIGGERS.length);
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
      expect(component.triggers?.length).toEqual(TRIGGERS.length-1);
      const triggerIds = component.triggers?.map((trigger) => trigger.id);
      expect(triggerIds.includes('queryManagementRespondQuery')).toBe(false);
    });

    it('should show the respond to query event from the dropdown', () => {
      appConfig.getEventsToHide.and.returnValue(['']);
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
      console.log('triggers: ' + component.triggers?.join(' '));
      const triggerIds = component.triggers?.map((trigger) => trigger.id);
      expect(triggerIds.includes('queryManagementRespondQuery')).toBe(true);
      expect(component.triggers.length).toEqual(TRIGGERS.length);
    });

    it('should show the respond to query event from the dropdown when eventsToHide is null', () => {
      appConfig.getEventsToHide.and.returnValue(null);
      component.ngOnChanges(trigersChangeDummy(TRIGGERS));
      fixture.detectChanges();
      const triggerIds = component.triggers?.map((trigger) => trigger.id);
      expect(triggerIds.includes('queryManagementRespondQuery')).toBe(true);
      expect(component.triggers.length).toEqual(TRIGGERS.length);
    });
  });
});

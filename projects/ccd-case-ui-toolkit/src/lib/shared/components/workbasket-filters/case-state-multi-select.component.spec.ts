import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { CaseState } from '../../domain/definition/case-state.model';
import { CaseStateMultiSelectComponent } from './case-state-multi-select.component';

describe('CaseStateMultiSelectComponent', () => {
  let fixture: ComponentFixture<CaseStateMultiSelectComponent>;
  let component: CaseStateMultiSelectComponent;

  const states: CaseState[] = [
    { id: 'S1', name: 'State 1', description: '' },
    { id: 'S2', name: 'State 2', description: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseStateMultiSelectComponent, MockRpxTranslatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStateMultiSelectComponent);
    component = fixture.componentInstance;
    component.states = states;
    fixture.detectChanges();
  });

  it('displays Any for an empty selection', () => {
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement;

    expect(trigger.textContent).toContain('Any');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses a labelled fieldset for the state selection actions', () => {
    const actions = fixture.debugElement.query(By.css('fieldset.case-state-multi-select__actions')).nativeElement as HTMLFieldSetElement;
    const legend = actions.querySelector('legend');

    expect(legend?.textContent).toContain('State selection actions');
    expect(actions.getAttribute('role')).toBeNull();
  });

  it('keeps the panel open and emits each selected state', () => {
    const emitted: CaseState[][] = [];
    component.selectedStatesChange.subscribe(selection => {
      emitted.push(selection);
      component.selectedStates = selection;
    });
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement;
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-controls')).toBe('wb-case-state-options');

    const inputs = fixture.debugElement.queryAll(By.css('#wb-case-state-options input[type="checkbox"]'));
    inputs[0].nativeElement.click();
    fixture.detectChanges();
    inputs[1].nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#wb-case-state-options'))).toBeTruthy();
    expect(emitted.map(selection => selection.map(state => state.id))).toEqual([['S1'], ['S1', 'S2']]);
    expect(inputs[0].nativeElement.checked).toBeTrue();
    expect(inputs[1].nativeElement.checked).toBeTrue();

    inputs[0].nativeElement.click();
    fixture.detectChanges();

    expect(emitted[2].map(state => state.id)).toEqual(['S2']);
    expect(inputs[0].nativeElement.checked).toBeFalse();
  });

  it('selects all states and disables Select All', () => {
    const emitted: CaseState[][] = [];
    component.selectedStatesChange.subscribe(selection => {
      emitted.push(selection);
      component.selectedStates = selection;
    });

    const selectAllButton = fixture.debugElement.query(By.css('#wb-case-state-select-all')).nativeElement as HTMLButtonElement;
    const unselectAllButton = fixture.debugElement.query(By.css('#wb-case-state-unselect-all')).nativeElement as HTMLButtonElement;

    expect(selectAllButton.disabled).toBeFalse();
    expect(unselectAllButton.disabled).toBeTrue();

    selectAllButton.click();
    fixture.detectChanges();

    expect(emitted.map(selection => selection.map(state => state.id))).toEqual([['S1', 'S2']]);
    expect(component.selectedLabel).toBe('2 selected');
    expect(selectAllButton.disabled).toBeTrue();
    expect(unselectAllButton.disabled).toBeFalse();
  });

  it('unselects all states and returns the trigger to Any', () => {
    component.selectedStates = states;
    fixture.detectChanges();
    const emitted: CaseState[][] = [];
    component.selectedStatesChange.subscribe(selection => {
      emitted.push(selection);
      component.selectedStates = selection;
    });

    const selectAllButton = fixture.debugElement.query(By.css('#wb-case-state-select-all')).nativeElement as HTMLButtonElement;
    const unselectAllButton = fixture.debugElement.query(By.css('#wb-case-state-unselect-all')).nativeElement as HTMLButtonElement;
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement as HTMLButtonElement;

    expect(selectAllButton.disabled).toBeTrue();
    expect(unselectAllButton.disabled).toBeFalse();

    unselectAllButton.click();
    fixture.detectChanges();

    expect(emitted).toEqual([[]]);
    expect(trigger.textContent).toContain('Any');
    expect(selectAllButton.disabled).toBeFalse();
    expect(unselectAllButton.disabled).toBeTrue();
  });

  it('selects a state when its label is clicked and keeps the panel open', () => {
    const emitted: CaseState[][] = [];
    component.selectedStatesChange.subscribe(selection => {
      emitted.push(selection);
      component.selectedStates = selection;
    });

    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement;
    trigger.click();
    fixture.detectChanges();
    trigger.focus();

    const label = fixture.debugElement.query(By.css('label[for="wb-case-state-S1"]')).nativeElement;
    label.click();
    fixture.detectChanges();

    expect(emitted.map(selection => selection.map(state => state.id))).toEqual([['S1']]);
    expect(component.isSelected(states[0])).toBeTrue();
    expect(fixture.debugElement.query(By.css('#wb-case-state-options'))).toBeTruthy();
  });

  it('keeps the panel open when a real pointer click starts on a label', () => {
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    trigger.focus();

    const label = fixture.debugElement.query(By.css('label[for="wb-case-state-S1"]')).nativeElement as HTMLLabelElement;
    label.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#wb-case-state-options'))).toBeTruthy();
  });

  it('closes immediately when focus moves outside the control', () => {
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    trigger.focus();

    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#wb-case-state-options'))).toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const trigger = fixture.debugElement.query(By.css('#wb-case-state')).nativeElement;
    trigger.click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#wb-case-state-options'))).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('does not open when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    fixture.debugElement.query(By.css('#wb-case-state')).nativeElement.click();

    expect(component.isOpen).toBeFalse();
    expect((fixture.debugElement.query(By.css('#wb-case-state-select-all')).nativeElement as HTMLButtonElement).disabled).toBeTrue();
    expect((fixture.debugElement.query(By.css('#wb-case-state-unselect-all')).nativeElement as HTMLButtonElement).disabled).toBeTrue();
  });
});

import { ElementRef, Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CaseState } from '../../domain/definition/case-state.model';

@Component({
  selector: 'ccd-case-state-multi-select',
  templateUrl: './case-state-multi-select.component.html',
  styleUrls: ['./case-state-multi-select.component.scss'],
  standalone: false
})
export class CaseStateMultiSelectComponent {
  @Input()
  public states: CaseState[] = [];

  @Input()
  public selectedStates: CaseState[] = [];

  @Input()
  public disabled = false;

  @Output()
  public selectedStatesChange = new EventEmitter<CaseState[]>();

  @ViewChild('trigger')
  public trigger: ElementRef<HTMLButtonElement>;

  @ViewChild('optionsPanel')
  public optionsPanel: ElementRef<HTMLElement>;

  public isOpen = false;

  public readonly controlId = 'wb-case-state';
  public readonly optionsId = 'wb-case-state-options';

  private pointerDownInside = false;

  public togglePanel(event?: Event): void {
    event?.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
  }

  public closePanel(returnFocus = false): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    if (returnFocus) {
      this.trigger?.nativeElement.focus();
    }
  }

  public isSelected(state: CaseState): boolean {
    return (this.selectedStates || []).some(selectedState => selectedState.id === state.id);
  }

  public selectState(state: CaseState, event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const selectedStates = (this.selectedStates || []).filter(selectedState => selectedState.id !== state.id);
    if (input.checked) {
      selectedStates.push(state);
    }
    this.selectedStatesChange.emit(selectedStates);
  }

  public selectAll(event: Event): void {
    event.stopPropagation();
    this.selectedStatesChange.emit([...this.states]);
  }

  public unselectAll(event: Event): void {
    event.stopPropagation();
    this.selectedStatesChange.emit([]);
  }

  public get isSelectAllDisabled(): boolean {
    return this.disabled || this.states.every(state => this.isSelected(state));
  }

  public get isUnselectAllDisabled(): boolean {
    return this.disabled || this.states.length === 0 || (this.selectedStates || []).length === 0;
  }

  public get selectedLabel(): string {
    const selectedCount = (this.selectedStates || []).length;
    if (selectedCount === 0) {
      return 'Any';
    }
    if (selectedCount === 1) {
      return this.selectedStates[0].name;
    }
    return `${selectedCount} selected`;
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (this.isOpen && !this.isInteractiveTarget(event.target)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.closePanel(true);
  }

  @HostListener('pointerdown', ['$event'])
  public onPointerDown(event: PointerEvent): void {
    this.pointerDownInside = this.isOpen && this.isInteractiveTarget(event.target);
  }

  @HostListener('document:pointerup')
  public onDocumentPointerUp(): void {
    this.pointerDownInside = false;
  }

  @HostListener('focusout', ['$event'])
  public onFocusOut(event: FocusEvent): void {
    const nextFocusedElement = event.relatedTarget as Node;
    if (!nextFocusedElement || !this.elementRef.nativeElement.contains(nextFocusedElement)) {
      if (this.pointerDownInside) {
        return;
      }
      this.closePanel();
    }
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }

    if (this.trigger?.nativeElement.contains(target) || this.optionsPanel?.nativeElement.contains(target)) {
      return true;
    }

    const actionButtons = this.elementRef.nativeElement.querySelectorAll('.case-state-multi-select__actions button');
    return Array.from(actionButtons).some(button => button.contains(target));
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}
}

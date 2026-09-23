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

  public isOpen = false;

  public readonly controlId = 'wb-case-state';
  public readonly optionsId = 'wb-case-state-options';

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
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.closePanel(true);
  }

  @HostListener('focusout', ['$event'])
  public onFocusOut(event: FocusEvent): void {
    const nextFocusedElement = event.relatedTarget as Node;
    if (!nextFocusedElement || !this.elementRef.nativeElement.contains(nextFocusedElement)) {
      this.closePanel();
    }
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}
}

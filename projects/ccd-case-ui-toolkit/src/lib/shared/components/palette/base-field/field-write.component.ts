import { Component, ComponentFactoryResolver, ComponentRef, Injector, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { CaseField } from '../../../domain/definition';
import { FormValidatorsService } from '../../../services/form';
import { PaletteService } from '../palette.service';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';

const FIX_CASEFIELD_FOR = ['FixedList', 'DynamicList', 'DynamicMultiSelectList'];

@Component({
  selector: 'ccd-field-write',
  templateUrl: './field-write.component.html',
  styleUrls: ['./field-write.component.scss'],
  standalone: false
})
export class FieldWriteComponent extends AbstractFieldWriteComponent implements OnInit, OnChanges {

  // EUI-3267. Flag for whether or not this can have a grey bar.
  public canHaveGreyBar = false;

  @Input()
  public caseFields: CaseField[] = [];

  @ViewChild('fieldContainer', { static: true, read: ViewContainerRef })
  public fieldContainer: ViewContainerRef;
  private componentRef: ComponentRef<any>;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly paletteService: PaletteService) {
    super();
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    FormValidatorsService.addValidators(caseField, control);
  }

  public ngOnInit(): void {
    const componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);

    const injector = Injector.create([], this.fieldContainer.parentInjector);
    this.componentRef = this.resolver.resolveComponentFactory(componentClass).create(injector);

    // Only Fixed list use plainToClassFromExist
    // Better performance
    // TODO AW 30/12/20 figure out why FixedLists need plainToClassFromExist
    // Added a check to make sure it's NOT already a CaseField and then
    // assigning it back to this.caseField so we don't create separation.
    if (FIX_CASEFIELD_FOR.indexOf(this.caseField.field_type.type) > -1 && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
    this.applyInputsToChild();
    if (this.caseField.field_type.id === 'AddressGlobal') {
      this.componentRef.instance['ignoreMandatory'] = true;
    }
    this.fieldContainer.insert(this.componentRef.hostView);

    // EUI-3267.
    // Set up the flag for whether this can have a grey bar.
    this.canHaveGreyBar = this.caseField.show_condition && this.caseField.field_type.type !== 'Collection';
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.componentRef && (changes.caseField || changes.caseFields || changes.formGroup || changes.parent || changes.idPrefix
      || changes.isExpanded || changes.isInSearchBlock)) {
      this.applyInputsToChild();
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  private applyInputsToChild(): void {
    if (!this.componentRef) {
      return;
    }
    this.componentRef.instance['caseField'] = this.caseField;
    this.componentRef.instance['caseFields'] = this.caseFields;
    this.componentRef.instance['formGroup'] = this.formGroup;
    this.componentRef.instance['parent'] = this.parent;
    this.componentRef.instance['idPrefix'] = this.idPrefix;
    this.componentRef.instance['isExpanded'] = this.isExpanded;
    this.componentRef.instance['isInSearchBlock'] = this.isInSearchBlock;
  }
}

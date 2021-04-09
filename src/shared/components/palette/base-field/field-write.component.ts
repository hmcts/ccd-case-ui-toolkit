import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition';
import { FormValidatorsService } from '../../../services/form';
import { PaletteService } from '../palette.service';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';

const FIX_CASEFIELD_FOR = [ 'FixedList', 'DynamicList' ];

@Component({
  selector: 'ccd-field-write',
  templateUrl: './field-write.component.html',
  styleUrls: [ './field-write.component.scss' ]
})
export class FieldWriteComponent extends AbstractFieldWriteComponent implements OnInit {

  // EUI-3267. Flag for whether or not this can have a grey bar.
  public canHaveGreyBar = false;

  @Input()
  caseFields: CaseField[] = [];

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver,
              private paletteService: PaletteService) {
    super();
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    FormValidatorsService.addValidators(caseField, control);
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);

    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

    // Only Fixed list use plainToClassFromExist
    // Better performance
    // TODO AW 30/12/20 figure out why FixedLists need plainToClassFromExist
    // Added a check to make sure it's NOT already a CaseField and then
    // assigning it back to this.caseField so we don't create separation.
    if (FIX_CASEFIELD_FOR.indexOf(this.caseField.field_type.type) > -1 && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
    component.instance['caseField'] =  this.caseField;
    component.instance['caseFields'] = this.caseFields;
    component.instance['formGroup'] = this.formGroup;
    component.instance['parent'] = this.parent;
    component.instance['idPrefix'] = this.idPrefix;
    if (this.caseField.field_type.id === 'AddressGlobal') {
      component.instance['ignoreMandatory'] = true;
    }
    component.instance['isExpanded'] = this.isExpanded;
    component.instance['isInSearchBlock'] = this.isInSearchBlock;
    this.fieldContainer.insert(component.hostView);

    // EUI-3267.
    // Set up the flag for whether this can have a grey bar.
    this.canHaveGreyBar = this.caseField.show_condition && this.caseField.field_type.type !== 'Collection';
  }
}

import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
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
  public caseFields: CaseField[] = [];

  @ViewChild('fieldContainer', { static: true, read: ViewContainerRef })
  public fieldContainer: ViewContainerRef;

  constructor(private readonly resolver: ComponentFactoryResolver,
              private readonly paletteService: PaletteService) {
    super();
  }

  public ngOnInit(): void {
    const componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);
    const injectorOptions = {
      providers: [],
      parent: this.fieldContainer?.injector
    };
    const injector = Injector.create(injectorOptions);
    const factory = this.resolver.resolveComponentFactory(componentClass);
    const component = this.fieldContainer.createComponent(factory, 0, injector);

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

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    FormValidatorsService.addValidators(caseField, control);
  }
}

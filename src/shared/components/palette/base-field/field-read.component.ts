import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PaletteService } from '../palette.service';
import { AbstractFieldReadComponent } from './abstract-field-read.component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

const FIX_CASEFIELD_FOR = [ 'FixedList', 'DynamicList' ];

@Component({
  selector: 'ccd-field-read',
  templateUrl: './field-read.html'
})
export class FieldReadComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  withLabel = false;

  @Input()
  formGroup: FormGroup = new FormGroup({});

  @Input()
  caseFields: CaseField[] = [];

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private paletteService: PaletteService) {
    super();
  }

  ngOnInit(): void {
    // Ensure all field values are resolved by label interpolation before the component is fully initialised.
    Promise.resolve(null).then(() => {
      let componentClass = this.paletteService.getFieldComponentClass(this.caseField, false);
      let injector = Injector.create([], this.fieldContainer.parentInjector);
      let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

      // Provide component @Inputs
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
      component.instance['caseReference'] = this.caseReference;
      component.instance['context'] = this.context;

      this.fieldContainer.insert(component.hostView);
    });
  }
}

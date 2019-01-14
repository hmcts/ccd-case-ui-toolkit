import {
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { PaletteService } from '../palette.service';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';

@Component({
  selector: 'ccd-field-write',
  template: `
    <div [hidden]="caseField.hidden">
      <ng-container #fieldContainer></ng-container>
    </div>
  `
})
export class FieldWriteComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  formGroup: FormGroup;

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  private defaultControlRegistrer(formGroup: FormGroup,
                                   caseField: CaseField): (control: FormControl) => AbstractControl {
    return control => {
      if (formGroup.controls[caseField.id]) {
        return formGroup.get(caseField.id);
      }
      this.formValidatorsService.addValidators(caseField, control);
      formGroup.addControl(caseField.id, control);
      return control;
    };
  }

  constructor(private resolver: ComponentFactoryResolver,
              private paletteService: PaletteService,
              private formValidatorsService: FormValidatorsService) {
    super();
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);

    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

    // Provide component @Inputs
    component.instance['caseField'] = this.caseField;
    component.instance['registerControl'] = this.registerControl
      || this.defaultControlRegistrer(this.formGroup, this.caseField);
    component.instance['idPrefix'] = this.idPrefix;
    if (this.caseField.field_type.id === 'AddressGlobal') {
      component.instance['ignoreMandatory'] = true;
    }
    component.instance['isExpanded'] = this.isExpanded;
    let castedObject: AbstractFieldWriteComponent = <AbstractFieldWriteComponent> component.instance;
    this.fieldContainer.insert(component.hostView);
  }
}

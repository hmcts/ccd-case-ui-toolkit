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
import { AbstractFieldReadComponent } from './abstract-field-read.component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ccd-field-read',
  templateUrl: './field-read.html'
})
export class FieldReadComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  withLabel = false;

  @Input()
  formGroup: FormGroup;

  @Input()
  eventFields: CaseField[] = [];

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private paletteService: PaletteService) {
    super();
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, false);
    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

    // Provide component @Inputs
    component.instance['caseField'] = this.caseField;
    component.instance['eventFields'] = this.eventFields;
    component.instance['formGroup'] = this.formGroup;
    component.instance['caseReference'] = this.caseReference;
    component.instance['context'] = this.context;

    this.fieldContainer.insert(component.hostView);
  }

}

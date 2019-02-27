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

@Component({
  selector: 'ccd-field-read',
  templateUrl: './field-read.html'
})
export class FieldReadComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  withLabel = false;

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private paletteService: PaletteService) {
    super();
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, false);
    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

    console.log('this.caseField=', this.caseField);
    console.log('this.withLabel=', this.withLabel);
    // Provide component @Inputs
    component.instance['caseField'] = this.caseField;
    component.instance['caseReference'] = this.caseReference;
    component.instance['context'] = this.context;

    this.fieldContainer.insert(component.hostView);
  }

}

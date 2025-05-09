import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { RpxTranslationService } from 'rpx-xui-translation';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteService } from '../palette.service';
import { AbstractFieldReadComponent } from './abstract-field-read.component';

const FIX_CASEFIELD_FOR = ['FixedList', 'DynamicList', 'DynamicMultiSelectList'];

@Component({
  selector: 'ccd-field-read',
  templateUrl: './field-read.html'
})
export class FieldReadComponent extends AbstractFieldReadComponent implements OnInit {
  @Input()
  public withLabel = false;

  @Input()
  public formGroup: FormGroup = new FormGroup({});

  @Input()
  public caseFields: CaseField[] = [];


  @ViewChild('fieldContainer', { static: false, read: ViewContainerRef })
  public fieldContainer: ViewContainerRef;

  constructor(private readonly resolver: ComponentFactoryResolver, private readonly paletteService: PaletteService) {
    super();
  }

  public ngOnInit(): void {
    // Ensure all field values are resolved by label interpolation before the component is fully initialised.
    Promise.resolve(null).then(() => {
      const componentClass = this.paletteService.getFieldComponentClass(this.caseField, false);
      const injector = Injector.create({
        providers: [],
        parent: this.fieldContainer?.injector
      });

      const component = this.resolver.resolveComponentFactory(componentClass).create(injector);

      // Provide component @Inputs
      // Only Fixed list use plainToClassFromExist
      // Better performance
      // TODO AW 30/12/20 figure out why FixedLists need plainToClassFromExist
      // Added a check to make sure it's NOT already a CaseField and then
      // assigning it back to this.caseField so we don't create separation.
      if (FIX_CASEFIELD_FOR.indexOf(this.caseField.field_type.type) > -1 && !(this.caseField instanceof CaseField)) {
        this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
      }
      component.instance['caseField'] = this.caseField;
      component.instance['caseFields'] = this.caseFields;
      component.instance['formGroup'] = this.formGroup;
      component.instance['topLevelFormGroup'] = this.topLevelFormGroup;
      component.instance['idPrefix'] = this.idPrefix;
      component.instance['parent'] = this.parent;
      component.instance['caseReference'] = this.caseReference;
      component.instance['context'] = this.context;
      component.instance['labelCanBeTranslated'] = this.labelCanBeTranslated(this.caseField);

      this.fieldContainer?.insert(component.hostView);
    });
  }

  private labelCanBeTranslated(caseField: CaseField): boolean {
    return !!(caseField.field_type.type === 'Label' && caseField.label);
  }
}

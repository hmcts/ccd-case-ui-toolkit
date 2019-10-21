import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export class FormGroupHelper {
  constructor() {}
  /**
   * This function is going to find a component's value from the top level FormGroup.
   * @param componentName this is the component name that is going to be used to find the component's value.
   * @param group this is the top level FormGroup.
   * @return not-Defined if the component's value could not be found. componentValue:any
   * if there is a value for the component name passed as parameter.
   */
  findControlValueFromFromGroup(componentName: string, group: AbstractControl): any {
    let result = this.getControlValueFromTopLevelForm(componentName, group);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  }
  private isAValidForm(group: AbstractControl): boolean {
    let formGroup: FormGroup = <FormGroup>  group;
    if (!formGroup) { return true; }
    return false;
  }

  private getControlValueFromTopLevelForm(componentName: string, group: AbstractControl): any {
    let formGroup: FormGroup = <FormGroup>  group;
    let control;
    // This function filterFx is going to be used to clean all empty result comming from map executions.
    const filterFx = function (el) { return el != null; }
    // If the formGroup is empty it means that there is no any control.
    if (this.isAValidForm(group)) { return Array(); }
    // map through the FormGroup controls.
    let formControls = Object.keys(formGroup.controls).map((key: string) => {
      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);
      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      if (abstractControl instanceof FormGroup) {
        return this.getControlValueFromTopLevelForm(componentName, abstractControl);
        // If the control is not a FormGroup then we know it's a FormControl or a FormArray
      } else {
        if (abstractControl instanceof  FormArray) {
          // map through the FormArray controls.
          return abstractControl.controls.map((formControl) => {
            return this.getControlValueFromTopLevelForm(componentName, formControl)
          }).filter(filterFx);
          // If the control is not a FormGroup then we know it's a FormControl
        } else {
          if (key === componentName) {
            return abstractControl.value;
          }
        }
      }
      return control;
    }).filter(filterFx);
    const flattenedArray = this.flat(formControls);
    return this.flat(Array.from(new Set(flattenedArray).values()));
  }

  flat(array) {
    return array.reduce((acc, item) => {
      return acc.concat(item);
    }, []);
  }

}

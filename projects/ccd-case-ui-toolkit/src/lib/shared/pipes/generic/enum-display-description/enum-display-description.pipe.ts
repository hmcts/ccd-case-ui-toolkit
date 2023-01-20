import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumDisplayDescription'
})
export class EnumDisplayDescriptionPipe implements PipeTransform {
  public transform(value: any) {
    return Object.values(value);
  }
}

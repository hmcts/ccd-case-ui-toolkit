import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumDisplayDescription',
  standalone: false
})
export class EnumDisplayDescriptionPipe implements PipeTransform {
  public transform(value: any) {
    return Object.values(value);
  }
}

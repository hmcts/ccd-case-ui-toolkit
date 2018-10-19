import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ccdDash'
})
export class DashPipe implements PipeTransform {

  transform(value: string): string {
    return value ? value : '-';
  }
}

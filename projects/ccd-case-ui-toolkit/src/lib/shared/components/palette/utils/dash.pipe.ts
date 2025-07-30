import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ccdDash',
    standalone: false
})
export class DashPipe implements PipeTransform {

  public transform(value: string): string {
    return value ? value : '-';
  }
}

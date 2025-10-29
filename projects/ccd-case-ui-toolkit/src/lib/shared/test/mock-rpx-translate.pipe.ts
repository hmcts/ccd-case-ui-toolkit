/* istanbul ignore file */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rpxTranslate',
  standalone: false
})
export class MockRpxTranslatePipe implements PipeTransform {
    public transform(value: string, replacements?: { [key: string]: string } | null, yesOrNo?: string): string {
        return value;
    }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'rpxTranslate'})
export class MockRpxTranslatePipe implements PipeTransform {
    public transform(value: string): string {
        return value;
    }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

function coerceToBoolean(input: string | boolean): boolean {
    return !!input && input !== 'false';
}

@Component({
  selector: 'ccd-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {

    @Input()
    visibilityLabel: string;

    @Input() id: string;
    @Input() maxSize = 7;
    @Input()
    get directionLinks(): boolean {
        return this._directionLinks;
    }

    set directionLinks(value: boolean) {
        this._directionLinks = coerceToBoolean(value);
    }

    @Input()
    get autoHide(): boolean {
        return this._autoHide;
    }

    set autoHide(value: boolean) {
        this._autoHide = coerceToBoolean(value);
    }

    @Input()
    get responsive(): boolean {
        return this._responsive;
    }

    set responsive(value: boolean) {
        this._responsive = coerceToBoolean(value);
    }

    @Input() previousLabel = 'Previous';
    @Input() nextLabel = 'Next';
    @Input() screenReaderPaginationLabel = 'Pagination';
    @Input() screenReaderPageLabel = 'page';
    @Input() screenReaderCurrentLabel = `You're on page`;
    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() pageBoundsCorrection: EventEmitter<number> = new EventEmitter<number>();

    private _directionLinks = true;
    private _autoHide = false;
    private _responsive = false;
}

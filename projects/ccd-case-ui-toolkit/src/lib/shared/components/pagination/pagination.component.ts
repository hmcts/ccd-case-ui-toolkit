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
  @Input() public visibilityLabel: string;
  @Input() public id: string;
  @Input() public maxSize = 7;
  @Input() public previousLabel = 'Previous';
  @Input() public nextLabel = 'Next';
  @Input() public screenReaderPaginationLabel = 'Pagination';
  @Input() public screenReaderPageLabel = 'page';
  @Input() public screenReaderCurrentLabel = `You're on page`;
  @Output() public pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() public pageBoundsCorrection: EventEmitter<number> = new EventEmitter<number>();

  private pDirectionLinks = true;
  private pAutoHide = false;
  private pResponsive = false;

  @Input()
  public get directionLinks(): boolean {
    return this.pDirectionLinks;
  }

  public set directionLinks(value: boolean) {
    this.pDirectionLinks = coerceToBoolean(value);
  }

  @Input()
  public get autoHide(): boolean {
    return this.pAutoHide;
  }

  public set autoHide(value: boolean) {
    this.pAutoHide = coerceToBoolean(value);
  }

  @Input()
  public get responsive(): boolean {
    return this.pResponsive;
  }

  public set responsive(value: boolean) {
    this.pResponsive = coerceToBoolean(value);
  }
}

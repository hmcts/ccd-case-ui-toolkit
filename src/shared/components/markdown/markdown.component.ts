import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  content: string;
  @Input()
  useHrefAsRouterLink: string = null;
  @Output()
  clicked: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
  }
  public onMarkdownClick() {
    if (this.useHrefAsRouterLink === 'true') {
      this.clicked.emit(this.content);
      return false;
    }
  }
}

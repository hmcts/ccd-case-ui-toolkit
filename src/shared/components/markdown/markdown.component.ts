import { Component, Input, OnInit } from '@angular/core';
import { ConvertHrefToRouterService } from '../case-editor/services';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  content: string;
  @Input()
  markdownUseHrefAsRouterLink!: boolean;

  constructor(private convertHrefToRouterService: ConvertHrefToRouterService) {}

  ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
  }

  public onMarkdownClick() {
    // if (this.markdownUseHrefAsRouterLink === true) {
    if (this.markdownUseHrefAsRouterLink === true && this.content.indexOf('href') < 0 && this.content.indexOf('http') < 0) {
      this.convertHrefToRouterService.updateHrefLink(this.content);
      return false;
    }
  }
}

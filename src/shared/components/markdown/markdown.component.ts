import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {

  @Input()
  content: string;

  ngOnInit(): void {
    this.content = this.content.split('  ').join('<br>');
  }
}

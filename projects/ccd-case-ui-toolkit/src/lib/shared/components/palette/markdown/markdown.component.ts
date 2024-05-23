import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  public content: string;
  @Input()
  public markdownUseHrefAsRouterLink!: boolean;

  constructor(private router: Router, private renderer: Renderer2) {}

  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ConvertHrefToRouterService {

  private hrefMarkdownLinkContent = new BehaviorSubject('Default');

  constructor(private readonly router: Router) {}

  updateHrefLink(content: string): void {
    this.hrefMarkdownLinkContent.next(content)
  }

  getHrefMarkdownLinkContent(): Observable<string> {
    return this.hrefMarkdownLinkContent.asObservable();
  }

  callAngularRouter(hrefMarkdownLinkContent): void {

    const url = hrefMarkdownLinkContent.substring(hrefMarkdownLinkContent.indexOf('(') + 1, hrefMarkdownLinkContent.indexOf(')'));
    const urls = url.split('?');

    this.router.navigate([urls[0]], {
      queryParams: {
        tid: urls[1] ? urls[1].split('=')[1] : ''
      }
    });
  }
}

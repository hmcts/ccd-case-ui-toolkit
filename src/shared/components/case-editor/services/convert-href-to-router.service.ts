import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ConvertHrefToRouterService {

  private hrefMarkdownLinkContent = new BehaviorSubject('Default');

  constructor(private readonly router: Router) {}

  updateHrefLink(content: string): void {
    this.hrefMarkdownLinkContent.next(content);
  }

  getHrefMarkdownLinkContent(): Observable<string> {
    return this.hrefMarkdownLinkContent.asObservable();
  }

  callAngularRouter(hrefMarkdownLinkContent): void {
    const urls = hrefMarkdownLinkContent.split('?');
    const queryParams = urls[1];
    let queryParamObj = {};

    if (queryParams) {
      const queryParam = queryParams.split('&');
      if (queryParam.length > 0) {
        for (let i = 0; i < queryParam.length; i++) {
          let param = queryParam[i].split('=');
          queryParamObj[param[0]] = param[1]
        }
      }
    }

    this.router.navigate([urls[0]], {
      queryParams: (queryParamObj && Object.keys(queryParamObj).length) ? queryParamObj : ''
    });
  }
}

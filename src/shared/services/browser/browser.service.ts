import { Injectable } from '@angular/core';

@Injectable()
export class BrowserService {
  public isFirefox(): boolean {
    return window.navigator.userAgent.indexOf('Firefox') > -1;
  }
  public isSafari(): boolean {
    const isSafariAgent = window.navigator.userAgent.indexOf('Safari') > -1;
    const isChromeAgent = window.navigator.userAgent.indexOf('Chrome') > -1;
    if ((isChromeAgent) && (isSafariAgent)) {
      return false;
    }
    return isSafariAgent;
  }
  public isIEOrEdge(): boolean {
    return /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class BrowserService {
  public isFirefox(): boolean {
    return window.navigator.userAgent.includes('Firefox');
  }
  public isSafari(): boolean {
    const isSafariAgent = window.navigator.userAgent.includes('Safari');
    const isChromeAgent = window.navigator.userAgent.includes('Chrome');
    if ((isChromeAgent) && (isSafariAgent)) {
      return false;
    }
    return isSafariAgent;
  }
  public isIEOrEdge(): boolean {
    return /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  }
}

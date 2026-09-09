import { Injectable } from '@angular/core';

const MEDIA_VIEWER_HANDOFF_RETRY_INTERVAL_MS = 100;
const MEDIA_VIEWER_HANDOFF_MAX_ATTEMPTS = 100;

@Injectable()
export class WindowService {
  public locationAssign(url: string): void {
    window.location.assign(url);
  }

  public setSessionStorage(key: string, value: string) {
    window.sessionStorage.setItem(key, value);
  }

  public getSessionStorage(key: string) {
    return window.sessionStorage.getItem(key);
  }

  public removeSessionStorage(key: string): void {
    window.sessionStorage.removeItem(key);
  }

  public clearSessionStorage(): void {
    window.sessionStorage.clear();
  }

  public openOnNewTab(url: string): void {
    const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (openedWindow) {
      openedWindow.opener = null;
    }
  }

  public openOnNewTabWithMessage(url: string, message: string, token: string): void {
    const openedWindow = window.open(url, '_blank');
    if (!openedWindow) {
      return;
    }

    const targetOrigin = window.location.origin;
    const handoff = { type: 'MEDIA_VIEWER_HANDOFF', token, payload: message };
    let attempts = 0;
    let retryTimer: number;
    let acknowledged = false;
    const complete = () => {
      acknowledged = true;
      window.clearTimeout(retryTimer);
      window.removeEventListener('message', acknowledgementListener);
      if (!openedWindow.closed) {
        openedWindow.opener = null;
      }
    };
    const acknowledgementListener = (event: MessageEvent): void => {
      const data = event.data;
      if (event.origin === targetOrigin && event.source === openedWindow &&
        data?.type === 'MEDIA_VIEWER_HANDOFF_RECEIVED' && data.token === token) {
        complete();
      }
    };
    window.addEventListener('message', acknowledgementListener);
    const send = () => {
      if (acknowledged || openedWindow.closed || attempts++ >= MEDIA_VIEWER_HANDOFF_MAX_ATTEMPTS) {
        window.removeEventListener('message', acknowledgementListener);
        if (!openedWindow.closed) {
          openedWindow.opener = null;
        }
        return;
      }
      openedWindow.postMessage(handoff, targetOrigin);
      retryTimer = window.setTimeout(send, MEDIA_VIEWER_HANDOFF_RETRY_INTERVAL_MS);
    };
    send();
  }

  public confirm(message: string): boolean {
    return window.confirm(message);
  }

  public alert(message: string): void {
    return window.alert(message);
  }
}

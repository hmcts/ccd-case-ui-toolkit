import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {
  public locationAssign(url: string): void {
    window.location.assign(url);
  }

  public setLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  public getLocalStorage(key: string) {
    return window.localStorage.getItem(key);
  }

  public clearLocalStorage() {
    window.localStorage.clear();
  }

  public removeLocalStorage(key: string) {
    window.localStorage.removeItem(key);
  }

  public setSessionStorage(key: string, value: string) {
    window.sessionStorage.setItem(key, value);
  }

  public getSessionStorage(key: string) {
    return window.sessionStorage.getItem(key);
  }

  public openOnNewTab(url: string): void {
    window.open(url, '_blank');
  }

  public confirm(message: string): boolean {
    return window.confirm(message);
  }

  alert(message: string): void {
    return window.alert(message);
  }
}

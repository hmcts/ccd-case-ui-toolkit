import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {
  locationAssign(url: string): void {
    window.location.assign(url);
  }

  setLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  getLocalStorage(key: string) {
    return window.localStorage.getItem(key);
  }

  clearLocalStorage() {
    window.localStorage.clear();
  }

  removeLocalStorage(key: string) {
    window.localStorage.removeItem(key);
  }

  setSessionStorage(key: string, value: string) {
    window.sessionStorage.setItem(key, value);
  }

  getSessionStorage(key: string) {
    return window.sessionStorage.getItem(key);
  }

  openOnNewTab(url: string): void {
    window.open(url, '_blank');
  }

  confirm(message: string): boolean {
    return window.confirm(message);
  }

  alert(message: string): void {
    return window.alert(message);
  }
}

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
}

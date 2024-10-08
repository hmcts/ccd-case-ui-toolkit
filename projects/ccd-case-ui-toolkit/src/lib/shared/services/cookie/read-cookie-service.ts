import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReadCookieService {
  private readonly document?: Document;

  constructor(@Inject(DOCUMENT) doc?: any) {
    this.document = doc as Document;
  }

  public getCookie(key: string): string {
    const cookieValue = this.document.cookie
      .split('; ')
      .find(row => row.startsWith(`${key}=`))
      .split('=')[1];
    return cookieValue;
  }
}

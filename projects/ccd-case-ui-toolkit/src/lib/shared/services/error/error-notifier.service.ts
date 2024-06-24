import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ErrorNotifierService {
  public errorSource:  Subject<any> = new BehaviorSubject(null);
  public error = this.errorSource.asObservable();

  public announceError(error: any) {
    this.errorSource.next(error);
  }
}

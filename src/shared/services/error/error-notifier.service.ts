import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ErrorNotifierService {
  public errorSource: Subject<any> = new Subject<any>();
  public error = this.errorSource.asObservable();

  public announceError(error: any) {
    this.errorSource.next(error);
  }
}

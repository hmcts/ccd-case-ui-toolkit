import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorNotifierService {
  errorSource: Subject<any> = new Subject<any>();
  error = this.errorSource.asObservable();

  announceError(error: any) {
    this.errorSource.next(error);
  }
}

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorNotifierService {
  errorSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  error = this.errorSource.asObservable();

  announceError(error: any) {
    this.errorSource.next(error);
  }
}

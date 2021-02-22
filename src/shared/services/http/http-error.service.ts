import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpError } from '../../domain/http/http-error.model';
import { AuthService } from '../auth';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class HttpErrorService {

  private static readonly CONTENT_TYPE = 'Content-Type';
  private static readonly JSON = 'json';

  private error: HttpError;

  constructor(private authService: AuthService) {
  }

  setError(error: HttpError) {
      this.error = error;
  }

  removeError(): HttpError {
      let error = this.error;
      this.error = null;
      return error;
  }

  handle(error: HttpResponse<any> | any, redirectIfNotAuthorised = true): Observable<never> {
    let httpError = new HttpError();
    if (error instanceof HttpResponse) {
      if (error.headers
          && error.headers.get(HttpErrorService.CONTENT_TYPE)
          && error.headers.get(HttpErrorService.CONTENT_TYPE).indexOf(HttpErrorService.JSON) !== -1) {
        try {
          httpError = HttpError.from(error || {});
        } catch (e) {
          console.error(e, e.message);
        }
      }
      if (!httpError.status) {
        httpError.status = error.status;
      }
    } else if (error) {
      if (error.message) {
        httpError.message = error.message;
      }
      if (error.status) {
        httpError.status = error.status;
      }
    }
    if (redirectIfNotAuthorised && (httpError.status === 401 || httpError.status === 403)) {
      this.authService.signIn();
    }

    return throwError(httpError);
  }
}

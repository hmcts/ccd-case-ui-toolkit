import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Response } from '@angular/http';
import { HttpError } from '../../domain/http/http-error.model';
import { AuthService } from '../auth';

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

  handle(error: Response | any, redirectIfNotAuthorised = true, data?: Object): Observable<never> {
    let httpError = new HttpError();
    if (error instanceof Response) {
      if (error.headers
          && error.headers.get(HttpErrorService.CONTENT_TYPE)
          && error.headers.get(HttpErrorService.CONTENT_TYPE).indexOf(HttpErrorService.JSON) !== -1) {
        try {
          httpError = HttpError.from(error.json() || {});
        } catch (e) {
          console.error(e, e.message);
        }
      }
      if (!httpError.status) {
        httpError.status = error.status;
      }
      if (data) {
        httpError.callbackErrorFields = data;
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

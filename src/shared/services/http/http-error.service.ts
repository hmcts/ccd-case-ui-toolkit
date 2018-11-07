import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Response } from '@angular/http';
import { HttpError } from '../../domain/http/http-error.model';
import { AuthService } from '../auth';

@Injectable()
export class HttpErrorService {

  private static readonly CONTENT_TYPE = 'Content-Type';
  private static readonly APPLICATION_JSON = 'application/json';

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

  handle(error: Response | any, redirectIfNotAuthorised = true): Observable<never> {
    let httpError = new HttpError();
    if (error instanceof Response) {
      if (error.headers
          && error.headers.get(HttpErrorService.CONTENT_TYPE)
          && error.headers.get(HttpErrorService.CONTENT_TYPE).startsWith(HttpErrorService.APPLICATION_JSON)) {
        try {
          httpError = HttpError.from(error.json() || {});
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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpError } from '../../domain/http/http-error.model';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../loading';


@Injectable()
export class HttpErrorService {

  constructor(private readonly authService: AuthService,
        private readonly loadingService: LoadingService
  ) {}

  private static readonly CONTENT_TYPE = 'Content-Type';
  private static readonly JSON = 'json';

  private error: HttpError;
  public static convertToHttpError(error: HttpErrorResponse | any): HttpError {
    if (error instanceof HttpError) {
      return error;
    }
    let httpError = new HttpError();
    if (error instanceof HttpErrorResponse) {
      if (error.headers?.get(HttpErrorService.CONTENT_TYPE).indexOf(HttpErrorService.JSON) !== -1) {
        try {
          httpError = HttpError.from(error);
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
    return httpError;
  }

  public setError(error: HttpError) {
    this.error = error;
  }

  public removeError(): HttpError {
    const error = this.error;
    this.error = null;
    return error;
  }

  public handle(error: HttpErrorResponse | any, redirectIfNotAuthorised = true): Observable<never> {
    console.error('Handling error in http error service.');
    console.error(error);
    if (this.loadingService.hasSharedSpinner()){
      this.loadingService.unregisterSharedSpinner();
    }
    const httpError: HttpError = HttpErrorService.convertToHttpError(error);
    if (redirectIfNotAuthorised && httpError.status === 401) {
      this.authService.signIn();
    }
    return throwError(httpError);
  }
}

import { HttpErrorResponse } from '@angular/common/http';

export class HttpError {
  private static readonly DEFAULT_ERROR = 'Unknown error';
  private static readonly DEFAULT_MESSAGE = 'Something unexpected happened, our technical staff have been automatically notified';
  private static readonly DEFAULT_STATUS = 500;

  timestamp: string;
  status: number;
  error: string;
  exception: string;
  message: string;
  path: string;
  details?: any;
  callbackErrors?: any;
  callbackWarnings?: any;

  static from(response: HttpErrorResponse): HttpError {
    const error = new HttpError();

    // Check that the HttpErrorResponse contains an "error" object before mapping the error properties
    if (!!(response && response.error)) {
      Object
        .keys(error)
        .forEach(key => error[key] = response.error.hasOwnProperty(key) && response.error[key] ? response.error[key] : error[key]);
    }

    return error;
  }

  constructor() {
    this.timestamp = new Date().toISOString();
    this.error = HttpError.DEFAULT_ERROR;
    this.message = HttpError.DEFAULT_MESSAGE;
    this.status = HttpError.DEFAULT_STATUS;
    this.exception = null;
    this.path = null;
    this.details = null;
    this.callbackErrors = null;
    this.callbackWarnings = null;
  }
}

import { HttpErrorResponse } from '@angular/common/http';

export class HttpError {

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
  private static readonly DEFAULT_ERROR = 'Unknown error';
  private static readonly DEFAULT_MESSAGE = 'Something unexpected happened, our technical staff have been automatically notified';
  private static readonly DEFAULT_STATUS = 500;


  public timestamp: string;
  public status: number;
  public error: string;
  public exception: string;
  public message: string;
  public path: string;
  public details?: any;
  public callbackErrors?: any;
  public callbackWarnings?: any;

  public static from(response: HttpErrorResponse): HttpError {
    const error = new HttpError();

    if (response?.status === 429) {
      error.error = HttpError.MESSAGE_ERROR_429;
      error.status = response.status;
      error.message = response.message;
    }

    // Check that the HttpErrorResponse contains an "error" object before mapping the error properties
    if (!!(response && response.error)) {
      Object.keys(error).forEach((key) => {
        error[key] = response.error.hasOwnProperty(key) && response.error[key] ? response.error[key] : error[key];
      });
    }

    // Error object in HttpErrorResponse will be empty for 403 errors
    // Set the error properties of HttpError accordingly
    if (response?.status === 403) {
      error.error = response.statusText;
      error.status = response.status;
      error.message = response.message;
    }

    return error;
  }
}

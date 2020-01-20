export class HttpError {
  private static readonly DEFAULT_ERROR = 'Unknown error';
  private static readonly DEFAULT_MESSAGE = 'Something unexpected happened, our technical staff have been automatically notified';

  timestamp: string;
  status: number;
  error: string;
  exception: string;
  message: string;
  path: string;
  details?: any;
  callbackErrors?: any;
  callbackErrorFields?: any;
  callbackWarnings?: any;

  static from(data: object): HttpError {
    let error = new HttpError();

    Object
      .keys(error)
      .forEach(key => error[key] = data.hasOwnProperty(key) && data[key] ? data[key] : error[key]);

    return error;
  }

  constructor() {
    this.timestamp = new Date().toISOString();
    this.error = HttpError.DEFAULT_ERROR;
    this.message = HttpError.DEFAULT_MESSAGE;
    this.status = null;
    this.exception = null;
    this.path = null;
    this.details = null;
    this.callbackErrors = null;
    this.callbackErrorFields = null;
    this.callbackWarnings = null;
  }
}

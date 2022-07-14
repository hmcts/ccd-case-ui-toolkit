import createSpyObj = jasmine.createSpyObj;
import { Subject } from 'rxjs';
import { HttpError } from '../../domain';
import { ErrorNotifierService } from './error-notifier.service';

describe('ErrorNotifierService', () => {
  let errorNotifierService: ErrorNotifierService;
  let spyErrorSource: Subject<any>;

  beforeEach(() => {
    errorNotifierService = new ErrorNotifierService();
    spyErrorSource = createSpyObj<Subject<any>>('errorSource', ['asObservable', 'next']);
    errorNotifierService.errorSource = spyErrorSource;
  });

  it('should push the error out through the error source', () => {
    const error = new HttpError();
    errorNotifierService.announceError(error);
    expect(spyErrorSource.next).toHaveBeenCalledWith(error);
  });
});

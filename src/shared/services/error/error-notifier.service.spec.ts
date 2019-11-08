import { ErrorNotifierService } from './error-notifier.service';
import createSpyObj = jasmine.createSpyObj;
import { Subject } from 'rxjs';
import { HttpError } from '../../domain';

describe('ErrorNotifierService', () => {
  let errorNotifierService: ErrorNotifierService;
  let spyErrorSource: Subject<any>;

  beforeEach(() => {
    errorNotifierService = new ErrorNotifierService();
    spyErrorSource = createSpyObj<Subject<any>>('errorSource', ['asObservable', 'next']);
    errorNotifierService.errorSource = spyErrorSource;
  });

  it('should push the error out through the error source', () => {
    let error = new HttpError();
    errorNotifierService.announceError(error);
    expect(spyErrorSource.next).toHaveBeenCalledWith(error);
  });
});

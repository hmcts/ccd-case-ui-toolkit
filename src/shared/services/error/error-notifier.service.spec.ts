import { ErrorNotifierService } from './error-notifier.service';
import createSpyObj = jasmine.createSpyObj;
import { BehaviorSubject } from 'rxjs';
import { HttpError } from '../../domain';

describe('ErrorNotifierService', () => {
  let errorNotifierService: ErrorNotifierService;
  let spyErrorSource: BehaviorSubject<any>;

  beforeEach(() => {
    errorNotifierService = new ErrorNotifierService();
    spyErrorSource = createSpyObj<BehaviorSubject<any>>('errorSource', ['asObservable', 'next']);
    errorNotifierService.errorSource = spyErrorSource;
  });

  it('should map simple error to associated form control', () => {
    let error = new HttpError();
    errorNotifierService.announceError(error);
    expect(spyErrorSource.next).toHaveBeenCalledWith(error);
  });
});

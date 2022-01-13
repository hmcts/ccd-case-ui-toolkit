import { TestBed } from '@angular/core/testing';
import { HttpErrorService, HttpService } from '../../../services';
import { WorkAllocationService } from '../../case-editor';
import { EventTasksResolverService } from './event-tasks-resolver.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventTaskResolverService', () => {
  let appConfig: any;
  let httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  let errorService: any;
  let workAllocationService: WorkAllocationService;
  let alertService: any;

  httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EventTasksResolverService,
      { provide: WorkAllocationService, useValue: workAllocationService }
    ]
  }));

  it('should be created', () => {
    const service: EventTasksResolverService = TestBed.get(EventTasksResolverService);
    expect(service).toBeTruthy();
  });
});

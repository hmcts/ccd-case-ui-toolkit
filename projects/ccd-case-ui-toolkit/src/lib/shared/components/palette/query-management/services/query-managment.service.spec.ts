import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractAppConfig } from '../../../../../app.config';
import { AlertService, AuthService, HttpErrorService, HttpService } from '../../../../services';
import { QueryManagmentService } from './query-managment.service';

describe('QueryManagmentService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let service: QueryManagmentService;
  let alertService: any;

  beforeEach(() => {
    alertService = jasmine.createSpyObj('alertService', ['warning']);
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ HttpClientTestingModule ],
      providers: [
        AbstractAppConfig,
        AuthService,
        HttpService,
        HttpErrorService,
        { provide: AlertService, useValue: alertService },
       ]
    });
    service = TestBed.inject(QueryManagmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

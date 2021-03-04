import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { AbstractAppConfig } from '../../../app.config';
import { Observable } from 'rxjs';
import { HttpService } from '../http';
import { Profile } from '../../domain';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProfileService {

  public static readonly V2_MEDIATYPE_USER_PROFILE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-user-profile.v2+json;charset=UTF-8';
  private static readonly URL = '/internal/profile';

  constructor(private httpService: HttpService, private appConfig: AbstractAppConfig) {}

  get(): Observable<Profile> {
    const url = this.appConfig.getCaseDataUrl() + ProfileService.URL;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', ProfileService.V2_MEDIATYPE_USER_PROFILE)
      .set('Content-Type', 'application/json');

    return this.httpService
      .get(url, {headers, observe: 'body'})
      .pipe(
        map((p: Object) => plainToClass(Profile, p))
      )
  }

}

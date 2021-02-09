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
    let url = this.appConfig.getCaseDataUrl() + ProfileService.URL;
    let headers = new HttpHeaders({
      'experimental': 'true',
      'Accept': ProfileService.V2_MEDIATYPE_USER_PROFILE
    });

    return this.httpService
      .get(url, {headers})
      .pipe(
        map((response: Response) => response.json()),
        map((p: Object) => plainToClass(Profile, p))
      )
  }

}

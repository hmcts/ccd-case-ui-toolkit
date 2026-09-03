import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { Profile } from '../../domain/profile/profile.model';
import { HttpService } from '../http/http.service';

@Injectable()
export class ProfileService {

  public static readonly V2_MEDIATYPE_USER_PROFILE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-user-profile.v2+json;charset=UTF-8';
  private static readonly URL = '/internal/profile';
  private profile$: Observable<Profile>;

  constructor(private readonly httpService: HttpService, private readonly appConfig: AbstractAppConfig) {}

  public get(): Observable<Profile> {
    if (this.profile$) {
      return this.profile$;
    }

    const url = this.appConfig.getCaseDataUrl() + ProfileService.URL;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', ProfileService.V2_MEDIATYPE_USER_PROFILE)
      .set('Content-Type', 'application/json');
    // Not adding client context header because header is added to call immediately afterwards
    this.profile$ = this.httpService
      .get(url, {headers, observe: 'body'})
      .pipe(
        map((p: object) => plainToClass(Profile, p)),
        shareReplay(1)
      );

    return this.profile$;
  }

  public clearProfileCache(): void {
    this.profile$ = undefined;
  }

}

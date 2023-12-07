import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { Banner } from '../../domain/definition/banner.model';
import { HttpService } from '../http/http.service';

@Injectable()
export class BannersService {
  public static readonly V2_MEDIATYPE_BANNERS = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-banners.v2+json;charset=UTF-8';

  constructor(private readonly httpService: HttpService, private readonly appConfig: AbstractAppConfig) {
  }

  public getBanners(jurisdictionReferences: string[]): Observable<Banner[]> {
    const url = this.appConfig.getBannersUrl();
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', BannersService.V2_MEDIATYPE_BANNERS)
      .set('Content-Type', 'application/json');
    let params = new HttpParams();
    jurisdictionReferences.forEach(reference => params = params.append('ids', reference));
    return this.httpService
      .get(url, {params, headers, observe: 'body'})
      .pipe(
        map(body => body.banners)
      );
  }
}

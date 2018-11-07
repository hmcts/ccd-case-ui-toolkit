import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { AbstractAppConfig } from '../../../app.config';
import { Observable } from 'rxjs';
import { HttpService } from '../http';
import { Profile } from '../../domain';

@Injectable()
export class ProfileService {

  private static readonly URL = '/caseworkers/:uid/profile';

  constructor(private httpService: HttpService, private appConfig: AbstractAppConfig) {}

  get(): Observable<Profile> {
    let url = this.appConfig.getCaseDataUrl() + ProfileService.URL;
    return this.httpService
      .get(url)
      .pipe(
        map((response: Response) => response.json()),
        map((p: Object) => plainToClass(Profile, p))
      )
  }

}

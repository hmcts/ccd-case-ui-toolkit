import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ServiceOrg } from '../../domain/case-view/service-org-response.model';

export interface LovRefDataModel {
  category_key: string;
  key: string;
  value_en: string;
  value_cy: string;
  hint_text_en: string;
  hint_text_cy: string;
  lov_order: number;
  parent_category: string;
  parent_key: string;
  active_flag: string;
  child_nodes?: LovRefDataModel[];
  from?: string;
  selected?: boolean;
}

export interface LovRefDataByServiceModel {
  list_of_values: LovRefDataModel[];
}

@Injectable()
export class CommonDataService {

  constructor(private readonly http: HttpClient) {}

  public getRefData(url: string): Observable<LovRefDataByServiceModel> {
    if (url) {
      return this.http.get<LovRefDataByServiceModel>(url, {observe: 'body'});
    }
    return of(null);
  }

  public getServiceOrgData(url: string): Observable<ServiceOrg> {
    if (url) {
      return this.http.get<ServiceOrg>(url, {observe: 'body'});
    }
    return of(null);
  }
}

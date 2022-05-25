import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';

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
  }

@Injectable()
export class CommonDataService {

    constructor(private readonly http: HttpClient,
                private readonly appconfig: AbstractAppConfig) {}

    public getRefData(): Observable<LovRefDataModel[]> {
            const url = "/assets/getCaseReasons.json";
            return this.http.get<LovRefDataModel[]>(url)
    }
}

import { Injectable } from '@angular/core';
import { Payment } from './payment.model';
import { HttpService } from '../../services/http.service';
import { Observable } from 'rxjs';

@Injectable()
export class CasePaymentHistoryService {
  private static readonly URL = '${BASE_URL}/payments/${caseReference}';

  constructor(private http: HttpService) {}

  public getPayments(baseUrl: string, caseReference: string): Observable<Payment[]> {
    return this.http
      .get(this.getPaymentsUrl(baseUrl, caseReference), null)
      .map(response => response.json());
  }

  private getPaymentsUrl(baseUrl: string, caseReference: string) {
    let url = CasePaymentHistoryService.URL.replace('${BASE_URL}', baseUrl);
    return url.replace('${caseReference}', caseReference);
  }
}

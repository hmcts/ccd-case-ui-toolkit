import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpService } from '../../../../services/http/http.service';
import { GetLinkedCases, LinkedCase } from '../domain';

@Injectable()
export class LinkedCasesService {

  public linkedCases: LinkedCase[] = [];

  constructor(
    private http: HttpService,
  ) {
  }

  getLinkedCases(caseId: string): Observable<GetLinkedCases> { 
    return this.http
    .get('assets/getLinkedCases.json')
    .pipe(
      catchError(error => {
        return throwError(error);
      })
    );
}
}


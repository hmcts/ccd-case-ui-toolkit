import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class RouterHelperService {
  public getUrlSegmentsFromRoot(route: ActivatedRouteSnapshot): string[] {
    return route.pathFromRoot
      .filter(r => r.url && r.url.length)
      .reduce((acc, r) => {
        r.url.forEach(url => {
          acc.push(url.path);
        });
        return acc;
      }, []);
  }
}

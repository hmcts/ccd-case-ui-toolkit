import { ActivatedRouteSnapshot } from '@angular/router';

export class TestRouteSnapshotBuilder {
  private parent: ActivatedRouteSnapshot = null;
  private params: Object = {};
  private data: Object = {};

  withParent(parent: ActivatedRouteSnapshot): TestRouteSnapshotBuilder {
    this.parent = parent;
    return this;
  }

  withParams(params: Object): TestRouteSnapshotBuilder {
    this.params = params;
    return this;
  }

  withData(data: Object): TestRouteSnapshotBuilder {
    this.data = data;
    return this;
  }

  build(): ActivatedRouteSnapshot {
    return {
      url: [],
      params: this.params,
      queryParams: [],
      fragment: '',
      data: this.data,
      outlet: null,
      component: null,
      routeConfig: null,
      root: null,
      parent: this.parent,
      firstChild: null,
      children: [],
      pathFromRoot: null,
      paramMap: null,
      queryParamMap: null,
    };
  }
}

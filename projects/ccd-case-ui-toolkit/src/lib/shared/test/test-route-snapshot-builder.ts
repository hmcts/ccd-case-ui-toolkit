import { ActivatedRouteSnapshot } from '@angular/router';

export class TestRouteSnapshotBuilder {
  private parent: ActivatedRouteSnapshot = null;
  private params: object = {};
  private data: object = {};

  public withParent(parent: ActivatedRouteSnapshot): TestRouteSnapshotBuilder {
    this.parent = parent;
    return this;
  }

  public withParams(params: object): TestRouteSnapshotBuilder {
    this.params = params;
    return this;
  }

  public withData(data: object): TestRouteSnapshotBuilder {
    this.data = data;
    return this;
  }

  public build(): ActivatedRouteSnapshot {
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

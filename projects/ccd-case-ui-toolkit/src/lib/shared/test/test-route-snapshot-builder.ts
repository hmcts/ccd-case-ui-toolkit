import { ActivatedRouteSnapshot } from '@angular/router';

export class TestRouteSnapshotBuilder {
  private parent: ActivatedRouteSnapshot = null;
  private params: object = {};
  private data: object = {};

  public withParent(parent: ActivatedRouteSnapshot): this {
    this.parent = parent;
    return this;
  }

  public withParams(params: object): this {
    this.params = params;
    return this;
  }

  public withData(data: object): this {
    this.data = data;
    return this;
  }

  public build(): ActivatedRouteSnapshot {
    return {
      url: [],
      title: '',
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

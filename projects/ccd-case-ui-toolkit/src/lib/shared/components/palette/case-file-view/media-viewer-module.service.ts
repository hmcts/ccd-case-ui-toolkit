import { createNgModule, EnvironmentInjector, Injectable, NgModuleRef, OnDestroy, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaViewerModuleService implements OnDestroy {
  private moduleRef: NgModuleRef<unknown>;

  constructor(private readonly environmentInjector: EnvironmentInjector) {}

  public getModuleRef(moduleType: Type<unknown>): NgModuleRef<unknown> {
    // Keep the viewer's NgRx feature registered while its asynchronous work settles after navigation.
    this.moduleRef ??= createNgModule(moduleType, this.environmentInjector);
    return this.moduleRef;
  }

  public ngOnDestroy(): void {
    this.moduleRef?.destroy();
  }
}

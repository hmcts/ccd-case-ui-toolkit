import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CaseUIToolkitModule } from './case-ui-toolkit.module';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CaseUIToolkitModule)
  .catch(err => console.error(err));

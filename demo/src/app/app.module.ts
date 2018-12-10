import { NgModule, Inject, PLATFORM_ID, APP_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, isPlatformBrowser, APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { AppConfig } from './app.config';
import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { CaseUIToolkitModule, DraftService, AlertService, HttpService, AuthService, CasesService,
  HttpErrorService, AbstractAppConfig, CaseEditWizardGuard, RouterHelperService,
  PlaceholderResolverService, DocumentManagementService, PageValidationService} from '@hmcts/ccd-case-ui-toolkit';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CoreComponent } from './core.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    routing,
    CaseUIToolkitModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    CoreComponent,
    CaseCreateConsumerComponent,
    CaseProgressConsumerComponent,
  ],
  providers: [
    CasesService,
    AuthService,
    HttpService,
    HttpErrorService,
    AlertService,
    DraftService,
    PlaceholderResolverService,
    PageValidationService,
    CaseEditWizardGuard,
    RouterHelperService,
    DocumentManagementService,
    ScrollToService,
    AppConfig,
    {
      provide: AbstractAppConfig,
      useExisting: AppConfig
    },
    {
      provide: APP_BASE_HREF, useValue : '/'
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}

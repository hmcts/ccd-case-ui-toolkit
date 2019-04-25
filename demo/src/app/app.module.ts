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
  HttpErrorService, AbstractAppConfig, CaseEditWizardGuard, RouterHelperService, PlaceholderService,
  DocumentManagementService, PageValidationService, SearchService, RequestOptionsBuilder, CreateCaseFiltersModule,
  CaseTimelineModule, WorkbasketFiltersModule, CaseListFiltersModule } from '@hmcts/ccd-case-ui-toolkit';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CoreComponent } from './core.component';
import { CaseViewConsumerComponent } from './case-view-consumer.component';
import { SearchFiltersConsumerComponent } from './search-filters-consumer.component';
import { CreateCaseFiltersConsumerComponent } from './create-case-filters-consumer.component';
import { CaseTimelineConsumerComponent } from './case-timeline-consumer.component';
import { CaseListFiltersConsumerComponent } from './case-list-filters-consumer.component';
import { WorkbasketFiltersConsumerComponent } from './workbasket-filters-consumer.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    CaseUIToolkitModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    HttpModule,
    CreateCaseFiltersModule,
    CaseTimelineModule,
    routing,
    WorkbasketFiltersModule,
    CaseListFiltersModule
  ],
  declarations: [
    AppComponent,
    CoreComponent,
    CaseCreateConsumerComponent,
    CaseProgressConsumerComponent,
    CaseViewConsumerComponent,
    SearchFiltersConsumerComponent,
    CreateCaseFiltersConsumerComponent,
    CaseTimelineConsumerComponent,
    CaseListFiltersConsumerComponent,
    WorkbasketFiltersConsumerComponent,
  ],
  providers: [
    CasesService,
    AuthService,
    SearchService,
    RequestOptionsBuilder,
    HttpService,
    HttpErrorService,
    AlertService,
    DraftService,
    PlaceholderService,
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

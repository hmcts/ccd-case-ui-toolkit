import { APP_BASE_HREF, CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_ID, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  AbstractAppConfig, AlertService, AuthService, CaseEditWizardGuard, CaseListFiltersModule, CasesService, CaseTimelineModule, CaseUIToolkitModule, CreateCaseFiltersModule, DocumentManagementService, DraftService, HttpErrorService, HttpService, PageValidationService, PlaceholderService, RequestOptionsBuilder, RouterHelperService, SearchFiltersModule,
  SearchResultModule, SearchService, WorkbasketFiltersModule
} from '@hmcts/ccd-case-ui-toolkit';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppComponent } from './app.component';
import { AppConfig } from './app.config';
import { routing } from './app.routing';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { CaseListFiltersConsumerComponent } from './case-list-filters-consumer.component';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CaseTimelineConsumerComponent } from './case-timeline-consumer.component';
import { CaseViewConsumerComponent } from './case-view-consumer.component';
import { EventDetails } from './common/eventDetails.component';
import { CoreComponent } from './core.component';
import { CreateCaseFiltersConsumerComponent } from './create-case-filters-consumer.component';
import { SearchFiltersWrapperConsumerComponent } from './search-filters-wrapper-consumer.component';
import { SearchResultConsumerComponent } from './search-result-consumer.component';

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
    HttpClientModule,
    CreateCaseFiltersModule,
    CaseTimelineModule,
    routing,
    WorkbasketFiltersModule,
    CaseListFiltersModule,
    SearchFiltersModule,
    SearchResultModule,
    NgxPaginationModule
  ],
  declarations: [
    AppComponent,
    CoreComponent,
    CaseCreateConsumerComponent,
    CaseProgressConsumerComponent,
    CaseViewConsumerComponent,
    SearchFiltersWrapperConsumerComponent,
    CreateCaseFiltersConsumerComponent,
    CaseTimelineConsumerComponent,
    CaseListFiltersConsumerComponent,
    SearchResultConsumerComponent,
    EventDetails
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
  ]
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

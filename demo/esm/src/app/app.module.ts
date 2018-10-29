import { NgModule, Inject, PLATFORM_ID, APP_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, isPlatformBrowser, APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { CaseUIToolkitModule } from '../../lib/case-ui-toolkit.module';
// import { ConditionalShowModule } from '../../lib/shared/conditional-show/conditional-show.module';
// import { LabelSubstitutorModule } from '../../lib/shared/substitutor/label-substitutor.module';
// import { MarkdownModule } from '../../lib/shared/markdown/markdown.module';
// import { PaletteModule } from '../../lib/shared/palette/palette.module';
// import { SharedUtilsModule } from '../../lib/shared/utils/shared-utils.module';
// import { CaseReferencePipe } from '../../lib/shared/utils/case-reference.pipe';
// import { FieldsPurger } from '../../lib/shared/utils/fields.purger';
// import { LabelSubstitutionService } from '../../lib/shared/case-editor/label-substitution.service';
// import { PageValidationService } from '../../lib/shared/case-editor/page-validation.service';
// import { FormValueService } from '../../lib/shared/form/form-value.service';
// import { FormErrorService } from '../../lib/shared/form/form-error.service';
// import { AddressesService } from '../../lib/shared/domain/addresses/addresses.service';
// import { YesNoService } from '../../lib/shared/palette/yes-no/yes-no.service';
// import { OrderService } from '../../lib/shared/domain/order/order.service';
import { DraftService } from '../../lib/shared/draft/draft.service';
import { AlertService } from '../../lib/shared/alert/alert.service';
import { HttpService } from '../../lib/shared/http/http.service';
import { AuthService } from '../../lib/shared/auth/auth.service';
// import { PaletteService } from '../../lib/shared/palette/palette.service';
// import { FormValidatorsService } from '../../lib/shared/form/form-validators.service';
// import { CaseFieldService } from '../../lib/shared/domain/case-field.service';
import { CasesService } from '../../lib/shared/cases/cases.service';
import { HttpErrorService } from '../../lib/shared/http/http-error.service';
import { AppConfig } from './app.config';
import { AbstractAppConfig } from '../../lib/app.config';
import { routing } from './app.routing';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    routing,
    CaseUIToolkitModule,
    RouterModule,
    CommonModule,
    // ConditionalShowModule,
    FormsModule,
    // LabelSubstitutorModule,
    // MarkdownModule,
    // PaletteModule,
    ReactiveFormsModule,
    // SharedUtilsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    CaseCreateConsumerComponent
  ],
  providers: [
  //   CaseReferencePipe,
    CasesService,
  //   CaseFieldService,
  //   FormValidatorsService,
  //   PaletteService,
    AuthService,
    HttpService,
    HttpErrorService,
    AlertService,
    DraftService,
  //   OrderService,
  //   YesNoService,
  //   AddressesService,
  //   FormErrorService},
  //   FormValueService,
  //   FieldsPurger,
  //   LabelSubstitutionService,
  //   PageValidationService,
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

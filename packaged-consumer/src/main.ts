import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HeadersModule } from '@hmcts/ccd-case-ui-toolkit';
import { RpxTranslationConfig, RpxTranslationModule } from 'rpx-xui-translation';

@Component({
  selector: 'consumer-root',
  imports: [HeadersModule],
  template: '<cut-header-bar title="Packaged toolkit consumer" username="consumer@example.test" />'
})
class ConsumerRoot {}

bootstrapApplication(ConsumerRoot, {
  providers: [importProvidersFrom(RpxTranslationModule.forRoot(new RpxTranslationConfig()))]
});

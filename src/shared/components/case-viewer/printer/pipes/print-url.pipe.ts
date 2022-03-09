import { Pipe, PipeTransform } from '@angular/core';
import { AbstractAppConfig } from '../../../../../app.config';

@Pipe({
  name: 'ccdPrintUrl'
})
export class PrintUrlPipe implements PipeTransform {

  private static readonly MSIE_BROWSER_NAME = 'MSIE';
  private static readonly IE11_BROWSER_ENGINE = 'Trident';

  constructor(private appConfig: AbstractAppConfig) {}

  /**
   * Takes a "remote" Print Service URL (for example, as returned by calling the `/documents` CCD endpoint) and
   * rewrites it into a "local", application-specific URL for the front-end. The resulting URL is of the form:
   *
   * Configurable "Local URL" (e.g. `/print`) + _pathname_ from original "remote URL"
   * (e.g. `/jurisdictions/TEST/case-types/Test1/cases/1111222233334444`)
   *
   * @param remoteUrl The "remote" URL to rewrite
   * @returns A rewritten URL as per the above description, or the original `remoteUrl` if it is `null`, `undefined`,
   * or the empty string
   */
  transform(remoteUrl: string): string {
    if (remoteUrl && remoteUrl.length > 0) {
      let printServiceUrlPathname: string;

      /**
       * Check navigator.userAgent to see if the browser is IE or not. Check for either the browser name, "MSIE", or
       * the rendering engine, "Trident" (used to identify IE 11 because it no longer reports as "MSIE").
       * Note: IE does not support the URL interface and requires a workaround to parse URLs.
       */
      if (navigator.userAgent.indexOf(PrintUrlPipe.MSIE_BROWSER_NAME) !== -1 ||
          navigator.userAgent.indexOf(PrintUrlPipe.IE11_BROWSER_ENGINE) !== -1) {
        // Workaround for not being able to use the URL interface
        const urlParser = document.createElement('a');
        urlParser.href = remoteUrl;
        // Get the pathname from the anchor element with the "remote" Print Service URL
        printServiceUrlPathname = urlParser.pathname;
        if (printServiceUrlPathname[0] !== '/') {
          // Fix for IE11; it returns the pathname without leading slash
          printServiceUrlPathname = '/' + printServiceUrlPathname;
        }
      } else {
        // Get the pathname parsed from the "remote" Print Service URL object
        printServiceUrlPathname = new URL(remoteUrl).pathname;
      }

      // Return an amended URL comprising the "local" Print Service URL (usually /print) and the "remote" pathname
      return this.appConfig.getPrintServiceUrl() + printServiceUrlPathname;
    }

    return remoteUrl;
  }
}

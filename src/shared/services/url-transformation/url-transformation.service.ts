import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class UrlTransformationService {
  // Key/value pair of internal/external application names
  public static readonly APPLICATION_NAME_MAPPINGS = {
    'ccd-case-management-web': 'ccd'
  };

  public static readonly APPLICATION_NAME_PLACEHOLDER = '{{APPLICATION_NAME}}';
  public static readonly ENV_PLACEHOLDER = '{{ENV}}';

  public static readonly INTERNAL_PATTERN = '(?:https:\/\/)(.*)-(.*)\\.service\\.core-compute-(.*)\\.internal(.*)';
  public static readonly EXTERNAL_PATTERN = '(?:https:\/\/)?www-(.*)\\.(.*)\\.platform\\.hmcts\\.net(.*)';

  public static readonly EXTERNAL_TEMPLATE =
    `https://www-${UrlTransformationService.APPLICATION_NAME_PLACEHOLDER}.${UrlTransformationService.ENV_PLACEHOLDER}.platform.hmcts.net`;
  public static readonly INTERNAL_TEMPLATE =
    `https://${UrlTransformationService.APPLICATION_NAME_PLACEHOLDER}-${UrlTransformationService.ENV_PLACEHOLDER}` +
    `.service.core-compute-${UrlTransformationService.ENV_PLACEHOLDER}.internal`;

  private document: Document;

  constructor(@Inject(DOCUMENT) document: any) {
    this.document = document as Document;
  }

  getPreferredEquivalentOf(target: string): string {
    const isCurrentUrlInternal = this.isInternalUrl(this.document.URL);
    const isTargetUrlInternal = this.isInternalUrl(target);
    const isTargetUrlExternal = this.isExternalUrl(target);

    if ((isCurrentUrlInternal === isTargetUrlInternal)
        || (!isTargetUrlInternal && !isTargetUrlExternal)) {
      return target;
    }

    if (isCurrentUrlInternal) {
      return this.getInternalUrlOf(target);
    } else {
      return this.getExternalUrlOf(target);
    }
  }

  isInternalUrl(url: string) {
    return this.isMatchFound(url, new RegExp(UrlTransformationService.INTERNAL_PATTERN, 'i'));
  }

  isExternalUrl(url: string) {
    return this.isMatchFound(url, new RegExp(UrlTransformationService.EXTERNAL_PATTERN, 'i'));
  }

  private isMatchFound(url: string, pattern: RegExp): boolean {
    const matches = url.match(pattern);
    return matches && matches.length > 0;
  }

  private getInternalUrlOf(externalUrl: string): string {
    const matches = externalUrl.match(new RegExp(UrlTransformationService.EXTERNAL_PATTERN, 'i'));
    const key = this.getKeyByValue(UrlTransformationService.APPLICATION_NAME_MAPPINGS, matches[1]);
    return this.formUrl(UrlTransformationService.INTERNAL_TEMPLATE, key ? key : matches[1], matches[2], matches[3]);
  }

  private getExternalUrlOf(internalUrl: string): string {
    const matches = internalUrl.match(new RegExp(UrlTransformationService.INTERNAL_PATTERN, 'i'));
    const value = UrlTransformationService.APPLICATION_NAME_MAPPINGS[matches[1]];
    return this.formUrl(UrlTransformationService.EXTERNAL_TEMPLATE, value ? value : matches[1], matches[2], matches[4]);
  }

  private formUrl(template: string, appName: string, env: string, segments: string): string {
    return template
      .replace(new RegExp(UrlTransformationService.APPLICATION_NAME_PLACEHOLDER, 'g'), appName)
      .replace(new RegExp(UrlTransformationService.ENV_PLACEHOLDER, 'g'), env)
      + (segments || '');
  }

  private getKeyByValue(object, value: string): string {
    return Object.keys(object).find(key => object[key] === value);
  }

}

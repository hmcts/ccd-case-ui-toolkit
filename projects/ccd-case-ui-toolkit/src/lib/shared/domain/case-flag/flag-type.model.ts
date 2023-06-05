// tslint:disable:variable-name
/**
 * DTO to provide typing of the response from the Reference Data Common API for Case Flags data.
 *
 * @see {@link https://tools.hmcts.net/confluence/pages/viewpage.action?pageId=1525476616#CaseFlagsHLDVersion1.0-Output}
 * for full details
 */
export class FlagType {
  public name: string;
  public hearingRelevant: boolean;
  public flagComment: boolean;
  public flagCode: string;
  public isParent: boolean;
  // Note: property is deliberately spelt "Path" and not "path" because the Reference Data Common API returns the former
  public Path: string[];
  public childFlags: FlagType[];
  public listOfValuesLength = 0;
  public listOfValues: {key: string, value: string}[] = [];
}

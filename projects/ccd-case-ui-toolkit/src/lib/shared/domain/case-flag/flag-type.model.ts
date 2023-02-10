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

  public static searchPathByFlagTypeObject(singleFlag: FlagType, flags: FlagType[], path: FlagType[] = []): [FlagType | undefined, FlagType[]] {
    for (const flag of flags) {
      if (flag.flagCode === singleFlag.flagCode && flag.Path.join(',') === singleFlag.Path.join(',')) {
        return [flag, path];
      }
      if (flag.childFlags?.length) {
        const [result, childPath] = FlagType.searchPathByFlagTypeObject(singleFlag, flag.childFlags, [...path, flag]);
        if (result) {
          return [result, childPath];
        }
      }
    }
    return [undefined, []];
  }
}

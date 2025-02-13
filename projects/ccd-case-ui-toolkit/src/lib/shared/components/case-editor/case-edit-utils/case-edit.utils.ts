
export function convertNonASCIICharacter(character: string): string {
  if (character === '£') {
    // pound sign will be frequently used and works for btoa despite being non-ASCII
    // note: this could be done for other characters provided they work for btoa()
    return character;
  }
  // Note: Will convert to HTML entity
  return CaseEditUtils.PREFIX + character.charCodeAt(0) + CaseEditUtils.SUFFIX;
}

export class CaseEditUtils {

  public static readonly PREFIX = '&#';
  public static readonly SUFFIX = ';';

  public convertNonASCIICharacters(rawString: string): string {
    return rawString ? rawString.replace(/[^\x20-\x7E]/g, function (c) {
      return convertNonASCIICharacter(c);
    }) : '';
  }

  public convertHTMLEntities(editedString: string): string {
    const revertedCharacterList = editedString.split(CaseEditUtils.PREFIX);
    let rawString = revertedCharacterList[0];
    for (let index = 1; index < revertedCharacterList.length; index++) {
      const currentSection = revertedCharacterList[index];
      if (!currentSection.includes(CaseEditUtils.SUFFIX)) {
        return rawString.concat(currentSection);
      } else {
        const suffixSplitList = currentSection.split(CaseEditUtils.SUFFIX);
        const characterCode = Number(suffixSplitList[0]);
        rawString = rawString.concat(String.fromCharCode(characterCode), suffixSplitList[1]);
      }
    }
    return rawString;
  }
}

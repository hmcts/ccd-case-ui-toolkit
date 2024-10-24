
export function editNonASCIICharacter(character: string): string {
  if (character === '£') {
    // pound sign will be frequently used and works for btoa despite being non-ASCII
    // note: this could be done for other characters provided they work for btoa()
    return character;
  }
  // Note: The prefix is made 
  return CaseEditUtils.PREFIX + character.charCodeAt(0) + CaseEditUtils.SUFFIX;
}

export class CaseEditUtils {

  // Note: Made these purposely odd to avoid possible data conflicts
  public static readonly PREFIX = '&#{';
  public static readonly SUFFIX = '}&;';

  public editNonASCIICharacters(rawString: string): string {
    return rawString ? rawString.replace(/[^\x20-\x7F]/g, function (c) {
      return editNonASCIICharacter(c);
    }) : '';
  }

  public revertEditNonASCIICharacters(editedString: string): string {
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

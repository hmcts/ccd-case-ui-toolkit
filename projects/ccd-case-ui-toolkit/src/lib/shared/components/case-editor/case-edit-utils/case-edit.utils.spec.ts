import { CaseEditUtils, editNonASCIICharacter } from "./case-edit.utils";

describe('CaseEditUtils', () => {
  const caseUtils: CaseEditUtils = new CaseEditUtils();
  const LONG_ASCII_STRING = 'abcdefghijklmnopqrstuvwxyz1234567890!@£$%^&*()-=[];\,./`<>?:"|{}_+';
  const LONG_PRE_STRING: string = 'Examples of non-ASCII characters: éこ¥🌍';
  const LONG_POST_STRING: string = 'Examples of non-ASCII characters: &#{233}&;&#{12371}&;&#{165}&;&#{55356}&;&#{57101}&;';

  describe('editNonASCIICharacters', () => {

    it('should not edit undefined', () => {
      // Note: Should never happen
      const response = caseUtils.editNonASCIICharacters(undefined);
      expect(response).toEqual('');
    });

    it('should not edit an empty string', () => {
      const mockString = '';
      const response = caseUtils.editNonASCIICharacters(mockString);
      expect(response).toEqual(mockString);
    });

    it('should note edit ASCII characters', () => {
      // note: string includes £ (non-ASCII) which should not be edited
      const response = caseUtils.editNonASCIICharacters(LONG_ASCII_STRING);
      expect(response).toEqual(LONG_ASCII_STRING);
    });

    it('should not edit £ (non ASCII)', () => {
      const mockString = 'Cost: £2.50';
      const response = caseUtils.editNonASCIICharacters(mockString);
      expect(response).toEqual(mockString);
    });

    it('should edit ASCII characters', () => {
      // Summarises with copied mock string
      const response = caseUtils.editNonASCIICharacters(LONG_PRE_STRING);
      expect(response).toEqual(LONG_POST_STRING);

      // Goes deeper into what should be happening just in case
      const chineseCharacter = '漢';
      const secondMockString = 'Examples of non-ASCII characters: ' + chineseCharacter;
      const editedSecondMockString = 
      `Examples of non-ASCII characters: ${CaseEditUtils.PREFIX + chineseCharacter.charCodeAt(0) + CaseEditUtils.SUFFIX}`;
      const secondResponse = caseUtils.editNonASCIICharacters(secondMockString);
      expect(secondResponse).toEqual(editedSecondMockString);
    });
  });

  describe('revertEditNonASCIICharacters', () => {

    it('should not revert strings without the prefix and/or suffix', () => {
      const mockString = 'Hello World!';
      const response = caseUtils.revertEditNonASCIICharacters(mockString);
      expect(response).toEqual(mockString);
    });

    it('should revert relevant strings', () => {
      const response = caseUtils.revertEditNonASCIICharacters(LONG_POST_STRING);
      expect(response).toEqual(LONG_PRE_STRING);
    });
  });

});

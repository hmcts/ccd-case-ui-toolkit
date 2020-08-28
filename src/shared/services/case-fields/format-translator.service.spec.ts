import { FormatTranslatorService } from './format-translator.service';

describe('FormatTranslatorService', () => {

  let formatTranslator: FormatTranslatorService = new FormatTranslatorService();
  describe('FormatTranslator translates date formats from Java to Angular formatDate', () => {

    it('should pass through normal date strings', () => {
      expect(formatTranslator.translate('dd MMM yyyy HH:mm:ss')).toBe('dd MMM yyyy HH:mm:ss');
    });
    it('should translate unhandled characters', () => {
      expect(formatTranslator.translate('DYecFKkVOxX')).toBe('dyEEWHhzzZZ');
    });
    it('should reject AnN', () => {
      expect(formatTranslator.translate('AnN')).toBe('***A******n******N***');
    });
    it ('should ignore the contents of quoted strings', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM yyyy' cool date format bro dd MMM yyyy'")).toBe('dd MMM yyyy')
    })
    it ('should ignore quoted strings in the middle', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM ' cool date format bro dd MMM yyyy'yyyy")).toBe('dd MMM yyyy')
    })
    it ('should ignore multiple quoted strings', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM yyyy' cool' 'date' 'format bro dd MMM yyyy'")).toBe('dd MMM yyyy  ')
    })
    it ('should ignore escaped single quotes', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM ''yyyy''")).toBe('dd MMM yyyy')
    })
  });
})

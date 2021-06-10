import { FormatTranslatorService } from './format-translator.service';

describe('FormatTranslatorService', () => {

  let formatTranslator: FormatTranslatorService = new FormatTranslatorService();
  describe('FormatTranslator translates date formats from Java to Angular formatDate', () => {

    it('should pass through normal date strings', () => {
      expect(formatTranslator.translate('dd MMM yyyy HH:mm:ss')).toBe('DD MMM yyyy HH:mm:ss');
    });
    it('should translate unhandled characters', () => {
      expect(formatTranslator.translate('dYecFKkVOxX')).toBe('DYEEWHhzzZZ');
    });
    it('should reject AnN', () => {
      expect(formatTranslator.translate('AnN')).toBe('A***n******N***');
    });
    it ('should ignore the contents of quoted strings', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM yyyy' cool date format bro dd MMM yyyy'")).toBe('DD MMM yyyy')
    })
    it ('should ignore quoted strings in the middle', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM ' cool date format bro dd MMM yyyy'yyyy")).toBe('DD MMM yyyy')
    })
    it ('should ignore multiple quoted strings', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM yyyy' cool' 'date' 'format bro dd MMM yyyy'")).toBe('DD MMM yyyy  ')
    })
    it ('should ignore escaped single quotes', () => {
      // tslint:disable-next-line:quotemark
      expect(formatTranslator.translate("dd MMM ''yyyy''")).toBe('DD MMM yyyy')
    })

    it ('should remove time', () => {
      expect(formatTranslator.removeTime('YYYY/MM/DD hh:mm:ss')).toBe('YYYY/MM/DD');
    });

    it ('should check if date present', () => {
      expect(formatTranslator.hasDate('YYYY/MM/DD')).toBe(true);
      expect(formatTranslator.hasDate('hh:mm:ss')).toBe(false);
    });

    it ('should check if 24 hour time', () => {
      expect(formatTranslator.is24Hour('HH:mm:ss')).toBe(true);
      expect(formatTranslator.is24Hour('hh:mm:ss')).toBe(false);
    });

    it ('should check if there is no day present', () => {
      expect(formatTranslator.hasNoDay('YYYY/MM')).toBe(true);
      expect(formatTranslator.hasNoDay('YYYY/MM/DD')).toBe(false);
    });

    it ('should check if there is no day and no month present', () => {
      expect(formatTranslator.hasNoDayAndMonth('YYYY')).toBe(true);
      expect(formatTranslator.hasNoDayAndMonth('YYYY/MM/DD')).toBe(false);
      expect(formatTranslator.hasNoDayAndMonth('YYYY/MM')).toBe(false);
      expect(formatTranslator.hasNoDayAndMonth('YYYY/DD')).toBe(false);
    });

    it ('should check if there are hours present', () => {
      expect(formatTranslator.hasHours('hh')).toBe(true);
      expect(formatTranslator.hasHours('HH')).toBe(true);
      expect(formatTranslator.hasHours('mm:ss')).toBe(false);
    });

    it ('should check if there are minutes present', () => {
      expect(formatTranslator.hasMinutes('HH:mm')).toBe(true);
      expect(formatTranslator.hasMinutes('HH')).toBe(false);
    });

    it ('should check if there are seconds present', () => {
      expect(formatTranslator.hasSeconds('ss')).toBe(true);
      expect(formatTranslator.hasSeconds('HH:mm')).toBe(false);
      expect(formatTranslator.hasSeconds('SS')).toBe(true);
    });
  });
})

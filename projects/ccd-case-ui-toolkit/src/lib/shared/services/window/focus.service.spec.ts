import { FocusService } from "./focus.service";

describe('FocusService', () => {
    
    it('does nothing when no element found', () => {

        spyOn(document, 'getElementById').and.returnValue(null);
        
        const focusService = new FocusService();
        focusService.focus();

        expect(document.getElementById).toHaveBeenCalledWith(focusService.elementIdToFocus);
    });

    it('focuses on the found element', () => {

        const elementToFocus = jasmine.createSpyObj('elementToFocus', ['focus']);
        spyOn(document, 'getElementById').and.returnValue(elementToFocus);
        
        const focusService = new FocusService();
        focusService.focus();

        expect(document.getElementById).toHaveBeenCalledWith(focusService.elementIdToFocus);
        expect(elementToFocus.focus).toHaveBeenCalled();
    });
});


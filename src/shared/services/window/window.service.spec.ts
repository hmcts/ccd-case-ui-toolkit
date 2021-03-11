import { WindowService } from './window.service';

describe('WindowService',() => {

    let windowService : WindowService = new WindowService();
    let userName="test user";

    it('should be set local storage',()=>{
        windowService.setLocalStorage('user', userName)
        expect(windowService.getLocalStorage('user')).toBe("test user"); 
        expect(windowService.getLocalStorage('user')).toBe("test user"); 
        expect(windowService.removeLocalStorage('user')).toBeUndefined();   
        expect(windowService.getLocalStorage('user')).toBeNull();       
    })

    it('should be set local storage',()=>{
        windowService.setLocalStorage('user', userName)
        expect(windowService.getLocalStorage('user')).toBe("test user"); 
        expect(windowService.getLocalStorage('user')).toBe("test user"); 
        expect(windowService.clearLocalStorage()).toBeUndefined(); 
        expect(windowService.getLocalStorage('user')).toBeNull();                       
    })

    it('should be set local storage when null',()=>{
        windowService.setLocalStorage('user', null);
        expect(windowService.getLocalStorage('user')).toBe('null'); 
        expect(windowService.removeLocalStorage('user')).toBeUndefined();   
  
    })

    it('should be set local storage when empty',()=>{
        windowService.setLocalStorage('user', '');
        expect(windowService.getLocalStorage('user')).toBe('');
        expect(windowService.removeLocalStorage('user')).toBeUndefined();   
    })

})
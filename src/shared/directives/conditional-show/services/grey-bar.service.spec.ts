import { async } from '@angular/core/testing';
import createSpyObj = jasmine.createSpyObj;
import { GreyBarService } from './grey-bar.service';
import { RendererFactory2 } from '@angular/core';

let greyBarService: GreyBarService;

describe('GreyBarService', () => {

  const rendererFactory2 = createSpyObj<RendererFactory2>('rendererFactoryMock', ['createRenderer']);

  beforeEach( async(() => {
    greyBarService = new GreyBarService(rendererFactory2);
  }));

  it('test add toggled to show', () => {
    greyBarService.addToggledToShow('id1');

    expect(greyBarService.wasToggledToShow('id1')).toBeTruthy();
  });

  it('test remove toggled to show', () => {
    greyBarService.addToggledToShow('id1');
    greyBarService.removeToggledToShow('id1');

    expect(greyBarService.wasToggledToShow('id1')).toBeFalsy();
  });
});

import { QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';

describe('', () => {
  let component: TabsComponent;

  it('should create a new instance', () => {
    component = new TabsComponent({} as ActivatedRoute);
    expect(component).toBeTruthy();
  });

  describe('show', () => {
    it('should update 1st panel component to selected true', () => {
      const obj = [{ id: '0' } as TabComponent, { id: '1' } as TabComponent] ;
      component = new TabsComponent({} as ActivatedRoute);
      component.panels = {
        toArray: () => obj as unknown as TabComponent[]
      } as unknown as QueryList<TabComponent>;

      component.show('0');

      expect(obj).toEqual([{ id: '0', selected: true } as TabComponent, { id: '1', selected: false } as TabComponent] );
    });

    it('should update 1st panel component to selected true when param is null', () => {
      const obj = [{ id: '0' } as TabComponent, { id: '1' } as TabComponent] ;
      component = new TabsComponent({} as ActivatedRoute);
      component.panels = {
        toArray: () => obj as unknown as TabComponent[]
      } as unknown as QueryList<TabComponent>;

      component.show(null);

      expect(obj).toEqual([{ id: '0', selected: true } as TabComponent, { id: '1', selected: false } as TabComponent] );
    });
  });
});

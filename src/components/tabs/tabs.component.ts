import { Component, QueryList, ContentChildren, ElementRef, ViewChildren, AfterContentInit } from '@angular/core';
import { TabComponent } from './tab.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cut-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: [
    './tabs.component.scss'
  ],
})
export class TabsComponent implements AfterContentInit {

  @ViewChildren('tab')
  public tabs: QueryList<ElementRef>;

  @ContentChildren(TabComponent)
  public panels: QueryList<TabComponent>;

  private panelIds: string[] = [];

  constructor(private route: ActivatedRoute) {}

  public ngAfterContentInit(): void {
    this.panels.forEach((panel) => this.panelIds.push(panel.id));
  }

  public show(id: string) {
    const panels: TabComponent[] = this.panels.toArray();
    if (0 > this.panelIds.indexOf(id)) {
      id = panels[0].id;
    }
    panels.forEach(panel => panel.selected = id === panel.id);
  }

  setTabFocus(id: string) {
      const selectedTab = this.tabs.find((element, index) => index === this.panelIds.indexOf(id));
      selectedTab.nativeElement.focus();
  }

  handleKeyUp(event: KeyboardEvent, id: string) {
    const panels: TabComponent[] = this.panels.toArray();
    switch (event.key) {
      case 'ArrowLeft':
        if (this.panelIds.indexOf(id) > 0) {
          id = panels[this.panelIds.indexOf(id) - 1].id;
        }
        this.setTabFocus(id);
        break;

      case 'ArrowRight':
        if (this.panelIds.indexOf(id) < this.panelIds.length - 1) {
          id = panels[this.panelIds.indexOf(id) + 1].id;
        }
        this.setTabFocus(id);
        break;

      case 'Enter': case ' ': // 'Space' is not recognised - we have to check the space character
        this.show(id);
        break;
    }
  }
}

import { AfterContentInit, Component, ContentChildren, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabComponent } from './tab.component';

@Component({
  selector: 'cut-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: [
    './tabs.component.scss'
  ],
})
export class TabsComponent implements AfterContentInit {

  @ViewChildren('tab') public tabs!: QueryList<ElementRef>;

  @ContentChildren(TabComponent)
  public panels: QueryList<TabComponent>;

  private readonly panelIds: string[] = [];

  constructor(private readonly route: ActivatedRoute) {}

  public ngAfterContentInit(): void {
    this.panels.forEach((panel) => this.panelIds.push(panel.id));

    this.show(this.route.snapshot.fragment);
  }

  public show(id: string) {
    const panels: TabComponent[] = this.panels.toArray();

    id = id || panels[0].id;

    if (0 > this.panelIds.indexOf(id)) {
      id = panels[0].id;
    }

    panels.forEach((panel) => panel.selected = id === panel.id);
  }
}

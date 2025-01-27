import { EntityApp } from "../EntityApp.js";

export class ProximityRegionApp extends EntityApp<"region"> {
  constructor(app, html, data) {
    super(app, html, data, "region");
  }

  content(tabData: TabData) {
    tabData.content = `
  <header class="region-element flexrow">
    <div class="region-element-name">${tabData.name}</div>
    <div class="region-element-controls">
      <a class="control" data-action="createProxmityActivity" data-tooltip="" aria-label="Create new Activity">
        <i class="fa-solid fa-plus"></i>
        ${tabData.icon}
      </a>
    </div>
  </header>
  ${tabData.content}
  `;
  }

  activateHandler() {
    super.activateHandler()
    this.element.find("a.control[data-action=\"createProxmityActivity\"]").on("click", (event) => {
      super.onAddActivity();
    })
  }
}
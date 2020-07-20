class Tools {
  constructor() {
    Tools.toolbox = window.app.tools;
    Tools.toolbox.pencil.activate();
    this.activeTool = Tools.toolbox.pencil;
  }

  switchTo(tool) {
    if (tool in Tools.toolbox) {
      Tools.toolbox[tool].activate();
      this.activeTool = Tools.toolbox[tool];
    } else if (tool !== 'pointer') {
      window.app.deselectOnToolChange();
    }
  }
}

export default Tools;

class Tools {
  constructor() {
    Tools.toolbox = window.app.tools;
    Tools.toolbox.pencil.activate();
    this.activeTool = Tools.toolbox.pencil;
  }

  switchTo(tool) {
    if (this.activeTool == 'pointer' && tool != 'pointer') {
      console.log('bb')
      window.app.deselect();
    }
    if (tool in Tools.toolbox) {
      Tools.toolbox[tool].activate();
      this.activeTool = Tools.toolbox[tool];
    }
  }
}

export default Tools;

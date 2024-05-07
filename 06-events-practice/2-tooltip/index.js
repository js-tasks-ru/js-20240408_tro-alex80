class Tooltip {
  static instance = null;

  constructor() {
    if (Tooltip.instance !== null) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize () {
    this.element = this.createElement();
    this.addEvents();
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'tooltip';
    return element;
  }

  addEvents() {
    document.addEventListener('pointerover', this.handlerPointerOver);
    document.addEventListener('pointermove', this.handlerPointerMove);
    document.addEventListener('pointerout', this.handlerPointerOut);
  }

  removeEvents() {
    document.removeEventListener('pointerover', this.handlerPointerOver);
    document.removeEventListener('pointermove', this.handlerPointerMove);
    document.removeEventListener('pointerout', this.handlerPointerOut);
  }

  handlerPointerOver = (event) => {
    const text = event.target.dataset.tooltip;
    if (!text) return;
    this.render(text);
  }

  handlerPointerMove = (event) => {
    const text = event.target.dataset.tooltip;
    if (!text) return;

    this.element.style.top = event.clientY + 'px';
    this.element.style.left = event.clientX + 'px';
  }

  handlerPointerOut = (event) => {
    const text = event.target.dataset.tooltip;

    if (text) return;
    this.element.remove();
  }

  render(text = '') {
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  destroy() {
    this.element.remove();
    this.removeEvents();
  }
}

export default Tooltip;

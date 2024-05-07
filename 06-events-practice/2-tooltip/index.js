class Tooltip {
  static instance = null;
  events = ['pointerover', 'pointermove', 'pointerout']

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
    this.events.map(event =>
      document.addEventListener(event, this.handlerPointer));
  }

  removeEvents() {
    this.events.map(event =>
      document.removeEventListener(event, this.handlerPointer));
  }

  handlerPointer = (event) => {
    const text = event.target.dataset.tooltip;

    if (event.type === 'pointerover' && text) {
      this.render(text);
    }

    if (event.type === 'pointermove' && text) {
      this.element.style.top = event.clientY + 'px';
      this.element.style.left = event.clientX + 'px';
    }

    if (event.type === 'pointerout' && !text) {
      this.element.remove();
    }
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

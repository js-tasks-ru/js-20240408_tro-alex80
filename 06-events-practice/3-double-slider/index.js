export default class DoubleSlider {
  element;
  subElements;
  constructor({
    min = 20,
    max = 100,
    formatValue = value => '$' + value,
    selected = {}} = {}) {
    // selected = {from: 25, to: 45}} = {}) {

    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.selected.from = this.curLeft = selected.from ?? min;
    this.selected.to = this.curRight = selected.to ?? max;
    this.render();
  }

  render() {
    this.element = this.createElement(this.createTemplate());
    this.subElements = this.getSubElements();
    document.addEventListener('pointerdown', this.handlePointerDown);
  }

  handlePointerMove = (event) => {
    const { thumbLeft, thumbRight, progress, inner, from, to } = this.subElements;
    const { width, left } = inner.getBoundingClientRect();

    const value = this.calcValue(event.clientX, left, width);

    if (!this.curThumbElem || value < this.min || value > this.max) return;

    if (this.curThumbElem === thumbLeft) {
      this.updateLeftThumb(value, from, thumbLeft, progress);
    }

    if (this.curThumbElem === thumbRight) {
      this.updateRightThumb(value, to, thumbRight, progress);
    }
  }

  calcValue(clientX, left, width) {
    return (clientX - left) * (this.max - this.min) / width + this.min;
  }

  updateLeftThumb(value, from, thumbLeft, progress) {
    this.curLeft = value;
    if (this.curLeft > this.curRight) return;
    from.textContent = this.formatValue(Math.round(value));

    const left = this.calcPosition(value, 'left');
    thumbLeft.style.left = progress.style.left = left + '%';
  }

  updateRightThumb(value, to, thumbRight, progress) {
    this.curRight = value;
    if (this.curRight < this.curLeft) return;
    to.textContent = this.formatValue(Math.round(value));

    const right = this.calcPosition(value, 'right');
    thumbRight.style.right = progress.style.right = right + '%';
  }

  calcPosition(value, thumb) {
    const totalRange = this.max - this.min;
    let distanceFromStart;

    if (thumb === 'left') {
      distanceFromStart = value - this.min;
    } else {
      distanceFromStart = this.max - value;
    }

    return (distanceFromStart / totalRange) * 100;
  }

  handlePointerDown = (event) => {
    event.preventDefault();
    this.curThumbElem = event.target;

    document.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('pointerup', this.handlePointerUp);
  }

  handlePointerUp = () => {
    this.dispatchRangeSelect();
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  // Next dispatch provide Range values 'from' 'to'
  dispatchRangeSelect() {
    const event = new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: this.curLeft,
        to: this.curRight,
      }
    });

    this.element.dispatchEvent(event);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, item) => {
      accum[item.dataset.element] = item;
      return accum;
    }, {});
  }

  createElement(template) {
    const elem = document.createElement('div');
    elem.innerHTML = template;
    return elem.firstElementChild;
  }

  createTemplate() {
    // this first setup needed if 'from', 'to' will be not equal to 'min/max' on start
    const left = this.calcPosition(this.curLeft, 'left');
    const right = this.calcPosition(this.curRight, 'right');
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.curLeft)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${left}%"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${right}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.curRight)}</span>
      </div>
    `;
  }

  removeEvents() {
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('pointerdown', this.handlePointerDown);
  }

  destroy() {
    this.element.remove();
    this.removeEvents();
  }
}

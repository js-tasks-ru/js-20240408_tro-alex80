export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = value => value
  } = {}) {
    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.element = this.createElement(this.createTemplate());
    this.getSubElements();
  }

  createElement(template) {
    const element = document.createElement('div');
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createLinkTemplate() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`;
    }
    return '';
  }

  createChartClasses() {
    return this.data.length ? 'column-chart' : 'column-chart column-chart_loading';
  }

  createTemplate() {
    return (`<div class="${this.createChartClasses()}" style="--chart-height: 50">
      <div class="column-chart__title">
        ${this.label}
        ${this.createLinkTemplate()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.formatHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.createChartBodyTemplate()}
        </div>
      </div>
    </div>`);
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = 50 / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  createChartBodyTemplate() {
    return this.getColumnProps().map(({value, percent}) => (
      `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
    )).join('');
  }

  update(newData) {
    this.data = newData;
    this.subElements.body.innerHTML = this.createChartBodyTemplate();
    this.element.className = this.createChartClasses();
  }

  getSubElements() {
    this.element.querySelectorAll('[data-element]').forEach(item => {
      this.subElements[item.dataset.element] = item;
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
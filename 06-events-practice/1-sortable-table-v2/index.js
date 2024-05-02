class SortableTableV1 {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.createElement(this.createTableTemplate());
    this.sortMarker = this.createElement(this.createMarkerTemplate());
    this.getSubElements();
  }

  createElement(template) {
    const element = document.createElement('div');
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTableTemplate() {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderTemplate()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.createBodyTemplate()}
      </div>
    </div>`;
  }

  createHeaderTemplate() {
    return this.headerConfig.map(item => `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>`
    ).join('');
  }

  createBodyTemplate() {
    return this.data.map(item => `
      <a href="#" class="sortable-table__row">
        ${this.createRowTemplate(item)}
      </a>`
    ).join('');
  }

  createRowTemplate(props) {
    return this.headerConfig.map(item => {
      if (item.template) {
        return item.template(props.images);
      }
      return `<div class="sortable-table__cell">${props[item.id]}</div>`;
    }).join('');
  }

  createMarkerTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getSubElements() {
    this.element.querySelectorAll('[data-element]').forEach(item => {
      this.subElements[item.dataset.element] = item;
    });
  }

  sort(fieldValue, orderValue) {
    // Return if column not sortable
    if (!this.headerConfig.find(item => item.id === fieldValue).sortable) return;

    this.getSortedData(fieldValue, orderValue);
    this.updateTableHeader(fieldValue, orderValue);
    this.updateTableBody();
  }

  getSortedData(fieldValue, orderValue) {
    const direction = {
      'asc': 1,
      'desc': -1,
    };

    const column = this.headerConfig.find(item => item.id === fieldValue);
    if (column.sortType === 'string') {
      this.data.sort((a, b) =>
        direction[orderValue] *
        a[fieldValue].localeCompare(b[fieldValue], 'ru-RU', {caseFirst: 'upper'}
        ));
    } else {
      this.data.sort((a, b) =>
        direction[orderValue] *
        (a[fieldValue] - b[fieldValue]));
    }
  }

  updateTableHeader(fieldValue, orderValue) {
    //TODO Why not needed to remove prev marker?
    const column = this.element.querySelector(`[data-id=${fieldValue}]`);
    column.append(this.sortMarker);
    column.dataset.order = orderValue;
  }

  updateTableBody() {
    this.element.querySelector('[data-element="body"]').innerHTML = this.createBodyTemplate();
  }

  destroy() {
    this.element.remove();
  }
}

export default class SortableTableV2 extends SortableTableV1 {
  defaultSortColumn = 'title';
  defaultSortOrder = 'asc';

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true
  } = {}) {
    super(headersConfig, data);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.sort(this.defaultSortColumn, this.defaultSortOrder);
    this.addTableEvents();
  }

  addTableEvents() {
    this.subElements.header.addEventListener('pointerdown', this.handleHeaderClick);
  }

  handleHeaderClick = (event) => {
    event.preventDefault();
    const column = event.target.closest('.sortable-table__cell').dataset;
    const order = column.order === 'desc' ? 'asc' : 'desc';

    this.isSortLocally ?
      this.sort(column.id, order) :
      this.sortOnServer(column.id, order) ;
  }

  sortOnServer(column, order) {
  //   TODO sorting on the server side
  }

  destroy() {
    super.destroy();
    this.removeTableEvents();
  }

  removeTableEvents() {
    this.subElements.header.removeEventListener('pointerdown', this.handleHeaderClick);
  }
}
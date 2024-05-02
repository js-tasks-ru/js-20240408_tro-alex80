import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

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
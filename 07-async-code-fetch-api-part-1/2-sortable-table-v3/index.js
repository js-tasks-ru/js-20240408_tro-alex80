import fetchJson from './utils/fetch-json.js';
import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";
const BACKEND_URL = 'https://course-js.javascript.ru';
// Use this.data and method from first base class = SortableTableV2 extends SortableTable
// js search for this.data in extended classes prototypes tree
export default class SortableTable extends SortableTableV2 {
  offset = 30;

  constructor(
    headersConfig, {
      data = [],
      sorted = {
        id: 'title',
        order: 'asc',
      },
      url = '',
      isSortLocally = false,
      start = 0,
      end = 30,
    } = {}
  ) {
    super(headersConfig, {data, sorted});
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.id = sorted.id;
    this.order = sorted.order;
    this.start = start;
    this.end = end;

    this.appendElement(this.createLoadingTemplate());
    this.appendElement(this.createNoDataTemplate());
    this.getSubElements();

    this.render();
    this.addTableEvents();
  }

  async render() {
    this.subElements.loading.style.display = 'block';

    const data = await this.loadData();
    // this.data = [...this.data, ...data];
    data && data.map((item) => {
      this.data.push(item);
      this.subElements.body.insertAdjacentHTML('beforeend',
        this.addTableRow(item)
      );
    });
    this.subElements.loading.style.display = 'none';

    if (this.data.length === 0) {
      this.subElements.emptyPlaceholder.style.display = 'block';
    }

    if (data.length === 0) {
      window.removeEventListener('scroll', this.handleInfinityLoad);
      // If we load entire catalog, we can switch to client side sorting
      this.isSortLocally = true;
    }
  }

  async loadData() {
    const data = await fetchJson(this.getURL());
    return data;
  }

  sortOnClient (id, order) {
    super.sortOnClient(id, order);
  }

  sortOnServer (id, order) {
    this.cleanTable();
    this.id = id;
    this.order = order;
    this.updateTableHeader(this.id, this.order);
    this.render();
  }

  getURL() {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('_sort', this.id);
    url.searchParams.set('_order', this.order);
    url.searchParams.set('_start', this.start.toString());
    url.searchParams.set('_end', this.end.toString());
    return url.href;
  }

  addTableEvents() {
    super.addTableEvents();
    window.addEventListener('scroll', this.handleInfinityLoad);
  }

  handleInfinityLoad = () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2 &&
      this.subElements.loading.style.display !== 'block') {
      //this.subElements.loading Plays role of the Loading Flag

      this.start = this.end + 1;
      this.end = this.end + this.offset;
      this.render();
    }
  }

  addTableRow(row) {
    return `<a href="#" class="sortable-table__row">
      ${this.createRowTemplate(row)}
    </a>`;
  }

  cleanTable() {
    this.data = [];
    this.subElements.body.innerHTML = '';
    this.start = 0;
    this.end = this.offset;
  }

  appendElement(template) {
    const elem = document.createElement('div');
    elem.innerHTML = template;
    this.element.appendChild(elem.firstElementChild);
  }

  createLoadingTemplate() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  createNoDataTemplate() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }
}

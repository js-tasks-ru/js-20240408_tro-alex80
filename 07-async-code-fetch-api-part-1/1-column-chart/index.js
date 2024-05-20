import fetchJson from './utils/fetch-json.js';
import ColumnChart from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChartV2 extends ColumnChart {
  constructor(props = {}) {
    super(props);
    this.url = props.url;
    this.from = props.range?.from ?? new Date();
    this.to = props.range?.to ?? new Date();
    this.update(this.from, this.to);
  }

  // v1 with fetchJson
  async update(from, to) {
    const url = `${BACKEND_URL}${this.url}?from=${from}&to=${to}`;
    this.element.classList.add('column-chart_loading');

    const data = await fetchJson(url);
    super.update(Object.values(data));

    this.element.classList.remove('column-chart_loading');
    return data; // Need for test only 'should load data correctly'
  }

  // v2 with classic fetch
  // async update(from, to) {
  //   const url = `${BACKEND_URL}${this.url}?from=${from}&to=${to}`;
  //   this.element.classList.add('column-chart_loading');
  //
  //   let data = {};
  //   try {
  //     const resp = await fetch(url);
  //     if(!resp.ok) {
  //       throw new Error(resp.statusText);
  //     }
  //     data = await resp.json();
  //     super.update(Object.values(data));
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  //
  //   this.element.classList.remove('column-chart_loading');
  //   return data; // Need for test only 'should load data correctly'
  // }

  // v3 with Promises
  // async update (from, to) {
  //   const url = `${BACKEND_URL}${this.url}?from=${from}&to=${to}`;
  //   this.element.classList.add('column-chart_loading');
  //
  //   let res = {};
  //   await fetch(url)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(response.statusText);
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       super.update(Object.values(data));
  //       res = data;
  //     })
  //     .catch((error) => console.log(error.message))
  //     .finally(() => this.element.classList.remove('column-chart_loading'));
  //   return res; // Need for test only 'should load data correctly'
  // }
}

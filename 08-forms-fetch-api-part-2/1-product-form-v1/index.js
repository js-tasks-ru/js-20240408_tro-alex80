import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  static categoriesURL = 'api/rest/categories';
  static productsURL = 'api/rest/products';
  static imgURL = 'https://api.imgur.com/3/image';
  subElements;

  constructor (productId) {
    this.productId = productId;
    this.element = this.createElementFromTemplate(this.getTemplate());
    this.subElements = this.getSubElements();
    this.createListeners();
  }

  async render () {
    await this.createCategoryList();
    await this.loadProductData();

    return this.element;
  }

  createListeners () {
    this.subElements.productForm.addEventListener('submit', this.handleFormSubmit);
    this.subElements.uploadImage.addEventListener('pointerup', this.handleUploadImage);
  }

  handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    this.addLoader();
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const image = await this.uploadImage(file);
      this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend',
        this.getImageRecordTemplate(image.link, image.name));
    };
    this.removeLoader();
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name);

    const response = await fetchJson(ProductForm.imgURL, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData
    });
    return response.data;
  }

  handleFormSubmit = event => {
    event.preventDefault();
    this.save();
  }

  async save () {
    const method = this.productId ? 'PATCH' : 'POST';
    const url = new URL(ProductForm.productsURL, BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const data = this.getFormData();

    await fetchJson(url.href, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        return response;
      })
      .then(() => {
        this.dispatchCustomEvent(this.productId ? 'product-updated' : 'product-saved');
      })
      .catch(error => {
        console.error(error);
      });
  }

  getFormData() {
    const form = this.subElements.productForm.elements;
    return {
      id: this.productId,
      title: escapeHtml(form.title.value),
      description: escapeHtml(form.description.value),
      subcategory: escapeHtml(form.subcategory.value),
      price: parseInt(form.price.value, 10),
      quantity: parseInt(form.quantity.value, 10),
      discount: parseInt(form.discount.value, 10),
      status: parseInt(form.status.value, 10),
      images: this.getImagesValues(),
    };
  }

  getImagesValues() {
    const images = [];
    for (let image of this.subElements.imageListContainer.firstElementChild.children) {
      images.push({url: image.querySelector('[name="url"]').value, source: image.querySelector('[name="source"]').value});
    }
    return images;
  }

  dispatchCustomEvent(name) {
    const event = new CustomEvent(name, {
      bubbles: true,
      detail: {
        id: this.productId
      }
    });
    this.element.dispatchEvent(event);
  }

  async loadProductData () {
    if (!this.productId) return;
    const url = new URL(ProductForm.productsURL, BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const data = await fetchJson(url.href);

    const { title, description, quantity, subcategory, discount, price, status, images } = data[0];
    this.subElements.productForm.elements.title.value = title;
    this.subElements.productForm.elements.description.value = description;
    this.subElements.productForm.elements.quantity.value = quantity;
    this.subElements.productForm.elements.subcategory.value = subcategory;
    this.subElements.productForm.elements.discount.value = discount;
    this.subElements.productForm.elements.price.value = price;
    this.subElements.productForm.elements.status.value = status;

    this.subElements.imageListContainer.firstElementChild.innerHTML = '';
    for (const image of images) {
      this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend',
        this.getImageRecordTemplate(image.url, image.source));
    }
  }

  async createCategoryList () {
    const url = new URL(ProductForm.categoriesURL, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const data = await fetchJson(url.href);

    this.subElements.subcategory.innerHTML =
      data.map(category =>
        category.subcategories.map(subcategory =>
          `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`
        )
      ).join('');
  }

  createElementFromTemplate(template) {
    const elem = document.createElement('div');
    elem.innerHTML = template;
    return elem.firstElementChild;
  }

  getTemplate () {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара!</label>
            <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list">
            
            </ul>
          </div>
          <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select  id="subcategory" class="form-control" name="subcategory" data-element="subcategory">
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  getImageRecordTemplate(url, source) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle alt="delete">
        </button>
      </li>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, item) => {
      accum[item.dataset.element] = item;
      return accum;
    }, {});
  }

  addLoader() {
    this.subElements.uploadImage.classList.add('is-loading');
    this.subElements.uploadImage.disabled = true;
  }

  removeLoader() {
    this.subElements.uploadImage.classList.remove('is-loading');
    this.subElements.uploadImage.disabled = false;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

}

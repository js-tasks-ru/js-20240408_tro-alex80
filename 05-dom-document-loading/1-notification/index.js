export default class NotificationMessage {
  static prevElement;
  timerID;

  constructor(message, { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = this.createElement(this.createTemplate());
  }

  show(target = document.body) {
    if (NotificationMessage.prevElement) {
      NotificationMessage.prevElement.remove();
    }

    NotificationMessage.prevElement = this;
    target.appendChild(this.element);

    this.timerID = setTimeout(() =>
      this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    clearTimeout(this.timerID);
  }

  createElement(template) {
    const element = document.createElement('div');
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration}ms">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }
}

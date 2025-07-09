import { Component, render } from 'https://unpkg.com/preact?module';
import { html } from './util.js';


class TodoItem extends Component {
  onChange = () => {
    this.props.onChange(!this.props.checked, this.props.id);
  }
  
  onRemove = () => {
    this.props.onRemove(this.props.id);
  }
  
  render({ id, text, checked }) {
    return html`
      <div class="todo-item" data-id=${id}>
        <label class="todo-item-label"><input type="checkbox" checked=${checked} onClick=${this.onChange} /> ${text}</label>
        <button class="todo-close" onClick=${this.onRemove}>✕</button>
      </div>
    `;
  }
}

export default class TodoList extends Component {
  render({ items }) {
    return html`
      <div class="todo-list">
        ${['todo', 'done'].map((doneState) => html`
          <div class="todo-${doneState}">
            <h2>${doneState === 'done' ? 'done' : 'todo'}</h2>
            ${
              items.filter((item) => item.done === (doneState === 'done'))
                .map(({id, text, done}) => html`
                  <${TodoItem} onChange=${this.props.onChange} onRemove=${this.props.onRemove} id=${id} text=${text} checked=${done} />
                `)
            }
          </div>
        `)}
      </div>
    `;
  }
}
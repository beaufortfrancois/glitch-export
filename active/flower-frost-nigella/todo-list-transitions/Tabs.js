import { Component, render } from 'https://unpkg.com/preact?module';
import { html } from './util.js';

export default class Tabs extends Component {
  tabsOnClick = (event) => {
    const el = event.target.closest('.tab');
    if (!el) return;
    const newIndex = Number(el.dataset.index);
    if (newIndex === this.props.selectedIndex) return;
    
    this.props.onChange?.(newIndex);
  };
  
  render({ tabs, selectedIndex }) {
    return html`
      <div class="tabs" onClick=${this.tabsOnClick}>
        ${tabs.map((tab, i) => html`<div data-index=${i} class="tab ${i === selectedIndex ? 'selected' : ''}">${tab}</div>`)}
      </div>
    `;
  }
}
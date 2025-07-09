import { Component, render } from 'https://unpkg.com/preact?module';
import { html } from './util.js';
import Tabs from './Tabs.js';
import TodoList from './TodoList.js';

const todoItems = [
  ['Adirondack Blue', 'Adirondack Red', 'Agata', 'Almond', 'Alturas', 'Amandine', 'Amflora', 'Anya', 'Atlantic', 'Austrian Crescent'],
  ['Black garlic', 'Persillade', 'Pistou', 'Garlic oil', 'Garlic press', 'Garlic bread', 'Garlic chutney', 'Beurre à la bourguignonne (garlic butter)', 'Garlic soup'],
  ['Avengers', 'Captain America', 'Defenders', 'Doctor Strange', 'Fantastic Four', 'Hulk', 'Iron Man', 'Nick Fury', 'Power Pack', 'Runaways'],
  ['Blastaar', 'Count Nefaria', 'Doctor Doom', 'Dracula', 'Eel', 'Firelord', 'Galactus', 'Hela', 'Impossible Man', 'Loki'],
];

export default class App extends Component {
  state = {
    tabs: ['Potatos', 'Garlic', 'Marvel Goodies', 'Marvel Baddies'],
    tabIndex: Number(new URL(location.href).searchParams.get('tab')) || 0,
    todoLists: todoItems.map((list, i) => list.map((item, j) => ({ text: item, id: `${i}-${j}`, done: false }))),
  }
  
  onNavigate = (event) => {
    const currentURL = new URL(location.href);
    const nextURL = new URL(event.destination.url);
    
    const sameUrlAsideFromTab = (() => {
      const currentURLWithoutTab = new URL(currentURL);
      currentURLWithoutTab.searchParams.delete('tab');
      const nextURLWithoutTab = new URL(nextURL);
      nextURLWithoutTab.searchParams.delete('tab');
      return currentURLWithoutTab.href === nextURLWithoutTab.href;
    })();
    
    // Other things are changing that we can't handle. Allow a full navigation.
    if (!sameUrlAsideFromTab) return;
    // No tab change? Bail:
    if ((currentURL.searchParams.get('tab') || '0') === (nextURL.searchParams.get('tab') || '0')) {
      return;
    }
    
    const isBack = event.destination.index !== -1 && event.destination.index < appHistory.current.index;
    
    // We can handle this navigation in-page!
    event.respondWith((async () => {
      const tabIndex = Number(nextURL.searchParams.get('tab'));
      
      if (!document.documentTransition) {
        this.setState({ tabIndex });
        return;
      }
      
      const tabs = this.base.querySelector('.tabs');
      
      await document.documentTransition.prepare({
        rootTransition: isBack ? 'reveal-right' : 'cover-left',
        sharedElements: [tabs],
      });
      
      await new Promise((resolve) => this.setState({ tabIndex }, resolve));
      
      await document.documentTransition.start({
        sharedElements: [tabs],
      });
    })());
  }
  
  componentDidMount() {
    if (self.appHistory) {
      appHistory.addEventListener('navigate', this.onNavigate);
    }
  }
  
  componentWillUnmount() {
    if (self.appHistory) {
      appHistory.removeEventListener('navigate', this.onNavigate);
    }
  }
  
  onTabChange = (newIndex) => {
    const url = new URL(location.href);
    url.searchParams.set('tab', newIndex);
    appHistory.navigate(url);
  };
  
  onTodoItemChange = (done, id) => {
    this.todoListTransition(() => {
      const todoList = this.getActiveTodoList();
      const item = todoList.find(item => item.id === id);
      // Cheating with mutation
      item.done = done;
      return {};
    });
  };
  
  onTodoItemRemove = (id) => {
    this.todoListTransition(() => {
      const todoList = this.getActiveTodoList();
      const itemIndex = todoList.findIndex(item => item.id === id);
      // Cheating with mutation
      todoList.splice(itemIndex, 1);
      return {};
    });
  };
  
  async todoListTransition(callback) {
    if (!document.documentTransition) {
      this.setState(callback());
      return;
    }
    
    const beforeItems = Object.fromEntries(
      [...this.base.querySelectorAll('.todo-item')].map(el => [el.dataset.id, el])
    );
    
    await document.documentTransition.prepare({
      sharedElements: Object.values(beforeItems),
    });
    
    await new Promise((resolve) => this.setState(callback(), resolve));
    
    const afterItems = Object.fromEntries(
      [...this.base.querySelectorAll('.todo-item')].map(el => [el.dataset.id, el])
    );
    
    const afterSharedElements = Object.entries(beforeItems).map(([id]) => {
      const item = afterItems[id];
      delete afterItems[id];
      return item;
    });
    
    afterSharedElements.push(...Object.values(afterItems));
    
    return document.documentTransition.start({
      sharedElements: afterSharedElements,
    });
  }
  
  
  getActiveTodoList() {
    return this.state.todoLists[this.state.tabIndex];
  }
  
  render(props, { tabs, tabIndex, todoLists }) {
    const todoList = this.getActiveTodoList();
    
    return html`
      <div>
        <${Tabs} tabs=${tabs} selectedIndex=${tabIndex} onChange=${this.onTabChange} />
        <${TodoList} items=${todoList} onChange=${this.onTodoItemChange} onRemove=${this.onTodoItemRemove} />
      </div>
    `;
  }
}

render(html`<${App} />`, document.querySelector('.container'));
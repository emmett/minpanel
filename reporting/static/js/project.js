import { Component } from 'panel';
import counterTemplate from './counter.jade';

document.registerElement('project-app', class extends Component{
  get config() {
    console.log(counterTemplate)
    return {
      template: counterTemplate,
    };
  }
});


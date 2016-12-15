import { Component } from 'panel';
import template from './project.jade';
import graphTemplate from './graph.jade';
import tableTemplate from './table.jade';
import dateTemplate from './date.jade';
import toggleTemplate from './toggle.jade';
import $ from 'jquery';

document.registerElement('project-app', class extends Component {
  get config() {
    return {
      defaultState: {
        url: 'http://localhost:8000/reporting',
        project: projects[0].token,
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        type: 'line'
      },
      template
    }
  }
});


document.registerElement('table-view', class extends Component {
  get config() {
    return {
      template: tableTemplate,
    }
  }
  attachedCallback() {
    super.attachedCallback()
    updateData(this.state)
    this.update()
  }
});


document.registerElement('graph-view', class extends Component {
  get config(){
    return {
      template: graphTemplate,
    }
  }
})

document.registerElement('toggle-view', class extends Component {
  get config(){
    return {
      template: toggleTemplate,
    }
  }
})

document.registerElement('date-view', class extends Component {
  get config(){
    return {
      template: dateTemplate,
    }
  }
})


function updateData(state) {
  segment(state.url, state.project, state.from, state.to).done(data =>{
    console.log(data)
  })
  table(state.url, state.project, state.from, state.to).done(data =>{
    console.log(data)
  })
}
function segment(url, token, from, to){
  var args = ['/segment/?token=', token, '&from_date=', from, '&to_date=',to].join('')
  return simpleAjax(url, args)
}

function table(url, token, from, to){
  var args = ['/table/?token=', token, '&from_date=', from, '&to_date=',to].join('')
  return simpleAjax(url, args)
}

function simpleAjax(url, args){
  return $.ajax({
    url: url + args,
    type: 'GET',
    dateType: 'json',
    contentType: 'application/json'
  })
}
import { Component } from 'panel';

import template from './project.jade';
import graphTemplate from './graph.jade';
import tableTemplate from './table.jade';
import dateTemplate from './date.jade';
import toggleTemplate from './toggle.jade';
import moment from 'moment';

// Cant get these imports to work properly
// import $ from 'jquery';
// import highcharts from 'highcharts';
// import _ from 'underscore';

//import datepicker from 'datepicker-js';

document.registerElement('project-app', class extends Component {
  get config() {
    return {
      defaultState: {
        url: 'http://localhost:8000/reporting',
        project: projects[0].token,
        from: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        type: 'line',
        graphData: [],
        tableData: [],
      },
      template
    }
  }

  attachedCallback() {
    super.attachedCallback()
    this.updateData()
  }

  updateData() {
    this.segment().then(data =>{
      data = JSON.parse(data)
      var series = _.sortBy(_.map(data, (v,k) => ({x:new Date(k), y:v})), obj => obj.x)
      new Highcharts.Chart('graphBody',{
        chart: {
            type: this.state.type
        },

        title: {
            text: 'Events'
        },
        xAxis: {
              type: 'datetime',
              tickInterval: 36e5 * 24,
              labels: {
                formatter: function () {
                    var dateObj = new Date(this.value)
                    var [day, mon, date, year, hour] = dateObj.toString().split(' ')
                    return [mon, date].join(' ')
                }
              }
            },
      series: [{
          data: series
        }]
      })
      const graphData = data
      this.update({graphData})
    })
    this.table().done(data =>{
      if (!this.state.table){
        table = $('.table').DataTable({
          columns: [
           {title: 'Name', data: 'Event'},
           {title: 'Date', data: 'date'},
          ]
        })
      } else {
        var table = this.state.table
      }
      const tableData = JSON.parse(data)
      table.clear().draw()
      table.rows.add(tableData).draw()
      this.update({tableData, table})
    })
  }

  segment(){
    var args = [
      '/segment/?token=',
      this.state.project,
      '&from_date=',
      this.state.from,
      '&to_date=',
      this.state.to
    ].join('')
    return this.simpleAjax(this.state.url, args)
  }

  table(){
    var args = [
      '/table/?token=',
      this.state.project,
      '&from_date=',
      this.state.from,
      '&to_date=',
      this.state.to
    ].join('')
    return this.simpleAjax(this.state.url, args)
  }

  simpleAjax(url, args){
    return $.ajax({
      url: url + args,
      type: 'GET',
      dateType: 'json',
      contentType: 'application/json'
    })
  }
});


document.registerElement('table-view', class extends Component {
  get config() {
    return {
      template: tableTemplate,
    }
  }

  get row() {
    return this.state.tableData[0];
  }

  attachedCallback() {
    super.attachedCallback()
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
      helpers: {
        toChange: () => this.changeToDate(),
        fromChange: () => this.changeFromDate(),
      },
      template: dateTemplate,
    }
  }

  attachedCallback(){
    super.attachedCallback()
    $(".to").val(this.state.to);
    $(".from").val(this.state.from);
    this.update()
  }

  changeFromDate(){
    debugger
    this.update({from:  moment($('.from').val()).format('YYYY-MM-DD')})
    this.$panelRoot.updateData()
  }

  changeToDate(){
    this.update({to:  moment($('.to').val()).format('YYYY-MM-DD')})
    this.$panelRoot.updateData()
  }
})


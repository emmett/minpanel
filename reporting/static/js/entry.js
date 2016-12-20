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
      // for each key in data, im a new series,
      // each data object should then be sorted as below
      //
      var highchartsOpts = {
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
                    var date = moment(this.value).format('YYYY-MM-DD')
                    return date
                }
              }
            },
      }
      var series = []
      if (this.state.type == 'line'){
        _.each(data, (dataObj, ev) => {
          series.push({name:ev, data:_.sortBy(_.map(dataObj, (v,k) => ({x:new Date(k), y:v})), obj => obj.x)})
        })
      } else {
        _.each(data, (dataObj, ev) => {
          series.push({data: [ [ev, _.reduce(_.map(dataObj, (v,k) => v), (s, n) => {return s+n}, 0)] ] })
        })
        highchartsOpts.xAxis = {
          type: 'category',
        }
      }
      highchartsOpts.series = series
      new Highcharts.Chart('graphBody',highchartsOpts)
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
      helpers: {
        changeToggle: () => this.changeToggle(),
      },
      template: toggleTemplate,
    }
  }
  changeToggle(){
    let type = $('select').val()
    this.update({type : type})
    this.$panelRoot.updateData()
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
    $(".to").datepicker()
    $(".from").val(this.state.from);
    $(".from").datepicker()
    this.update()
  }

  changeFromDate(){
    this.update({from:  moment($('.from').val()).format('YYYY-MM-DD')})
    this.$panelRoot.updateData()
  }

  changeToDate(){
    this.update({to:  moment($('.to').val()).format('YYYY-MM-DD')})
    this.$panelRoot.updateData()
  }
})


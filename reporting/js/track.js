var Minpanel = function(token, url) {
  this.token = token;
  var url = url || 'http://127.0.0.1:8000/reporting/track'
  this.url = url
}

Minpanel.prototype.track = function(event) {
  var params = {
    event : event,
    token : this.token,
    ts : Math.round(Number(new Date()/1000)),
  }
  var dataStr = btoa(JSON.stringify(params))
  var url = this.url + '?data=' + dataStr
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.send()
}

function initMinpanel(token){
  minpanel = new Minpanel(token)
}
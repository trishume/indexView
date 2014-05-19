var Viewer = {
    data: null,
    topPad: 50,

loadCanvas: function () {
  this.canvas = $('graph');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  if (this.canvas.getContext) {
    this.ctx = this.canvas.getContext('2d');

    var _zoom = this.zoom.bind(this);
    this.canvas.addEventListener('mousewheel',function(event) {
        _zoom(event);
        event.preventDefault();
        return false;
    }, false);
  }

  this.graphBottom = 300;

  this.curTimeMode = 0;
  this.loadTimeChooser();

  this.startMonth = 1200;
  this.endMonth = Infinity;
},

loadTimeChooser: function() {
  for (var i = 0; i < 3; i++) {
    var status = (i == this.curTimeMode) ? 'inherit' : 'none';
    $('time-mode-'+i).style.display = status;
  }
},

loadData: function (data, startYear, statFuncs) {
  this.data = data;
  this.firstYear = startYear;
  this.statFuncs = statFuncs;

  this.endMonth = Math.min(this.endMonth, data.length);

  this.draw();
},

changeMode: function() {
  this.curTimeMode = (this.curTimeMode + 1) % 3;
  this.loadTimeChooser();
  this.draw();
},

fieldChanged: function() {
  function _validYear(year) {
    return (year.length == 4) && !isNaN(year);
  }

  var startYear = $('startYear'+this.curTimeMode).value;
  if(_validYear(startYear)) {
    this.startMonth = (parseInt(startYear) - this.firstYear)*12;
  }

  if(this.curTimeMode == 0) {
    var endYear = $('endYear').value;

    if(_validYear(endYear)) {
      this.endMonth = (parseInt(endYear) - this.firstYear)*12;
    }
  } else if(this.curTimeMode == 1) {
    var yearCount = $('yearCount').value;

    if(!isNaN(yearCount)) {
      this.endMonth = this.startMonth + yearCount*12;
    }
  }

  this.startMonth = Math.min(this.data.length, Math.max(0, this.startMonth));
  this.endMonth = Math.min(this.data.length, Math.max(0, this.endMonth));

  this.draw();
},

zoom: function (event) {
  var deltaFactor = (event.deltaMode == WheelEvent.DOM_DELTA_LINE) ? 20 : 1;
  var delta = event.deltaY * deltaFactor;
  var mouseX = event.clientX - this.canvas.offsetLeft;

  var span = this.endMonth-this.startMonth;
  var centerMonth = this.startMonth + mouseX/(this.width/span);
  var factor = 1 + delta * 0.0002;
  this.endMonth = Math.round(factor*this.endMonth - centerMonth*(factor - 1));
  this.startMonth = Math.round(factor*this.startMonth + centerMonth*(1 - factor));

  this.startMonth = Math.max(this.startMonth,0);
  this.endMonth = Math.min(Math.max(this.endMonth,this.startMonth+10), this.data.length);
  this.draw();
},

updateTimeFields: function() {
  var startYear = Math.round(this.firstYear + (this.startMonth/12));
  var endYear = Math.round(this.firstYear + (this.endMonth/12));

  $('startYear'+this.curTimeMode).value = startYear;
  if(this.curTimeMode == 0) {
    $('endYear').value = endYear;
  } else if(this.curTimeMode == 1) {
    $('yearCount').value = endYear - startYear;
  } else if(this.curTimeMode == 2) {
    this.endMonth = this.data.length;
  }
},

updateStats: function () {
  var stats = $('stats');
  stats.innerHTML = '';

  for (var i = 0; i < this.statFuncs.length; i++) {
    var result = this.statFuncs[i](this.data, this.startMonth, this.endMonth);

    var title = document.createElement("strong");
    title.appendChild(document.createTextNode(result[0]));
    var content = document.createElement("div");
    content.appendChild(document.createTextNode(result[1]));
    content.className = "num";

    var statNode = document.createElement("div");
    statNode.appendChild(title);
    statNode.appendChild(document.createElement("br"));
    statNode.appendChild(content);
    statNode.appendChild(document.createElement("br"));

    stats.appendChild(statNode);
  };
},

calcRange: function () {
  this.min = Infinity;
  this.max = 0.0;
  for (var i = this.startMonth; i < this.endMonth; i++) {
    if(this.data[i]>this.max) this.max = this.data[i];
    if(this.data[i]<this.min) this.min = this.data[i];
  };
},

draw: function () {
  if(!this.data) return;

  this.updateTimeFields();

  this.drawData();

  this.updateStats();
},

drawData: function (){
  this.calcRange();
  var ctx = this.ctx;
  var span = this.endMonth-this.startMonth;
  var dx = (this.width/span);
  var jump = Math.ceil(span/this.width);

  ctx.clearRect(0,0,this.width, this.height);

  // Year lines
  var minSpace = 20;
  var alpha = Math.min((dx*12)/minSpace*0.7,0.7);
  if (alpha < 0.3) alpha = 0.0;

  ctx.lineWidth = 1;
  ctx.textAlign = "center";
  ctx.font = "10pt Arial";
  ctx.fillStyle = "rgb(130,130,130)";

  for (var i = this.startMonth; i < this.endMonth; i++) {
    if (i % 12 == 0) {
      var x = (i-this.startMonth)*dx;
      var isDecade = (i+12)%(12*10) == 0;

      if(isDecade) {
        ctx.strokeStyle = "rgb(200,200,200)";
      } else {
        ctx.strokeStyle = "rgba(225,225,225,"+alpha+")";
      }

      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,this.graphBottom);
      ctx.stroke();

      if(isDecade) {
        var curYear = String(Math.floor(this.firstYear + i/12));
        ctx.fillText(curYear, x, this.graphBottom + 15);
      }
    }
  };

  // Graph
  ctx.strokeStyle = "rgb(74,144,226)";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";

  ctx.beginPath();
  var graphHeight = this.graphBottom - this.topPad;
  var y1 = (this.data[this.startMonth]-this.min)/(this.max-this.min)*graphHeight;
  ctx.moveTo(0,this.graphBottom - y1);
  for (var i = this.startMonth; i < this.endMonth; i+=jump) {
    var y = (this.data[i]-this.min)/(this.max-this.min)*graphHeight;
    var x = (i-this.startMonth)*dx;
    ctx.lineTo(x,this.graphBottom - y);
  };
  ctx.stroke();
}
};

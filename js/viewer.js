var Viewer = {
loadCanvas: function () {
  this.canvas = $('graph');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  if (this.canvas.getContext) {
    this.ctx = this.canvas.getContext('2d');

    var _zoom = this.zoom.bind(this);
    var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    this.canvas.addEventListener(mousewheelevt,function(event) {
        _zoom(event);
        event.preventDefault();
        return false;
    }, false);

    var _mouse = this.mouse.bind(this);
    this.canvas.addEventListener('mousemove', function (e) {
        _mouse(e);
    }, false);

    var _this = this;
    this.mouseDown = false;
    this.canvas.addEventListener('mousedown', function (e) {
      _this.mouseDown = true;
    }, false);
    this.canvas.addEventListener('mouseup', function (e) {
      _this.mouseDown = false;
    }, false);

  }

  this.bigGraph = {
    top: 20,
    bottom: 240,
    width: this.width,
    lineWidth: 4,
    lineTop: 0,
    decadeLabels: true,
    yearLines: true
  };

  this.scrubGraph = {
    top: 270,
    bottom: 300,
    width: this.width,
    lineWidth: 2,
    windowColor: "rgba(100,100,100,0.2)",
    lineTop: 290,
    decadeLabels: false,
    yearLines: false
  };

  this.curTimeMode = 0;
  this.loadDateFields();
  this.loadTimeChooser();

  this.startMonth = 1200;
  this.endMonth = Infinity;

  this.data = [];
},

loadDateFields: function() {
  this.dateFields = [];
  for (var i = 0; i <= 3; i++) {
    var elem = $('date-field-'+i);
    this.dateFields[i] = new DateField(elem, this);
  };
},

loadTimeChooser: function() {
  for (var i = 0; i < 3; i++) {
    var status = (i == this.curTimeMode) ? 'inherit' : 'none';
    $('time-mode-'+i).style.display = status;
  }
},

loadStatViews: function(data) {
  var statsNode = $('stats');
  statsNode.innerHTML = '';

  this.statViews = [];

  for (var i = 0; i < data.stats.length; i++) {
    var stat = data.stats[i];
    this.statViews[i] = new StatView(statsNode, stat);
  };
},

loadData: function (data) {
  this.data[0] = data;
  this.maxMonth = data.vals.length * data.pointJump;

  data.color = "rgb(74,144,226)";
  data.startOffset = 0;
  data.widthMultiple = 1.0;
  data.fullRange = this.calcRange(data, 0, this.maxMonth);

  // What if we zoom to 1890 and then switch to a set starting in 1870
  if(this.firstYear && data.firstYear != this.firstYear) {
    var delta = (this.firstYear - data.firstYear)*12;
    this.startMonth += delta;
    this.endMonth += delta;
    this.startMonth = Math.max(this.startMonth, 0);
    this.endMonth   = Math.max(this.endMonth, 20);
  }

  this.firstYear = data.firstYear;
  this.endMonth = Math.min(this.endMonth, this.maxMonth);

  this.clearOverlay();
  this.loadStatViews(data);

  this.draw();
},

loadOverlay: function(data) {
  this.data[1] = data;
  data.color = "rgb(200,200,200)";
  data.startOffset = (data.firstYear - this.firstYear) * 12;
  data.fullRange = this.calcRange(data, 0, data.vals.length);
  data.widthMultiple = 0.6;
  this.draw();
},

clearOverlay: function() {
  if(this.data.length > 1) {
    this.data.pop();
    this.draw();
  }
},

changeMode: function() {
  this.curTimeMode = (this.curTimeMode + 1) % 3;
  this.loadTimeChooser();
  this.draw();
},

fieldChanged: function() {
  var startField = this.dateFields[this.curTimeMode];
  var startMonth = startField.getMonthInRange(this.firstYear, this.maxMonth);
  if(startMonth != null) {
    this.startMonth = startMonth;
  }

  if(this.curTimeMode == 0) {
    var endMonth = this.dateFields[3].getMonthInRange(this.firstYear,this.maxMonth);

    if(endMonth != null) {
      this.endMonth = endMonth;
    }
  } else if(this.curTimeMode == 1) {
    var yearCount = $('yearCount').value;

    if(!isNaN(yearCount)) {
      this.endMonth = this.startMonth + yearCount*12;
    }
  }

  this.clampTimespan();

  this.draw();
},

clampTimespan: function() {
  this.startMonth = Math.min(Math.max(this.startMonth,0), this.maxMonth);
  this.endMonth   = Math.min(Math.max(this.endMonth,this.startMonth+12), this.maxMonth);
},

mouse: function(event) {
  var y = event.clientY - this.canvas.offsetTop - this.canvas.offsetParent.offsetTop;
  var x = event.clientX - this.canvas.offsetParent.offsetLeft - this.canvas.offsetLeft;
  if(y > this.scrubGraph.top && this.mouseDown) {
    this.scrub(x);
  } else if(y < this.bigGraph.bottom) {
    this.trace(x);
  }
},

zoom: function (event) {
  // Cross browser mouse wheel scale
  var d = event.detail, w = event.wheelDelta,
      n = 225, n1 = n-1;
  // Normalize delta
  d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
  // Quadratic scale if |d| > 1
  d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
  // Delta *should* not be greater than 2...
  var delta = Math.min(Math.max(d / 2, -1), 1);

  var mouseX = event.clientX - this.canvas.offsetParent.offsetLeft - this.canvas.offsetLeft;

  var centerMonth = this.xToMonth(mouseX);
  var factor = 1 + delta * -0.1;
  this.endMonth = Math.round(factor*this.endMonth - centerMonth*(factor - 1));
  this.startMonth = Math.round(factor*this.startMonth + centerMonth*(1 - factor));

  this.clampTimespan();
  this.draw();
},

dateText: function(month) {
  var year = String(Math.floor(month / 12) + this.firstYear);
  var month = String(month % 12);
  if(month.length == 1 ) month = "0" + month;
  return year + "/" + month;
},

traceText: function(data, month) {
  var start = this.toIndex(data, this.startMonth);
  var end = this.toIndex(data, month);
  return Stats.totalGrowth.calc(data.vals, start, end);
},

trace: function(x) {
  this.draw();

  var ctx = this.ctx;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(200,50,50)"
  ctx.textAlign = "center";
  ctx.font = "10pt Arial";
  ctx.fillStyle = "rgb(130,130,130)";

  var fmonth = this.xToMonth(x);
  var month = Math.floor(fmonth);
  fmonth = fmonth % 1;

  var data = this.data[0];
  var v1 = data.vals[this.toIndex(data, month)];
  var v2 = data.vals[this.toIndex(data, month)+1] || v1;
  var val = (1-fmonth)*v1 + fmonth*v2;
  var y = this.valToY(data.curRng, this.bigGraph, val);

  // trace dot
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(x,y,6,0,2*Math.PI);
  ctx.fill();

  // text
  var text = this.traceText(data, month);
  ctx.textAlign = "right";
  ctx.font = "12pt Arial";
  ctx.fillStyle = (text[0] == "-") ? "red" : "green";
  ctx.fillText(text, x - 10, y - 5);
},

scrub: function(x) {
  var span = this.endMonth - this.startMonth;
  var target = Math.round(x/this.width*this.maxMonth);
  var half = Math.floor(span/2);
  this.startMonth = target - half;
  this.endMonth = target + half;

  this.clampTimespan();
  this.draw();
},

updateTimeFields: function() {
  var startYear = Math.round(this.firstYear + (this.startMonth/12));
  var endYear = Math.round(this.firstYear + (this.endMonth/12));

  this.dateFields[this.curTimeMode].setDateFrom(this.startMonth, this.firstYear);
  if(this.curTimeMode == 0) {
    this.dateFields[3].setDateFrom(this.endMonth, this.firstYear);
  } else if(this.curTimeMode == 1) {
    $('yearCount').value = endYear - startYear;
  } else if(this.curTimeMode == 2) {
    this.endMonth = this.maxMonth;
  }
},

updateStats: function (data) {
  var start = this.toIndex(data, this.startMonth);
  var end = this.toIndex(data, this.endMonth);

  for (var i = 0; i < this.statViews.length; i++) {
    this.statViews[i].update(data.vals, start, end);
  };
},

toIndex: function (data,n) {
  n = n - data.startOffset;
  return Math.floor(n/data.pointJump);
},

xToMonth: function(x) {
  var span = this.endMonth-this.startMonth;
  return this.startMonth + x/(this.width/span);
},

valToY: function(rng, graph, val) {
   return graph.bottom - (val-rng.min)/(rng.max-rng.min)*(graph.bottom - graph.top);
},

calcRange: function (data, start, end) {
  var min = Infinity;
  var max = 0.0;
  for (var i = start; i < end; i++) {
    if(data.vals[i]>max) max = data.vals[i];
    if(data.vals[i]<min) min = data.vals[i];
  };
  return {"min": min, "max": max};
},

calcRanges: function () {
  for (var i = 0; i < this.data.length; i++) {
    var data = this.data[i];
    var start = this.toIndex(data, this.startMonth);
    var end = this.toIndex(data, this.endMonth);
    this.data[i].curRng = this.calcRange(data, start, end);
  };
},

draw: function () {
  if(this.data.length == 0) return;
  this.ctx.clearRect(0,0,this.width, this.height);

  this.updateTimeFields();

  this.calcRanges();

  this.drawLines(this.bigGraph, this.startMonth, this.endMonth);
  this.drawStartLevel(this.data[0], this.bigGraph, this.startMonth);
  for (var i = this.data.length - 1; i >= 0; i--) {
    this.drawData(this.data[i], this.bigGraph, this.startMonth, this.endMonth, this.data[i].curRng);
  };

  // scrub graph
  //this.drawLines(this.scrubGraph, 0, this.maxMonth);
  for (var i = this.data.length - 1; i >= 0; i--) {
    this.drawData(this.data[i], this.scrubGraph, 0, this.maxMonth, this.data[i].fullRange);
  };
  this.drawWindow(this.scrubGraph);

  this.updateStats(this.data[0]);
},

drawLines: function(opt, startMonth, endMonth){
  var ctx = this.ctx;
  var span = endMonth-startMonth;
  var dx = (opt.width/span);

  var minSpace = 20;
  var alpha = Math.min((dx*12)/minSpace*0.7,0.7);
  if (alpha < 0.3 || !opt.yearLines) alpha = 0.0;

  ctx.lineWidth = 1;
  ctx.textAlign = "center";
  ctx.font = "10pt Arial";
  ctx.fillStyle = "rgb(130,130,130)";

  for (var i = startMonth; i < endMonth; i++) {
    if (i % 12 == 0) {
      var x = (i-startMonth)*dx;
      var curYear = Math.floor(this.firstYear + i/12)
      var isDecade =  curYear % 10 == 0;

      if(isDecade) {
        ctx.strokeStyle = "rgb(200,200,200)";
      } else {
        ctx.strokeStyle = "rgba(225,225,225,"+alpha+")";
      }

      ctx.beginPath();
      ctx.moveTo(x,opt.lineTop);
      ctx.lineTo(x,opt.bottom);
      ctx.stroke();

      if(isDecade && opt.decadeLabels) {
        ctx.fillText(curYear, x, opt.bottom + 15);
      }
    }
  }
},

drawData: function (data, graph, startMonth, endMonth, rng){
  var ctx = this.ctx;
  var start = this.toIndex(data, startMonth);
  var end = this.toIndex(data, endMonth);
  var span = end-start;
  var dx = (graph.width/span);
  var jump = (data.pointJump == 1) ? Math.ceil(span/graph.width) : 1;

  // Graph
  ctx.strokeStyle = data.color;
  ctx.lineWidth = graph.lineWidth * data.widthMultiple;
  ctx.lineJoin = "round";

  ctx.beginPath();
  var y1 = this.valToY(rng, graph, data.vals[start]);
  ctx.moveTo(0,y1);
  for (var i = start; i < end; i+=jump) {
    var y = this.valToY(rng, graph, data.vals[i]);
    var x = (i-start)*dx;
    ctx.lineTo(x,y);
  };
  ctx.stroke();
},

drawStartLevel: function(data, graph, startMonth) {
  var ctx = this.ctx;
  var start = this.toIndex(data, startMonth);
  var y = this.valToY(data.curRng, graph, data.vals[start]);

  ctx.strokeStyle = "#999999";
  ctx.lineWidth = 1;

  ctx.beginPath()
  ctx.moveTo(0, y);
  ctx.lineTo(graph.width, y);
  ctx.stroke();
},

drawWindow: function(opt) {
  this.ctx.fillStyle = opt.windowColor;

  var x1 = this.startMonth/this.maxMonth*opt.width;
  var x2 = this.endMonth/this.maxMonth*opt.width;
  this.ctx.fillRect(x1, opt.top, x2-x1, opt.bottom-opt.top);
}
};

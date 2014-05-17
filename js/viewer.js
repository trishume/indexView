Viewer = {data: null, topPad: 50};

Viewer.loadCanvas = function(){
  this.canvas = $('graph');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  if (this.canvas.getContext){
    this.ctx = this.canvas.getContext('2d');

    var _zoom = this.zoom.bind(this);
    this.canvas.addEventListener('mousewheel',function(event){
        _zoom(event);
        event.preventDefault();
        return false;
    }, false);
  }

  this.startMonth = 1200;
  this.endMonth = Infinity;
}

Viewer.loadData = function(data, startYear, statFuncs) {
  this.data = data;
  this.firstYear = startYear;
  this.statFuncs = statFuncs;

  this.endMonth = Math.min(this.endMonth, data.length);

  this.draw();
}

Viewer.zoom = function(event) {
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
}

Viewer.updateStats = function() {
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
}

Viewer.calcRange = function() {
  this.min = Infinity;
  this.max = 0.0;
  for (var i = this.startMonth; i < this.endMonth; i++) {
    if(this.data[i]>this.max) this.max = this.data[i];
    if(this.data[i]<this.min) this.min = this.data[i];
  };
}

Viewer.draw = function() {
  if(!this.data) return;

  this.drawData();

  var startYear = Math.round(this.firstYear + (this.startMonth/12));
  var endYear = Math.round(this.firstYear + (this.endMonth/12));
  this.ctx.font = "20pt sans-serif";
  this.ctx.fillText(String(startYear) + " - " + String(endYear),10,30);

  this.updateStats();
}

Viewer.drawData = function(){
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
  ctx.strokeStyle = "rgba(202,226,255,"+alpha+")";
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (var i = this.startMonth; i < this.endMonth; i++) {
    if (i % 12 == 0) {
      var x = (i-this.startMonth)*dx;
      ctx.moveTo(x,0);
      ctx.lineTo(x,this.height);
    }
  };
  ctx.stroke();

  // Graph
  ctx.strokeStyle = "rgb(74,144,226)";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";

  ctx.beginPath();
  var y1 = (this.data[this.startMonth]-this.min)/(this.max-this.min)*(this.height-this.topPad);
  ctx.moveTo(0,this.height - y1);
  for (var i = this.startMonth; i < this.endMonth; i+=jump) {
    var y = (this.data[i]-this.min)/(this.max-this.min)*(this.height-this.topPad);
    var x = (i-this.startMonth)*dx;
    ctx.lineTo(x,this.height - y);
  };
  ctx.stroke();
}

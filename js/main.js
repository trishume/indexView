var Stats = {
  _calcTotalGrowth: function(data, start, end) {
    return data[end-1]/data[start];
  },
  totalGrowth: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var text = String(((totalGrowth-1)*100).toFixed(2)) + '%';
    return ["Total Growth", text];
  },
  dollarsNow: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var text = "$" + totalGrowth.formatMoney(2,'.',',');
    return ["One Dollar Becomes", text];
  },
  averageGrowth: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var avgGrowth = Math.pow(totalGrowth,(12/(end-start)))-1;
    var text = String((avgGrowth*100).toFixed(2)) + '%';
    return ["Average Growth", text];
  },
  timesDoubled: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var doubled = Math.log(totalGrowth)/Math.log(2);
    var text = String(doubled.toFixed(2));
    return ["Times Doubled", text];
  },
  average: function(data, start, end) {
    var total = 0;
    for (var i = start; i < end; i++) {
      total += data[i];
    }
    var average = total / (end-start);
    var text = String((average*100).toFixed(2)) + '%';
    return ["Average", text];
  }
};

function reinvestDividends(struct) {
  var newData = [1.0];
  var price = struct["price"];
  var dividend = struct["dividend"];

  for (var i = 1; i < price.length; i++) {
    var grownVal = (price[i]/price[i-1]);
    grownVal += (dividend[i]/12.0)/price[i];
    grownVal *= newData[i-1];
    newData[i] = grownVal;
  };

  return newData;
}

var defaultStats = [Stats.totalGrowth, Stats.averageGrowth, Stats.dollarsNow, Stats.timesDoubled];
var dataSets = [
  {
    name: "S&P500 (Reinvested Dividends)",
    notes: "Historical S&P500 data from <a href='http://www.econ.yale.edu/~shiller/data.htm'>Robert Shiller</a>. Not inflation adjusted. Includes reinvested dividends.",
    file: "shiller_absolute.json",
    statFuncs: defaultStats,
    startYear: function(struct) {return struct["start"];},
    datFunc: reinvestDividends
  },
  {
    name: "S&P500",
    notes: "Historical S&P500 data from <a href='http://www.econ.yale.edu/~shiller/data.htm'>Robert Shiller</a>. Not inflation adjusted. Dividends not reinvested.",
    file: "shiller_absolute.json",
    statFuncs: defaultStats,
    startYear: function(struct) {return struct["start"];},
    datFunc: function(struct) {
      return struct["price"];
    }
  },
  {
    name: "Inflation adjusted S&P500 (Reinvested Dividends)",
    notes: "Historical S&P500 data from <a href='http://www.econ.yale.edu/~shiller/data.htm'>Robert Shiller</a>. Not inflation adjusted. Includes reinvested dividends.",
    file: "shiller_real.json",
    statFuncs: defaultStats,
    startYear: function(struct) {return struct["start"];},
    datFunc: reinvestDividends
  },
  {
    name: "Inflation adjusted S&P500",
    notes: "Historical S&P500 data from <a href='http://www.econ.yale.edu/~shiller/data.htm'>Robert Shiller</a>. Inflation adjusted. Dividends not reinvested.",
    file: "shiller_real.json",
    statFuncs: defaultStats,
    startYear: function(struct) {return struct["start"];},
    datFunc: function(struct) {
      return struct["price"];
    }
  },
  {
    name: "S&P500 Dividend Yield",
    notes: "Historical S&P500 data from <a href='http://www.econ.yale.edu/~shiller/data.htm'>Robert Shiller</a>.",
    file: "shiller_absolute.json",
    statFuncs: [Stats.average],
    startYear: function(struct) {return struct["start"];},
    datFunc: function(struct) {
      var newData = [];
      for (var i = 0; i < struct["price"].length; i++) {
        newData[i] = struct["dividend"][i]/struct["price"][i];
      }
      return newData;
    }
  },
];
var dataFileCache = {};

function loadDataFile(fileName) {
  if(dataFileCache[fileName]) {
    return dataFileCache[fileName];
  }

  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "datasets/"+fileName, false);
  xmlhttp.send();

  if(xmlhttp.status == 200) {
    var json = JSON.parse(xmlhttp.responseText);
    dataFileCache[fileName] = json;
    return json;
  } else {
    alert("Failed to get "+fileName);
    return null;
  }
}

function loadSetChooser() {
  var select = $('dataset-chooser');
  for (var i = 0; i < dataSets.length; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.text = dataSets[i].name;
    select.add(opt,null);
  };
}

function setChooserChanged() {
  var select = $('dataset-chooser');
  loadData(select.selectedIndex);
}

function loadData(setNum) {
  var set = dataSets[setNum];
  var struct = loadDataFile(set.file);
  var startYear = set.startYear(struct);
  var data = set.datFunc(struct);

  $('dataset-notes').innerHTML = set.notes;

  Viewer.loadData(data, startYear, set.statFuncs);
}

function load() {
  Viewer.loadCanvas();
  loadSetChooser();
  loadData(0);
}

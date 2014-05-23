var Stats = {
  _calcTotalGrowth: function(data, start, end) {
    return data[end-1]/data[start];
  },
  _calcAverage: function(data, start, end) {
    var total = 0;
    for (var i = start; i < end; i++) {
      total += data[i];
    }
    var average = total / (end-start);
    return average;
  },
  totalGrowth: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var text = String(((totalGrowth-1)*100).formatMoney(2,'.',',')) + '%';
    return ["Total Growth", text];
  },
  dollarsNow: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var text = "$" + totalGrowth.formatMoney(2,'.',',');
    return ["$1 Becomes", text];
  },
  averageGrowth: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var avgGrowth = Math.pow(totalGrowth,(12/(end-start)))-1;
    var text = String((avgGrowth*100).toFixed(2)) + '%';
    return ["Average Growth", text];
  },
  averageGrowthQuarterly: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var avgGrowth = Math.pow(totalGrowth,(12/((end-start)*3)))-1;
    var text = String((avgGrowth*100).toFixed(2)) + '%';
    return ["Average Growth", text];
  },
  timesDoubled: function(data, start, end) {
    var totalGrowth = Stats._calcTotalGrowth(data,start,end);
    var doubled = Math.log(totalGrowth)/Math.log(2);
    var text = String(doubled.toFixed(2));
    return ["Times Doubled", text];
  },
  averagePercent: function(data, start, end) {
    var average = Stats._calcAverage(data, start, end);
    var text = String((average*100).toFixed(2)) + '%';
    return ["Average", text];
  },
  average: function(data, start, end) {
    var average = Stats._calcAverage(data, start, end);
    var text = average.formatMoney(2,'.',',');
    return ["Average", text];
  }
};

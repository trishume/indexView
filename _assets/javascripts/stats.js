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
  totalGrowth: {
    calc: function(data, start, end) {
      var totalGrowth = Stats._calcTotalGrowth(data,start,end);
      var text = String(((totalGrowth-1)*100).formatMoney(2,'.',',')) + '%';
      return text;
    },
    name: "Total Growth"
  },
  dollarsNow: {
    calc: function(data, start, end) {
      var totalGrowth = Stats._calcTotalGrowth(data,start,end);
      var text = "$" + totalGrowth.formatMoney(2,'.',',');
      return text;
    },
    name: "$1 Becomes",
    description: "If $1 was invested at the beginning of this time period, what would it be by the end?"
  },
  averageGrowth: {
    calc: function(data, start, end) {
      var totalGrowth = Stats._calcTotalGrowth(data,start,end);
      var avgGrowth = Math.pow(totalGrowth,(12/(end-start)))-1;
      var text = String((avgGrowth*100).toFixed(2)) + '%';
      return text;
    },
    name: "Annual Growth",
    description: "The CAGR, defined as the rate of constant growth that would produce the same return over the given time period."
  },
  averageGrowthQuarterly: {
    calc: function(data, start, end) {
      var totalGrowth = Stats._calcTotalGrowth(data,start,end);
      var avgGrowth = Math.pow(totalGrowth,(12/((end-start)*3)))-1;
      var text = String((avgGrowth*100).toFixed(2)) + '%';
      return text;
    },
    name: "Annual Growth",
    description: "The CAGR, defined as the rate of constant growth that would produce the same return over the given time period."
  },
  timesDoubled: {
    calc: function(data, start, end) {
      var totalGrowth = Stats._calcTotalGrowth(data,start,end);
      var doubled = Math.log(totalGrowth)/Math.log(2);
      var text = String(doubled.toFixed(2));
      return text;
    },
    name: "Times Doubled"
  },
  averagePercent: {
    calc: function(data, start, end) {
      var average = Stats._calcAverage(data, start, end);
      var text = String((average*100).toFixed(2)) + '%';
      return text;
    },
    name: "Average"
  },
  average: {
    calc: function(data, start, end) {
      var average = Stats._calcAverage(data, start, end);
      var text = average.formatMoney(2,'.',',');
      return text;
    },
    name: "Average"
  },
  finalValue: {
    calc: function(data, start, end) {
      var val = data[end];
      var text = val.formatMoney(2,'.',',');
      return text;
    },
    name: "Final Value"
  },
};

function DateField(element, delegate) {
  this.elem = element;
  this.delegate = delegate;
  this.initDom();
}

DateField.prototype = {
  initDom: function() {
    this.yearField = document.createElement("input");
    this.yearField.type = "text";
    this.yearField.className = "time-field";
    this.yearField.onchange = this.yearChanged.bind(this);
    this.elem.appendChild(this.yearField);
  },

  setDateFrom: function(month, startYear) {
    var year = startYear + Math.floor(month/12);
    var month = month % 12;
    this.setDate(year, month);
  },

  setDate: function(year, month) {
    this.yearField.value = year;
  },

  yearChanged: function() {
    this.delegate.fieldChanged();
  },

  getMonthInRange: function(startYear, maxMonth) {
    var year = this.yearField.value;
    if(year.length != 4 || isNaN(year)) return null;
    year = parseInt(year);
    if(year < startYear) return null;
    var month = (year - startYear)*12;
    if(month > maxMonth) return null;
    return month;
  }
}

function DateField(element, delegate) {
  this.elem = element;
  this.delegate = delegate;
  this.initDom();
}

DateField.prototype = {
  initDom: function() {
    this.elem.className = "date-entry"

    this.yearField = document.createElement("input");
    this.yearField.type = "text";
    this.yearField.className = "time-field";
    this.yearField.onchange = this.yearChanged.bind(this);
    this.elem.appendChild(this.yearField);

    var monthContainer = document.createElement("span");
    monthContainer.className = "date-months"
    var months = "JFMAMJJASOND";
    this.monthSelectors = [];
    for (var i = 0; i < months.length; i++) {
      var a = document.createElement("a");
      a.href = "#";
      a.appendChild(document.createTextNode(months[i]));

      var monthChanged = this.monthChanged.bind(this);
      a.onclick = monthChanged;

      this.monthSelectors[i] = a;
      monthContainer.appendChild(a);
    };
    this.elem.appendChild(monthContainer);
  },

  setDateFrom: function(month, startYear) {
    var year = startYear + Math.floor(month/12);
    var month = month % 12;
    this.setDate(year, month);
  },

  setDate: function(year, month) {
    this.curMonth = month;
    this.yearField.value = year;

    for (var i = 0; i < this.monthSelectors.length; i++) {
      var cls = (i==month) ? "cur-month" : "";
      this.monthSelectors[i].className = cls;
    };
  },

  monthChanged: function(event) {
    var month = 0;
    for (var i = 0; i < this.monthSelectors.length; i++) {
      if(event.currentTarget == this.monthSelectors[i]) {
        month = i;
      }
    };

    this.curMonth = month;
    this.delegate.fieldChanged();
  },

  yearChanged: function() {
    this.delegate.fieldChanged();
  },

  getMonthInRange: function(startYear, maxMonth) {
    var year = this.yearField.value;
    if(year.length != 4 || isNaN(year)) return null;
    year = parseInt(year);
    if(year < startYear) return null;
    var month = (year - startYear)*12 + this.curMonth;
    if(month > maxMonth) return null;
    return month;
  }
}

function StatView(domParent, stat) {
  this.domParent = domParent;
  this.stat = stat;
  this.initDom();
}

StatView.prototype = {
  initDom: function() {
    var statName = this.stat.name;

    var title = document.createElement("strong");
    this.titleText = document.createTextNode(statName);
    title.appendChild(this.titleText);

    var content = document.createElement("div");
    this.valueText = document.createTextNode("");
    content.appendChild(this.valueText);
    content.className = "num";

    var statNode = document.createElement("div");
    statNode.appendChild(title);
    statNode.appendChild(document.createElement("br"));
    statNode.appendChild(content);
    statNode.appendChild(document.createElement("br"));

    this.container = statNode;
    this.domParent.appendChild(statNode);
  },

  update: function(data, startMonth, endMonth) {
    var value = this.stat.calc(data, startMonth, endMonth);
    this.valueText.nodeValue = value;
  }
}

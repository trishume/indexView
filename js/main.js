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
  var data = {
    vals: set.datFunc(struct),
    firstYear: set.startYear(struct),
    statFuncs: set.statFuncs
  }

  $('dataset-notes').innerHTML = set.notes;

  Viewer.loadData(data);
}

function load() {
  Viewer.loadCanvas();
  loadSetChooser();
  loadData(0);
}

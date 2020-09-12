function loadSetChooser(select, sets) {
  select.innerHTML = '';
  for (var i = 0; i < sets.length; i++) {
    var opt = document.createElement("option");
    opt.value = sets[i].name;
    opt.text = sets[i].name;
    select.add(opt,null);
  };
}

function setChooserChanged() {
  var select = $('dataset-chooser');
  select.blur();
  loadData(select.selectedIndex);
}

function overlayChanged() {
  var select = $('overlay-chooser');
  if(select.value == "None") {
    Viewer.clearOverlay();
    return;
  }

  select.blur();

  for (var i = dataSets.length - 1; i >= 0; i--) {
    if(dataSets[i].name == select.value) {
      loadOverlay(i);
      return;
    }
  };
}

function loadData(setNum) {
  var set = dataSets[setNum];
  var data = getDataSetStruct(set);

  $('dataset-notes').innerHTML = set.notes;

  Viewer.loadData(data);
  loadSetChooser($('overlay-chooser'), overlaySets(set));
}

function loadOverlay(setNum) {
  var set = dataSets[setNum];
  var data = getDataSetStruct(set);
  Viewer.loadOverlay(data);
}

function sizeCanvas() {
  var width = $('container').clientWidth;
  var canvas = $('graph');
  var statsPad = (width < 795) ? 170 : 205;
  raw_width = width - statsPad;
  raw_height = Math.max(raw_width * 0.4, 320);
  canvas.style.width=raw_width + 'px';
  canvas.style.height=raw_height + 'px';
  var dpr = window.devicePixelRatio || 1;
  canvas.width = raw_width*dpr;
  canvas.height = raw_height*dpr;
  Viewer.loadSize();
}

function load() {
  Viewer.loadCanvas();
  sizeCanvas();
  loadSetChooser($('dataset-chooser'), dataSets);
  loadSetChooser($('overlay-chooser'), dataSets);
  loadData(0);
}

window.addEventListener('resize', sizeCanvas, false);

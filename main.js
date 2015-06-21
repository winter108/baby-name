var filteredData;
var currentData;
var jsonData;
var currentPercentileFilter = [0, 100];
var currentYearFilter = [2014];
var currentSearchText = "";
var currentGenderFilter = [true, true];

d3.json("data.json", function(error, root) {
  if (error) throw error;
  jsonData = root;
  render();
});

var margin = {top: 0, right: 40, bottom: 200, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function search() {
  currentSearchText = document.querySelector("#search").value;
  render();
}

function genderChecked() {
  var maleCheckbox = document.querySelector("#male-checkbox");
  var femaleCheckbox = document.querySelector("#female-checkbox");
  currentGenderFilter = [maleCheckbox.checked, femaleCheckbox.checked];
  render();
}

function getPercentileData(data, filterArray) {
  var from = 100 - filterArray[0];
  var to = 100 - filterArray[1];
  console.log("Get percentile data from " + from + "to " + to);
  var totalCount = data.length;
  console.log("count = " + totalCount);
  data.sort(function(a, b) { return b.value - a.value; })
  var fromX = totalCount * (from/100.0);
  var toX = totalCount * (to/100.0);
  console.log("Get percentile data from count" + toX + "to " + fromX);
  return data.slice(toX, fromX);
}

function processData(years, searchText) {
  console.log("create years date for " + years);

  var currentNode = jsonData;
  var result = [];
  var queue = new Queue();
  queue.enqueue(currentNode);
  while(!queue.isEmpty()) {
    var node = queue.dequeue();
    for(var key in node){
      if (node.hasOwnProperty(key)) {
        if(key !== "_") {
          queue.enqueue(node[key]);
        }
      }
    }

    if(node["_"] !== undefined && node["_"]["n"].substring(0, searchText.length) === searchText) {
      var name = node["_"]["n"];
      var maleCount = 0;
      var femaleCount = 0;
      _.forEach(years, function(year) {
          if(currentGenderFilter[0] && node["_"]["c"]["0"][year] !== undefined) {
            maleCount += parseInt(node["_"]["c"]["0"][year]);
          }
          if(currentGenderFilter[1] && node["_"]["c"]["1"][year] !== undefined) {
            femaleCount += parseInt(node["_"]["c"]["1"][year]);
          }
      })
      if(maleCount > 0) {
        result.push({ n: name, g: 'M', value: maleCount});
      }
      if(femaleCount > 0) {
        result.push({ n: name, g: 'F', value: femaleCount});
      }
    }
  }
  console.log("---finishing create years date for " + years);
  return result;
}

function render() {
  var data = getPercentileData(processData(currentYearFilter, currentSearchText), currentPercentileFilter);
  if(data.length == 0) {
    return;
  }
  var nodesData = { children: data.slice(0, 3000) };
  console.log("Start Render nodes!");
  svg.selectAll(".node").remove();

  var node = svg.selectAll(".node")
      .data(bubble.nodes(nodesData)
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.n + ": " + d.value; });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) {
          return color(d.n.charCodeAt(0) - "A".charCodeAt(0));
        });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) {
          return d.n.substring(0, d.r / 3);
        });
    console.log("Render finishes!");
}

////Brush
var brushHeight = 100;

var x = d3.time.scale()
    .domain([new Date(1880, 1, 1), new Date(2014, 12, 31)])
    .range([0, width]);

var brush = d3.svg.brush()
    .x(x)
    .extent([new Date(2014, 1, 1), new Date(2014, 12, 31)])
    .on("brush", brushed)
    .on("brushend", brushEnd);

svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width)
    .attr("height", brushHeight);

svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + brushHeight + ")")
    .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.year, 5)
        .tickSize(-brushHeight)
        .tickFormat(""))
  .selectAll(".tick")
    .classed("minor", function(d) { return d.getYear(); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + brushHeight + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.year, 5)
      .tickPadding(0))
  .selectAll("text")
    .attr("x", 6)
    .style("text-anchor", null);

var gBrush = svg.append("g")
    .attr("class", "brush")
    .call(brush);

gBrush.selectAll("rect")
    .attr("height", brushHeight);

function brushed() {
  console.log("--brushed----");
  var extent0 = brush.extent(),
      extent1;

  // if dragging, preserve the width of the extent
  if (d3.event.mode === "move") {
    var d0 = d3.time.year.round(extent0[0]),
        d1 = d3.time.year.offset(d0, Math.round((extent0[1] - extent0[0]) / 31536e6));
    extent1 = [d0, d1];
  } else {
    // otherwise, if resizing, round both dates
    extent1 = extent0.map(d3.time.year.round);

    // if empty when rounded, use floor & ceil instead
    if (extent1[0] >= extent1[1]) {
      extent1[0] = d3.time.year.floor(extent0[0]);
      extent1[1] = d3.time.year.ceil(extent0[1]);
    }
  }
  d3.select(this).call(brush.extent(extent1));
}

function brushEnd() {
  console.log("--brushEnd----");
  var extent0 = brush.extent();
  extent1 = extent0.map(d3.time.year.round);

  // if empty when rounded, use floor & ceil instead
  if (extent1[0] >= extent1[1]) {
    extent1[0] = d3.time.year.floor(extent0[0]);
    extent1[1] = d3.time.year.ceil(extent0[1]);
  }
  currentYearFilter = d3.range(extent1[0].getFullYear(), extent1[1].getFullYear());
  render();
}

var percentileBrushHeight = 1000;

var percentileX = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

var percentileBrush = d3.svg.brush()
    .x(percentileX)
    .extent([0, 100])
    .on("brush", percentileBrushed)
    .on("brushend", percentileBrushEnd);

svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width)
    .attr("height", brushHeight)
    .attr("y", percentileBrushHeight - brushHeight);

svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + percentileBrushHeight + ")")
    .call(d3.svg.axis()
        .scale(percentileX)
        .orient("bottom")
        .tickSize(-brushHeight));

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + percentileBrushHeight + ")")
    .call(d3.svg.axis()
      .scale(percentileX)
      .orient("bottom")
      .tickPadding(0))
  .selectAll("text")
    .attr("x", 6)
    .style("text-anchor", null);

var gPercentileBrush = svg.append("g")
    .attr("class", "brush")
    .call(percentileBrush);

gPercentileBrush.selectAll("rect")
    .attr("y", percentileBrushHeight - brushHeight)
    .attr("height", brushHeight);

function percentileBrushed() {
  console.log("--percentileBrushed----");
}

function percentileBrushEnd() {
  var extent0 = percentileBrush.extent();
  currentPercentileFilter = [extent0[0], extent0[1]];
  render();
}
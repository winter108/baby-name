var filteredData;
var currentData;
var jsonData;
var yearRanges = d3.range(1880,2015);
var currentPercentileFilter = [90, 100];
var currentYearFilter = [2014];
var currentSearchText = "";
var currentGenderFilter = [true, true];
var uniqueNameCount = {};

d3.json("data.json", function(error, root) {
  if (error) throw error;
  jsonData = root;
  render();
});

var margin = {top: 20, right: 20, bottom: 200, left: 20},
    width = 1140 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var percentileSliderSvgHeight = 80,
    percentileSliderSvgWidth= 500;

var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1);

var svg = d3.select("#chart").append("svg")
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
      _.forEach(yearRanges, function(year) {

        if(currentGenderFilter[0] && node["_"]["c"]["0"][year] !== undefined) {
          uniqueNameCount[year] = uniqueNameCount[year] === undefined ? 1 : uniqueNameCount[year] + 1;
          maleCount += parseInt(node["_"]["c"]["0"][year]);
        }
        if(currentGenderFilter[1] && node["_"]["c"]["1"][year] !== undefined) {
          uniqueNameCount[year] = uniqueNameCount[year] === undefined ? 1 : uniqueNameCount[year] + 1;
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
  YearChart.render(uniqueNameCount);
  console.log("---finishing create years date for " + years);
  return result;
}

function render() {
  var data = getPercentileData(processData(currentYearFilter, currentSearchText), currentPercentileFilter);
  if(data.length == 0) {
    return;
  }
  var nodesData = { children: data.slice(0, 1000) };
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


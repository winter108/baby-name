var currentPercentileFilter = [90, 100];

(function() {
  var percentileSliderSvgWidth = 500,  percentileSliderSvgHeight = 80;
  var margin = {top: 20, right: 20, bottom: 20, left: 20};

  var percentileSliderSvg = d3.select("#percentile-slider").append("svg")
    .attr("width", percentileSliderSvgWidth + margin.left + margin.right)
    .attr("height", percentileSliderSvgHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var percentileMargin = 20;
  var percentileBrushHeight = 10;

  var percentileX = d3.scale.linear()
      .domain([0, 100])
      .range([0, percentileSliderSvgWidth]);

  var percentileBrush = d3.svg.brush()
      .x(percentileX)
      .extent(currentPercentileFilter)
      .on("brush", percentileBrushed)
      .on("brushend", percentileBrushEnd);

  percentileSliderSvg.append("rect")
      .attr("class", "grid-background")
      .attr("width", percentileSliderSvgWidth)
      .attr("height", percentileBrushHeight)
      .attr("y", percentileMargin - percentileBrushHeight);

  percentileSliderSvg.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(0," + percentileMargin + ")")
      .call(d3.svg.axis()
          .scale(percentileX)
          .orient("bottom")
          .tickSize(-percentileBrushHeight));

  var gPercentileBrush = percentileSliderSvg.append("g")
      .attr("class", "brush")
      .call(percentileBrush);

  gPercentileBrush.selectAll("rect")
      .attr("y", percentileMargin - percentileBrushHeight)
      .attr("height", percentileBrushHeight);

  function percentileBrushed() {
    console.log("--percentileBrushed----");
  }

  function percentileBrushEnd() {
    var extent0 = percentileBrush.extent();
    currentPercentileFilter = [extent0[0], extent0[1]];
    render();
  }
})()
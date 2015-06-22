(function() {
  var margin = {top: 20, right: 20, bottom: 200, left: 20},
    width = 1140 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  var yearSliderSvgHeight = 80,
    yearSliderBrushHeight = 30;

  var arc = d3.svg.arc()
    .outerRadius(30 / 2)
    .startAngle(0)
    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

  var yearSliderSvg = d3.select("#year-slider").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", yearSliderSvgHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  ////Brush
  var x = d3.time.scale()
      .domain([new Date(1880, 1, 1), new Date(2014, 12, 31)])
      .range([0, width]);

  var brush = d3.svg.brush()
      .x(x)
      .extent([new Date(2014, 1, 1), new Date(2014, 12, 31)])
      .on("brush", brushed)
      .on("brushend", brushEnd);

  yearSliderSvg.append("rect")
      .attr("class", "grid-background")
      .attr("width", width)
      .attr("height", yearSliderBrushHeight);

  yearSliderSvg.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(0," + yearSliderBrushHeight + ")")
      .call(d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(d3.time.year, 5)
          .tickSize(-yearSliderBrushHeight));

  var gBrush = yearSliderSvg.append("g")
      .attr("class", "brush")
      .call(brush);

  gBrush.selectAll(".resize").append("path")
      .attr("transform", "translate(0," +  yearSliderBrushHeight / 2 + ")")
      .attr("d", arc);

  gBrush.selectAll("rect")
      .attr("height", yearSliderBrushHeight);

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
})()
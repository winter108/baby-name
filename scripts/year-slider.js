YearChart = (function() {
  var svgWidth = 1170, svgHeight = 460;
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

  var yearSliderBrushHeight = 40,
    focusChartHeight = 320;

  var arc = d3.svg.arc()
    .outerRadius(30 / 2)
    .startAngle(0)
    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

  var yearChartsSvg = d3.select("#year-slider").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xFocus = d3.scale.linear().range([0, width]),
    yFocus = d3.scale.linear().range([focusChartHeight, 0]);

  var xContext = d3.scale.linear().range([0, width]);
  var yContext = d3.scale.linear().range([yearSliderBrushHeight, 0]);

  var xAxisContext = d3.svg.axis().scale(xContext).orient("bottom"),
      xAxisFocus = d3.svg.axis().scale(xFocus).orient("bottom"),
      yAxisFocus = d3.svg.axis().scale(yFocus).orient("left");

  var areaContext = d3.svg.area()
    .x(function(d) { return xContext(d.year); })
    .y0(yearSliderBrushHeight)
    .y1(function(d) { return yContext(d.count); });

  var areaFocus = d3.svg.area()
    .x(function(d) { return xFocus(d.year); })
    .y0(focusChartHeight)
    .y1(function(d) { return yFocus(d.count); });


  var currentFocus, currentContext, currentDomain;

  function renderYearChart(uniqueNamedata) {

    var data = _.map(uniqueNamedata, function(value, key) {
      return {year: key, count: value};
    });

    if(currentDomain === undefined) {
      xContext.domain(d3.extent(data.map(function(d) { return d.year; })));
      xFocus.domain(xContext.domain());
    }

    yContext.domain([0, d3.max(data.map(function(d) { return d.count; }))]);
    yFocus.domain(yContext.domain());


    if(currentFocus !== undefined && currentContext !== undefined) {
      currentFocus.remove();
      currentContext.remove();
    }

    var focus = yearChartsSvg.append("g")
      .attr("class", "focus")
      .attr("width", width)
      .attr("height", focusChartHeight)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = yearChartsSvg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin.left + "," + (focusChartHeight + 20) + ")");

    focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", areaFocus);

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + focusChartHeight + ")")
        .call(xAxisFocus);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxisFocus);

    context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", areaContext);

    currentFocus = focus;
    currentContext = context;
  }

  var brush = d3.svg.brush()
      .x(xContext)
      .extent([1880, 1881])
      .on("brush", brushed)
      .on("brushend", brushEnd);

  yearChartsSvg.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(20," + (focusChartHeight + 20) + ")")
      .call(d3.svg.axis()
          .scale(xContext)
          .orient("bottom")
          .ticks(1)
          .tickSize(-yearSliderBrushHeight));

  var gBrush = yearChartsSvg.append("g")
      .attr("transform", "translate(20," + (focusChartHeight + 20) + ")")
      .attr("class", "brush")
      .call(brush);

  // gBrush.selectAll(".resize").append("path")
  //     .attr("transform", "translate(0," +  yearSliderBrushHeight / 2 + ")")
  //     .attr("d", arc);

  gBrush.selectAll("rect")
      .attr("height", yearSliderBrushHeight);

  function brushed() {
    console.log("--brushed----");
    var extent0 = brush.extent(),
        extent1;

    // if dragging, preserve the width of the extent
    if (d3.event.mode === "move") {
      var d0 = Math.round(extent0[0]),
          d1 = Math.round(extent0[1]);
      extent1 = [d0, d1];
    } else {
      // otherwise, if resizing, round both dates
      extent1 = extent0.map(Math.round);

      // if empty when rounded, use floor & ceil instead
      if (extent1[0] >= extent1[1]) {
        extent1[0] = Math.floor(extent0[0]);
        extent1[1] = Math.ceil(extent0[1]);
      }
    }
    d3.select(this).call(brush.extent(extent1));
  }

  function brushEnd() {
    console.log("--brushEnd----");
    var extent0 = brush.extent();
    extent1 = extent0.map(Math.round);

    // if empty when rounded, use floor & ceil instead
    if (extent1[0] >= extent1[1]) {
      extent1[0] = Math.floor(extent0[0]);
      extent1[1] = Math.ceil(extent0[1]);
    }
    currentYearFilter = d3.range(extent1[0], extent1[1]);

    currentDomain = brush.empty() ? xContext.domain() : brush.extent();
    xFocus.domain(currentDomain);
    currentFocus.select(".area").attr("d", areaFocus);
    currentFocus.select(".x.axis").call(xAxisFocus);

    render();
  }

  return {
    render: renderYearChart
  }
})()
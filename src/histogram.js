// set the dimensions and margins of the graph
const histoMargin = {top: 10, right: 30, bottom: 30, left: 40},
    histoWidth = 460 - histoMargin.left - histoMargin.right,
    histoHeight = 400 - histoMargin.top - histoMargin.bottom;

d3.select("body").append("div")
    .attr("id", "my_dataviz")


// append the svg object to the body of the page
const histoSvg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", histoWidth + histoMargin.left + histoMargin.right)
    .attr("height", histoHeight + histoMargin.top + histoMargin.bottom)
    .append("g")
    .attr("transform",
        `translate(${histoMargin.left},${histoMargin.top})`);

// get the data
d3.csv("./data/all_steam_games_with_time_data_prepared_for_vis.csv").then( function(data) {

    // X axis: scale and draw:
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.main_50 })])
        .range([0, histoWidth]);
    histoSvg.append("g")
        .attr("transform", `translate(0, ${histoHeight})`)
        .call(d3.axisBottom(x));


    // set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function(d) { return d.main_50; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(data);

    // Y axis: scale and draw:
    const y = d3.scaleLinear()
        .range([histoHeight, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    histoSvg.append("g")
        .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    histoSvg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1})
        .attr("height", function(d) { return histoHeight - y(d.length); })
        .style("fill", "#69b3a2")


    console.log(histogram.value())

});
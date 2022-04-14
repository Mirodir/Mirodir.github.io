// create svg canvas
const canvHeight = 700, canvWidth = 1600;
const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");

// calc the width and height depending on margins.
const margin = {top: 50, right: 80, bottom: 50, left: 60};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

const yData = ["score", "initialprice"]
const xData = ["main_50", "completion_time_100", "main_extra_time_50"]


d3.select("body").append("select")
    .attr("id", "selectYButton")
d3.select("body").append("select")
    .attr("id", "selectXButton")

d3.select("#selectYButton")
    .selectAll('select')
    .data(yData)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; })

d3.select("#selectXButton")
    .selectAll('select')
    .data(xData)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; })




// chart title
svg.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text("Review Score vs Game Length");

// create parent group and add left and top margin
const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

// text label for the x axis
g.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Time to beat in hours");

 // text label for the y axis
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Review Rating in %");

function createLegend(legendDomain, colorScale) {
    // 1. create a group to hold the legend
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (canvWidth - margin.right + 10) + "," + margin.top + ")")


    const legend_entry = legend.selectAll("rect")
        .data(legendDomain)
        .enter();

    //   b. add coloured rect to legend_entry
    legend_entry.append("rect")
        .attr("x", 10)
        .attr("y", (d,i) => 30 * i + 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d))
        .attr("stroke", "black")
        .attr("stroke-width", "1");

    //   c. add text label to legend_entry
    legend_entry.append("text")
        .attr("x", 40)
        .attr("y", (d,i) => 30 * i + 25)
        .text(d => d);

    // 3. create the main border of the legend
    legend.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", margin.right - 15)
        .attr("height", legendDomain.length * 30 + 10)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1");

}




d3.csv("./data/all_steam_games_with_time_data_prepared_for_vis.csv").then(function(data) {
    let xDomain = d3.extent(data, d => Number(d.main_50));
    let yDomain = d3.extent(data, d => Number(d.score));
    console.log(yDomain);

    // 1. create scales for x and y direction and for the color coding
    let xScale = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([0, width]);

    let yScale = d3.scaleLinear()
        .domain(yDomain)
        .rangeRound([height, 0])
        .nice(5);
        
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // 2. create and append
    //    a. x-axis
    let xAxis = d3.axisBottom(xScale);
    g.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, "+ height +")")
        .call(xAxis);

    //    b. y-axis
    let yAxis = d3.axisLeft(yScale);
    g.append("g")
        .attr("id", "y-axis")
        .call(yAxis);


    // 3. add data-points (circle)
    var data_points = g.selectAll("circle")
        .data(data)
            .join('circle')  // .style("fill", d=> colorScale(d["Shirt Size"]))
            .attr("class", "game_data_point")
            .attr("cx", d=> xScale(d.main_50))
            .attr("cy", d=> yScale(d.score))
            .attr("r", 1.5)
        ;

    // 4. create legend
    // let legendDomain = ["XS", "S", "M", "L", "XL"];
    // createLegend(legendDomain, colorScale);

    // 5. Create tooltip
    var tooltip = d3.select("body").append("div").classed("tooltip", true);
    g.selectAll("circle").on("mouseover", (event, d) => {
        var pos = d3.pointer(event, d);
        tooltip
            .style("left", pos[0] + "px")
            .style("top", pos[1] - 28 + "px")
            .style("visibility", "visible")
            .html(`Name: ${d.name}<br/>`
            + `Main Story Time: ${Math.round(d.main_time*100)/100} hours<br/>`
            + `Score: ${Math.round(d.score*100)/100}%<br/>`
            + `<img alt="game image" src="https://howlongtobeat.com${d.pic_url}" width="150">`);
    })
    .on("mouseout", (event, d) => {
        tooltip.style("visibility", "hidden");
    });


    d3.select("#selectYButton").on("change", function(event,d) {
        const selectedOption = d3.select(this).property("value")
        switchYAxis(selectedOption)
    })

    d3.select("#selectXButton").on("change", function(event,d) {
        const selectedOption = d3.select(this).property("value")
        switchXAxis(selectedOption)
    })



    function switchYAxis(selectedGroup) {

        console.log(data)
        yDomain = d3.extent(data, d => Number(d[selectedGroup]));
        console.log(yDomain)
        yScale = d3.scaleLinear()
            .domain(yDomain)
            .rangeRound([height, 0])
            .nice(5);

        yAxis = d3.axisLeft(yScale);
        // g.remove("y-axis")
        g.append("g")
            .attr("id", "y-axis")
            .call(yAxis);


        data_points
            .data(data)
            .transition()
            .duration(1000)
            .attr("cy", d=> yScale(d[selectedGroup]));

    }

    function switchXAxis(selectedGroup) {


        xDomain = d3.extent(data, d => Number(d[selectedGroup]));
        xScale = d3.scaleLinear()
            .domain(xDomain)
            .rangeRound([0, width])

        xAxis = d3.axisBottom(xScale);
        g.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0, "+ height +")")
            .call(xAxis);


        data_points
            .data(data)
            .transition()
            .duration(1000)
            .attr("cx", d=> xScale(d[selectedGroup]));

    }


});


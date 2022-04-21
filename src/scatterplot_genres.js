// create svg canvas
const canvHeight = 700, canvWidth = 1600;
const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");

const margin = {top: 50, right: 80, bottom: 50, left: 60};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

const yData = ["score", "initialprice"]
const xData = ["main_50", "completion_time_100", "main_extra_time_50", "bonus_content_500"]

let currentGenre = "";


var data_points;

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




svg.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text("Review Score vs Game Length");

const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

g.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Time to beat in hours");

g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Review Rating in %");

function createLegend(legendDomain, colorScale) {
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (canvWidth - margin.right + 10) + "," + margin.top + ")")
        .on("click", function (event){
            // console.log(this)
            const genre = event.target.getAttribute("data-genre");
            // console.log(genre)
            // if (hiddenGenres.includes(genre)){
            //     data_points.filter(function (d){return d['single_genre'] === genre;})
            //         .style("display", "block")
            //     hiddenGenres.splice(hiddenGenres.indexOf(genre));
            //     }
            // else {
            //     data_points.filter(function (d) {
            //         return d['single_genre'] === genre;
            //     })
            //         .style("display", "none")
            //     hiddenGenres.push(genre);
            // }

            if (genre === currentGenre){
                data_points.style("display", "block")
                currentGenre = "";
            }
            else {
                data_points.filter(function (d) {
                    return d['single_genre'] === genre;
                })
                    .style("display", "block");

                data_points.filter(function (d) {
                    return d['single_genre'] !== genre;
                })
                    .style("display", "none");
                currentGenre = genre;
            }
        });

    const legend_entry = legend.selectAll("rect")
        .data(legendDomain)
        .enter();

    legend_entry.append("rect")
        .attr("x", 10)
        .attr("y", (d,i) => 30 * i + 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d))
        .attr("stroke", "black")
        .attr("stroke-width", "1")
        .attr("data-genre", d => d);


    legend_entry.append("text")
        .attr("x", 40)
        .attr("y", (d,i) => 30 * i + 25)
        .text(d => d)
        .attr("data-genre", d => d);


    legend.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", margin.right - 15)
        .attr("height", legendDomain.length * 30 + 10)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1");


}


d3.csv("./data/genre_medians.csv").then(function(data) {
    let xDomain = d3.extent(data, d => Number(d.main_50));
    let yDomain = d3.extent(data, d => Number(d.score));

    // 1. create scales for x and y direction and for the color coding
    let xScale = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([0, width]);

    let yScale = d3.scaleLinear()
        .domain(yDomain)
        .rangeRound([height, 0])
        .nice(5);
        
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let xAxis = d3.axisBottom(xScale);
    g.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, "+ height +")")
        .call(xAxis);

    let yAxis = d3.axisLeft(yScale);
    g.append("g")
        .attr("id", "y-axis")
        .call(yAxis);


    // 3. add data-points (circle)
    data_points = g.selectAll("circle")
        .data(data)
            .join('circle')
            .style("fill", d => colorScale(d["single_genre"]))
            .attr("data-genre", d => d["single_genre"])
            .attr("class", "game_data_point")
            .attr("cx", d => xScale(d.main_50))
            .attr("cy", d => yScale(d.score))
            .attr("r", 1.5)
            .classed("active", true);

    // 4. create legend
    let legendDomain = ["Indie",
        "Adventure",
        "Action",
        "Casual",
        "RPG",
        "Strategy",
        "Simulation",
        "Racing",
        "Sports",
        "Massively Multiplayer"];
    createLegend(legendDomain, colorScale);

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

        yDomain = d3.extent(data, d => Number(d[selectedGroup]));
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


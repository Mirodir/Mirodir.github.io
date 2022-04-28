// create svg canvas
const canvHeight = 700, canvWidth = 1600;
const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");
//
// const svgGenres = d3.select("body").append("svg")
//     .attr("width", canvWidth)
//     .attr("height", canvHeight)
//     .style("border", "1px solid");


const margin = {top: 50, right: 200, bottom: 50, left: 60};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

const xData = [
    {
        label:"Time to beat main game",
        value:"main_50",
        axis:"Time to beat the main story in hours"
    },    {
        label:"Time to beat main game and extras",
        value:"main_extra_time_50",
        axis:"Time to complete main game and some bonus content in hours"

    },    {
        label:"Time to complete everything",
        value:"completion_time_100",
        axis:"Time to see and do everything a game has to offer in hours"

    },    {
        label:"Time spent only on bonus content",
        value:"bonus_content_500",
        axis:"Time to see and do everything a game has to offer that is not part of the main story in hours"
    }
];
const yData = [
    {
        label:"review score",
        value:"score",
        axis:"Review Rating in %"
    },
    {
        label:"price",
        value:"initialprice",
        axis:"Price of the game not on sale in USD"
    },
    {
        label:"Concurrent Users",
        value:"ccu",
        axis:"Average amount of concurrent players"
    }
];

let currentGenre = "";
let drawnXAxis;
let drawnYAxis;
let xAxisLabel;
let yAxisLabel;
let currXAxis = "main_50";
let currYAxis = "score";
let xDomain;
let yDomain;
let xScale;
let yScale;
let trendline;
let tLine;
let colorScale;

var data_points;

d3.select("body").append("select")
    .attr("id", "selectYButton")
d3.select("body").append("select")
    .attr("id", "selectXButton")

d3.select("body").append('input')
    .attr('type','text')
    .attr('id','filterGames')
    .attr('name','filterGames')

d3.select("#selectYButton")
    .selectAll('select')
    .data(yData)
    .enter()
    .append('option')
    .text(function (d) { return d.label; })
    .attr("value", function (d) { return d.value; })

d3.select("#selectXButton")
    .selectAll('select')
    .data(xData)
    .enter()
    .append('option')
    .text(function (d) { return d.label; })
    .attr("value", function (d) { return d.value; })

svg.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .attr("text-type", "chart-title")
    .style("text-anchor", "left")
    .text("Games on Steam");

const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

xAxisLabel = g.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "x-axis-label")
    .style("text-anchor", "middle")
    .text("Time to beat in hours");

yAxisLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "y-axis-label")
    .style("text-anchor", "middle")
    .text("Review Rating in %");

function createLegend(legendDomain, data) {
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (canvWidth - margin.right+10) + "," + margin.top + ")")
        .on("click", function (event){
            const genre = event.target.getAttribute("data-genre");
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

            var xSeries = data.filter(function (e){
                if (currentGenre !== ""){
                    return e["single_genre"] === currentGenre;}
                else {return true;}
            })
                .map(function(d) {
                    return parseFloat(d[currXAxis]); });

            var ySeries = data.filter(function (e){
                if (currentGenre !== ""){
                    return e["single_genre"] === currentGenre;}
                else {return true;}
            })
                .map(function(d) {
                    return parseFloat(d[currYAxis]); });

            updateTrendline(xSeries, ySeries)


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


d3.csv("./data/all_steam_games_with_time_data_prepared_for_vis.csv").then(function(data) {
    xDomain = d3.extent(data, d => Number(d.main_50));
    yDomain = d3.extent(data, d => Number(d.score));

    xScale = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([0, width]);

    yScale = d3.scaleLinear()
        .domain(yDomain)
        .rangeRound([height, 0])
        .nice(5);

    colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let xAxis = d3.axisBottom(xScale);
    drawnXAxis = g.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

    let yAxis = d3.axisLeft(yScale);
    drawnYAxis = g.append("g")
        .attr("id", "y-axis")
        .call(yAxis);


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
    createLegend(legendDomain, data);

    var tooltip = d3.select("body").append("div").classed("tooltip", true);
    g.selectAll("circle").on("mouseover", (event, d) => {
        var pos = d3.pointer(event, d);
        tooltip
            .style("left", pos[0] + "px")
            .style("top", pos[1] - 28 + "px")
            .style("visibility", "visible")
            .html(`Name: ${d.name}<br/>`
                + `Price: ${Math.round(d.initialprice * 100) / 100} USD<br/>`
                + `Main Story Time: ${Math.round(d.main_time * 100) / 100} hours<br/>`
                + `Main Story+Extras Time: ${Math.round(d.main_extra_time * 100) / 100} hours<br/>`
                + `100% Time: ${Math.round(d.completion_time * 100) / 100} hours<br/>`
                + `Concurrent Users: ${Math.round(d.ccu * 100) / 100} players<br/>`
                + `Score: ${Math.round(d.score * 100) / 100}%<br/>`
                + `<img alt="game image" src="https://howlongtobeat.com${d.pic_url}" width="300">`);
    })
        .on("mouseout", (event, d) => {
            tooltip.style("visibility", "hidden");
        });


    d3.select("#selectYButton").on("change", function (event, d) {
        const selectedOption = d3.select(this).property("value")
        switchYAxis(selectedOption)
    })

    d3.select("#selectXButton").on("change", function (event, d) {
        const selectedOption = d3.select(this).property("value")
        switchXAxis(selectedOption)
    })

    d3.select("#filterGames").on("input", function (event, d) {
        const toFilterFor = d3.select(this).property("value")
        hideGamesWithoutSubstring(toFilterFor);
    })


    function switchYAxis(selectedGroup) {
        currYAxis = selectedGroup
        yDomain = d3.extent(data, d => Number(d[currYAxis]));
        yScale = d3.scaleLinear()
            .domain(yDomain)
            .rangeRound([height, 0])
            .nice(5);

        yAxis = d3.axisLeft(yScale);
        drawnYAxis.call(yAxis);

        let newAxisText;

        for (let datum in yData) {
            if (yData[datum].value === currYAxis){
                newAxisText = yData[datum].axis;
            }
        }
        yAxisLabel.text(newAxisText)


        data_points
            .data(data)
            .transition()
            .duration(1000)
            .attr("cy", d=> yScale(d[currYAxis]));

        var xSeries = data.filter(function (e){
            if (currentGenre !== ""){
                return e["single_genre"] === currentGenre;}
            else {return true;}
        })
            .map(function(d) {
                return parseFloat(d[currXAxis]); });

        var ySeries = data.filter(function (e){
            if (currentGenre !== ""){
                return e["single_genre"] === currentGenre;}
            else {return true;}
        })
            .map(function(d) {
                return parseFloat(d[currYAxis]); });

        updateTrendline(xSeries, ySeries)
    }

    function switchXAxis(selectedGroup) {
        currXAxis = selectedGroup
        xDomain = d3.extent(data, d => Number(d[currXAxis]));
        xScale = d3.scaleLinear()
            .domain(xDomain)
            .rangeRound([0, width])

        xAxis = d3.axisBottom(xScale);
        let newAxisText;
        for (let datum in xData) {
            if (xData[datum].value === currXAxis){
                newAxisText = xData[datum].axis;
            }
        }
        xAxisLabel.text(newAxisText)

        drawnXAxis.call(xAxis);


        data_points
            .data(data)
            .transition()
            .duration(1000)
            .attr("cx", d=> xScale(d[currXAxis]));


        var xSeries = data.filter(function (e){
            if (currentGenre !== ""){
                return e["single_genre"] === currentGenre;}
            else {return true;}
        })
            .map(function(d) {
                return parseFloat(d[currXAxis]); });

        var ySeries = data.filter(function (e){
            if (currentGenre !== ""){
                return e["single_genre"] === currentGenre;}
            else {return true;}
        })
            .map(function(d) {
                return parseFloat(d[currYAxis]); });

        updateTrendline(xSeries, ySeries)


    }

    var xSeries = data.filter(function (e){
        if (currentGenre !== ""){
            return e["single_genre"] === currentGenre;}
        else {return true;}
    })
        .map(function(d) {
            return parseFloat(d[currXAxis]); });

    var ySeries = data.filter(function (e){
        if (currentGenre !== ""){
            return e["single_genre"] === currentGenre;}
        else {return true;}
    })
        .map(function(d) {
            return parseFloat(d[currYAxis]); });


    drawTrendline(xSeries, ySeries);

    function hideGamesWithoutSubstring(substring){
        {
                data_points.filter(function (d) {
                    return d['name'].toLowerCase().includes(substring.toLowerCase());
                })
                    .style("display", "block");

                data_points.filter(function (d) {
                    return !d['name'].toLowerCase().includes(substring.toLowerCase());
                })
                    .style("display", "none");
            }

            // var xSeries = data.filter(function (e){
            //     if (currentGenre !== ""){
            //         return e["single_genre"] === currentGenre;}
            //     else {return true;}
            // })
            //     .map(function(d) {
            //         return parseFloat(d[currXAxis]); });
            //
            // var ySeries = data.filter(function (e){
            //     if (currentGenre !== ""){
            //         return e["single_genre"] === currentGenre;}
            //     else {return true;}
            // })
            //     .map(function(d) {
            //         return parseFloat(d[currYAxis]); });
            //
            // updateTrendline(xSeries, ySeries)
    }

});


function drawTrendline(xSeries, ySeries){
    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    var x1 = 0;
    var y1 = leastSquaresCoeff[1];
    var x2 = xDomain[xDomain.length - 1];
    var y2 = leastSquaresCoeff[0] * xDomain[xDomain.length - 1] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];

    trendline = g.selectAll("trendline")
        .data(trendData);

    tLine = trendline.enter()
        .append("line")
        .attr("class", "trendline")
        .attr("x1", function(d) { return xScale(d[0]); })
        .attr("y1", function(d) { return yScale(d[1]); })
        .attr("x2", function(d) { return xScale(d[2]); })
        .attr("y2", function(d) { return yScale(d[3]); })
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}



function updateTrendline(xSeries, ySeries){
    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    console.log("hiho")

    var x1 = 0;
    var y1 = leastSquaresCoeff[1];
    var x2 = xDomain[xDomain.length - 1];
    var y2 = leastSquaresCoeff[0] * xDomain[xDomain.length - 1] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];

    trendline = g.selectAll("trendline")
        .data(trendData);

    trendline.selectAll("line").data(function (d){return d;});

    console.log(colorScale);

    tLine.transition()
        .duration(1000)
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    console.log(tLine)

}


//from http://bl.ocks.org/benvandyke/8459843
function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };

    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);

    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);

    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);

    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return [slope, intercept, rSquare];
}

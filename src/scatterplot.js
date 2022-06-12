var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");
let heightMod = 0.9;

// initialize the scrollama
var scroller = scrollama();

function handleResize() {
    var stepH = Math.floor(window.innerHeight * heightMod);
    var figureHeight = window.innerHeight / 1.2;
    var figureMarginTop = (window.innerHeight - figureHeight) / 5;

    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {

    step.classed("is-active", function (d, i) {
        return i === response.index;
    });

    switch (response.index){
        case 0:
            // genres
            svgAllGames.attr("display", "none");
            svgGenres.attr("display", "block");
            break;
        case 1:
            // Adventure Games
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            selectGenre("Adventure");
            break;
        case 2:
            // Racing Games
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            selectGenre("Racing");
            break;
        case 3:
            // Sports
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            selectGenre("Sports");
            legendAllGames.on('click', null);
            YSelect.value = "score";
            YSelect.dispatchEvent(new Event('change'));
            break;
        case 4:
            //All Games
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            legendAllGames.on("click", function (event){
                const genre = event.target.getAttribute("data-genre");
                selectGenre(genre);
            })
            YSelect.disabled = true;
            XSelect.disabled = false;
            YSelect.value = "score";
            YSelect.dispatchEvent(new Event('change'));
            break;
        case 5:
            //Price
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            YSelect.disabled = false;
            XSelect.disabled = false;
            YSelect.value = "initialprice";
            YSelect.dispatchEvent(new Event('change'));
            break;
        case 6:
            //MMO Prices
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            selectGenre("MMO");
            YSelect.disabled = false;
            XSelect.disabled = false;
            YSelect.value = "initialprice";
            YSelect.dispatchEvent(new Event('change'));
            break;
        case 7:
            //Feel free to explore
            svgAllGames.attr("display", "block");
            svgGenres.attr("display", "none");
            if (currentGenre !== ""){
                selectGenre(currentGenre);
            }
            YSelect.disabled = false;
            XSelect.disabled = false;
            YSelect.value = "score";
            YSelect.dispatchEvent(new Event('change'));
            gameSearch.disabled = false;
            break;

    }

}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
    });
}

function init() {
    setupStickyfill();
    handleResize();
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.6,
            debug: false,
            threshold: 1
        })
        .onStepEnter(handleStepEnter);
}
init();


// create svg canvas
const margin = {top: 10, right: 100, bottom: 10, left: 50};
const width = window.innerWidth*0.8;
const height = window.innerHeight*0.9;


// const canvHeight = 700, canvWidth = 1600;
const svgAllGames = figure.append("svg")
    .attr("width", width*1.2)
    .attr("height", height)
    .attr("display", "none");

const svgGenres = figure.append("svg")
    .attr("width", width*1.2)
    .attr("height", height)
    .attr("display", "block");


const xData = [
    {
        label:"Time to beat main game",
        value:"main_70_noise",
        trueValue:"main_time",
        axis:"Main Story, hours, cut off at 71"
    },    {
        label:"Time to beat main game and extras",
        value:"main_extra_time_70_noise",
        trueValue:"main_extra_time",
        axis:"Main Story + some extra content, hours, cut off at 71"

    },    {
        label:"Time to complete everything",
        value:"completion_time_250_noise",
        trueValue:"completion_time_250",
        axis:"Time to 100% a game, hours, cut off at 251"

    },    {
        label:"Time spent only on bonus content",
        value:"bonus_content_250_noise",
        trueValue:"bonus_content_250",
        axis:"Time to 100% a game besides main story, hours, cut off at 251"
    }
];
const yData = [
    {
        label:"review score",
        value:"score",
        axis:"Review Rating, %"
    },
    {
        label:"price",
        value:"initialprice",
        axis:"Price, USD"
    },
    //concurrent users looks bad without log scaling, so I removed it entirely.
    // {
    //     label:"Concurrent Users",
    //     value:"ccu_5k",
    //     axis:"Concurrent players"
    // }
];

let currentGenre = "";
let drawnXAxis;
let drawnYAxis;
let xAxisLabelAllGames;
let yAxisLabelAllGames;
let xAxisLabelGenres;
let yAxisLabelGenres;
let currXAxis = "main_70_noise";
let currYAxis = "score";
let xDomain;
let yDomain;
let xScale;
let yScale;
let trendline;
let tLine;
let colorScale;
let globalData;
let legendAllGames;

var data_points;

let divUserControls = figure.append("div")
    .attr("id", "divUserControls");

let divYselect = divUserControls.append("div")
    .attr("id", "divYselect")
divYselect.append("label")
    .attr("id", "forSelectYButton")
    .html("Y-axis:");
divYselect.append("select")
    .attr("id", "selectYButton")

let divXselect = divUserControls.append("div")
    .attr("id", "divXselect")
divXselect.append("label")
    .attr("id", "forSelectXButton")
    .html("X-axis:");
divXselect.append("select")
    .attr("id", "selectXButton")

divUserControls.append('input')
    .attr('type','text')
    .attr('id','filterGames')
    .attr('name','filterGames')
    .attr('placeholder','search games');
let gameSearch = document.getElementById("filterGames");
gameSearch.disabled = true;



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

let YSelect = document.getElementById("selectYButton");
let XSelect = document.getElementById("selectXButton");

YSelect.disabled = true;
XSelect.disabled = true;

// svg.append("text")
//     .attr("y", 0)
//     .attr("x", margin.left)
//     .attr("dy", "1.5em")
//     .attr("font-family", "sans-serif")
//     .attr("font-size", "24px")
//     .attr("text-type", "chart-title")
//     .style("text-anchor", "left")
//     .text("Games on Steam");

const chartAreaAllGames = svgAllGames.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

const chartAreaGenres = svgGenres.append("g")
    .attr("id", "chart-area2")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

xAxisLabelAllGames = chartAreaAllGames.append("text")
    .attr("y", height *heightMod*1.05)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "x-axis-label")
    .style("text-anchor", "middle")
    .text("Main Story, hours, cut off at 71\n");

xAxisLabelGenres = chartAreaGenres.append("text")
    .attr("y", height *heightMod*1.05)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "x-axis-label")
    .style("text-anchor", "middle")
    .text("Main Story, hours, cut off at 71\n");


yAxisLabelAllGames = chartAreaAllGames.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left*1.1)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "y-axis-label")
    .style("text-anchor", "middle")
    .text("Review Rating, %");

yAxisLabelGenres = chartAreaGenres.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left*1.1)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("text-type", "y-axis-label")
    .style("text-anchor", "middle")
    .text("Review Rating, %");

function selectGenre(genre){
    gameSearch.value='';

    let rects = legendAllGames.selectAll("rect.legend-item");
    let texts = legendAllGames.selectAll("text.legend-item");

    console.log(rects);
    console.log(data_points);

    if (genre === currentGenre){
        data_points.style("display", "block");
        rects.style("opacity", "1");
        texts.style("opacity", "1");
        currentGenre = "";
    }
    else {
        rects.filter(function (d) {
            // if (d.getAttributeNames.includes('data-genre')){
            //     return false;
            // }
            console.log(d);
            return d === genre;
        }).style("opacity", "1");

        rects.filter(function (d) {
            // if (d.getAttributeNames.includes('data-genre')){
            //     return false;
            // }

            return d !== genre;
        }).style("opacity", "0.5");

        texts.filter(function (d) {
            // if (d.getAttributeNames.includes('data-genre')){
            //     return false;
            // }

            return d === genre;
        }).style("opacity", "1");

        texts.filter(function (d) {
            // if (d.getAttributeNames.includes('data-genre')){
            //     return false;
            // }

            return d !== genre;
        }).style("opacity", "0.5");



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



    var xSeries = globalData.filter(function (e){
        if (currentGenre !== ""){
            return e["single_genre"] === currentGenre;}
        else {return true;}
    })
        .map(function(d) {
            return parseFloat(d[currXAxis]); });

    var ySeries = globalData.filter(function (e){
        if (currentGenre !== ""){
            return e["single_genre"] === currentGenre;}
        else {return true;}
    })
        .map(function(d) {
            return parseFloat(d[currYAxis]); });

    updateTrendline(xSeries, ySeries);
}



function createLegend(legendDomain, data) {
    legendAllGames = svgAllGames.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (width-30) + "," + 20 + ")");

    const legend_entryAllGames = legendAllGames.selectAll("rect")
        .data(legendDomain)
        .enter();

    legend_entryAllGames.append("rect")
        .attr("x", 10)
        .attr("y", (d,i) => 30 * i + 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d))
        .attr("data-genre", d => d)
        .attr("class", "legend-item");


    legend_entryAllGames.append("text")
        .attr("x", 40)
        .attr("y", (d,i) => 30 * i + 25)
        .text(d => d)
        .attr("data-genre", d => d)
        .attr("class", "legend-item");


    legendAllGames.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", margin.right - 15)
        .attr("height", legendDomain.length * 30 + 10)
        .attr("fill", "none")

    const legendGenres = svgGenres.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (width-30) + "," + 20 + ")")
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

    const legend_entryGenres = legendGenres.selectAll("rect")
        .data(legendDomain)
        .enter();

    legend_entryGenres.append("rect")
        .attr("x", 10)
        .attr("y", (d,i) => 30 * i + 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d))
        // .attr("stroke", "black")
        // .attr("stroke-width", "1")
        .attr("data-genre", d => d);


    legend_entryGenres.append("text")
        .attr("x", 40)
        .attr("y", (d,i) => 30 * i + 25)
        .text(d => d)
        .attr("data-genre", d => d);


    legendGenres.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", margin.right - 15)
        .attr("height", legendDomain.length * 30 + 10)
        .attr("fill", "none");
    // .attr("stroke", "black")
    // .attr("stroke-width", "1");
}


d3.csv("./data/all_steam_games_with_time_data_prepared_for_vis.csv").then(function(data) {
    globalData = data;
    xDomain = d3.extent(data, d => Number(d.main_70_noise));
    yDomain = d3.extent(data, d => Number(d.score));

    xScale = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([0, width - margin.right]);

    yScale = d3.scaleLinear()
        .domain(yDomain)
        .rangeRound([height*heightMod, 0])
        .nice(5);

    colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let xAxis = d3.axisBottom(xScale);
    drawnXAxis = chartAreaAllGames.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + height*heightMod + ")")
        .call(xAxis);

    let yAxis = d3.axisLeft(yScale);
    drawnYAxis = chartAreaAllGames.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    data_points = chartAreaAllGames.selectAll("circle")
        .data(data)
        .join('circle')
        .style("fill", d => colorScale(d["single_genre"]))
        .attr("data-genre", d => d["single_genre"])
        .attr("class", "game_data_point")
        .attr("cx", d => xScale(d.main_70_noise))
        .attr("cy", d => yScale(d.score))
        .attr("r", 2)
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
        "MMO"];

    createLegend(legendDomain, data);

    var tooltip = d3.select("body").append("div").classed("tooltip", true).attr("id", "tooltip-games");
    chartAreaAllGames.selectAll("circle").on("mouseover", (event, d) => {
        tooltip.html(`<div class="tooltip-text"><b>Name:</b> ${d.name}<br/>`
                + `<b>Price:</b> ${Math.round(d.initialprice * 100) / 100} USD<br/>`
                + `<b>Main Story:</b> ${Math.round(d.main_time * 100) / 100} hours<br/>`
                + `<b>Main Story+Extras:</b> ${Math.round(d.main_extra_time * 100) / 100} hours<br/>`
                + `<b>100%:</b> ${Math.round(d.completion_time * 100) / 100} hours<br/>`
                + `<b>Concurrent Users:</b> ${Math.round(d.ccu * 100) / 100} players<br/>`
                + `<b>Score:</b> ${Math.round(d.score * 100) / 100}%<br/></div>`
                + `<img class="tooltip-image" alt="game image" src="https://howlongtobeat.com${d.pic_url}" width="300">`).style("display", "block");


        var pos = d3.pointer(event, d);
        var e = window.event;

        setTimeout(function (){


            console.log("--------------------")
            console.log(document.getElementById("tooltip-games").clientHeight)
            console.log(e.clientY)
            console.log(window.innerHeight)
            if (document.getElementById("tooltip-games").clientHeight > window.innerHeight - e.clientY){
                console.log("move tooltip");
                pos[1] -= document.getElementById("tooltip-games").clientHeight - (window.innerHeight-e.clientY);
            }


            tooltip
                .style("left", pos[0] + "px")
                .style("top", pos[1] - 28 + "px")


        }, 100)


    })


        .on("mouseout", (event, d) => {
            tooltip.style("display", "none");
        })
        .on("click", (event, d) => {
            let url = "https://store.steampowered.com/app/" + d.appid;
            window.open(url, '_blank').focus();
        });
    ;


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
            .rangeRound([height*heightMod, 0])
            .nice(5);

        yAxis = d3.axisLeft(yScale);
        drawnYAxis.call(yAxis);

        let newAxisText;

        for (let datum in yData) {
            if (yData[datum].value === currYAxis){
                newAxisText = yData[datum].axis;
            }
        }
        yAxisLabelAllGames.text(newAxisText)


        data_points
            .data(globalData)
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
            .rangeRound([0, width - margin.right]);

        xAxis = d3.axisBottom(xScale);
        let newAxisText;
        for (let datum in xData) {
            if (xData[datum].value === currXAxis){
                newAxisText = xData[datum].axis;
            }
        }
        xAxisLabelAllGames.text(newAxisText)

        drawnXAxis.call(xAxis);


        data_points
            .data(globalData)
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

    }

});


d3.csv("./data/genre_medians.csv").then(function(data) {
    // let xDomain = d3.extent(data, d => Number(d.main_50));
    // let yDomain = d3.extent(data, d => Number(d.score));

    let xScale = d3.scaleLinear()
        .domain([0, 71])
        .rangeRound([0, width - margin.right]);

    let yScale = d3.scaleLinear()
        .domain([0,100])
        .rangeRound([height*heightMod, 0])
        .nice(5);

    colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let xAxis = d3.axisBottom(xScale);
    let drawnXAxis = chartAreaGenres.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + height*heightMod + ")")
        .call(xAxis);

    let yAxis = d3.axisLeft(yScale);
    let drawnYAxis = chartAreaGenres.append("g")
        .attr("id", "y-axis")
        .call(yAxis);


    let data_points = chartAreaGenres.selectAll("circle")
        .data(data)
        .join('circle')
        .style("fill", d => colorScale(d["single_genre"]))
        .attr("data-genre", d => d["single_genre"])
        .attr("class", "game_data_point")
        .attr("cx", d => xScale(d.main_time))
        .attr("cy", d => yScale(d.score))
        .attr("r", 20)
        .attr("opacity", 0.8)
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
        "MMO"];
    // createLegend(legendDomain, data);

    var tooltip = d3.select("body").append("div").classed("tooltip", true).attr("id", "tooltip-genre");
    chartAreaGenres.selectAll("circle").on("mouseover", (event, d) => {
        var pos = d3.pointer(event, d);
        console.log(pos);
        if (event.target.height + pos[1] > window.innerHeight){
            pos[1]-= (event.target.height + pos[1]) - window.innerHeight;
        }
        tooltip
            .style("left", pos[0] + "px")
            .style("top", pos[1] - 28 + "px")
            .style("display", "block")
            .html(`<div class="tooltip-text"><b>Name:</b> ${d.single_genre}<br/>`
                + `<b>Price:</b> ${Math.round(d.initialprice * 100) / 100} USD<br/>`
                + `<b>Main Story:</b> ${Math.round(d.main_time * 100) / 100} hours<br/>`
                + `<b>Main Story+Extras:</b> ${Math.round(d.main_extra_time * 100) / 100} hours<br/>`
                + `<b>100%:</b> ${Math.round(d.completion_time * 100) / 100} hours<br/>`
                + `<b>Score:</b> ${Math.round(d.score * 100) / 100}%<br/></div>`);
    })
        .on("mouseout", (event, d) => {
            tooltip.style("display", "none");
        });

});


function drawTrendline(xSeries, ySeries){
    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    var x1 = 0;
    var y1 = leastSquaresCoeff[1];
    var x2 = xDomain[xDomain.length - 1];
    var y2 = leastSquaresCoeff[0] * xDomain[xDomain.length - 1] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];

    trendline = chartAreaAllGames.selectAll("trendline")
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


    var x1 = 0;
    var y1 = leastSquaresCoeff[1];
    var x2 = xDomain[xDomain.length - 1];
    var y2 = leastSquaresCoeff[0] * xDomain[xDomain.length - 1] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];

    trendline = chartAreaAllGames.selectAll("trendline")
        .data(trendData);

    trendline.selectAll("line").data(function (d){return d;});

    tLine.transition()
        .duration(1000)
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

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

window.onresize = function(){ location.reload(); }
history.scrollRestoration = 'manual';
//map
// set the dimensions and margins of the graph
let box_map = document.querySelector(".map_card");

var margin = { top: 10, right: 10, bottom: 10, left: 10 };
width = box_map.offsetWidth - 100;
height = 450;

// The svg
var svg = d3
    .select("#map")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// create a tooltip
var tooltip = d3
    .select("#tooltip")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

// Map and projection
var projection = d3
    .geoMercator()
    .scale(100)
    .center([30, 50])
    .translate([width / 2 - margin.left, height / 2]);

// Data and color scale
var data = d3.map();

var domain = [0.00000001, 2, 5, 10, 15, 20];
var labels = [
    "No Data",
    "0.0-2.0",
    "2.0-5.0",
    "5.0-10.0",
    "10.0-15.0",
    "10.0-15.0",
    "> 20.0",
];
var range = [
    "#cccccc",
    "#FF7A75",
    "#983a37",
    "#82322f",
    "#572120",
    "#2b1110",
    "#000000",
];
var colorScale = d3.scaleThreshold().domain(domain).range(range);
var promises = [];
promises.push(
    d3.json(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
);
function update_year(year) {
    promises.push(
        d3.csv("co-emissions.csv", function (d) {
            if (d.year == year) {
                data.set(d.code, +d.emissions);
            }
        })
    );
    dataPromises = Promise.all(promises).then(function (world) {
        let mouseOn = function (d) {
            d3.selectAll(".world")
                .transition()
                .duration(50)
                .style("opacity", 0.95);

            d3.select(this)
                .transition()
                .duration(50)
                .style("opacity", 1)
                .style("stroke", "black");

            function check(number) {
                if (number > 0) {
                    return d3.format(",.2r")(number);
                } else {
                    return "No Data";
                }
            }

            tooltip
                .style("opacity", 0.8)
                .html(d.properties.name + ": " + check(d.totalEmissions))
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY - 28 + "px");
        };

        let mouseOff = function (d) {
            d3.selectAll(".world")
                .transition()
                .duration(50)
                .style("opacity", 1);

            d3.selectAll(".world")
                .transition()
                .duration(50)
                .style("stroke", "transparent");

            d3.select("#annotation").style("opacity", 1);

            tooltip.style("opacity", 0);
        };

        var world = world[0];
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("class", "world")
            // draw each country
            .attr("d", d3.geoPath().projection(projection))
            // set the color of each country
            .attr("fill", function (d) {
                d.totalEmissions = data.get(d.id) || 0;
                return colorScale(d.totalEmissions);
            })
            .style("opacity", 1)
            .on("mouseover", mouseOn)
            .on("mouseleave", mouseOff);
    });
}

// legend
var legend_x = margin.left;
var legend_y = height - 150;
svg.append("g")
    .attr("class", "legendByNumbers")
    .attr("transform", "translate(" + legend_x + "," + legend_y + ")");

var legend = d3
    .legendColor()
    .labels(labels)
    .title("Top CO2/Capita per year:")
    .scale(colorScale);

svg.select(".legendByNumbers").call(legend);

function update(year) {
    slider.property("value", year);
    d3.select(".year").text(year);
}

//Slider
var slider = d3
    .select(".slider")
    .append("input")
    .attr("type", "range")
    .attr("min", 1750)
    .attr("max", 2020)
    .attr("step", 1)
    .on("input", function () {
        var year = this.value;
        console.log(year);
        update(year);
        update_year(year);
    });

update(1750);
update_year(1750);

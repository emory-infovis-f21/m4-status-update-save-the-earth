// ------- Scroll reveal animation -------
const sr = ScrollReveal({
    distance: "30px",
    duration: 1800,
    reset: true,
});

sr.reveal(
    `.home__data, .map_container,
            .scatter_container,
            .sunburst_container`,
    {
        origin: "top",
        interval: 200,
    }
);

sr.reveal(`h2`, {
    origin: "left",
});

// sr.reveal(`.sunburst_container`, {
//     origin: 'right'
// })

// ------- streamgraph js code -------
// var margin = {top: 10, right: 30, bottom: 30, left: 60}
// var width = 560 -margin.left - margin.right;
// var height= 500 - margin.top - margin.bottom
//
// var svg = d3.select("scatterplot")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//       "translate(" + margin.left+ ","+ margin.top + ")");
//
// // d3.csv('historical_emissions.csv')
// //   .then(function(data){
// //     console.log(data);
// //     console.log(data.columns);
// // })
//
// // fake data to populate the visualization to produce the framework
// d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(error, data){
//     console.log(data);
//
//     var keys = data.columns.slice(1)
//   // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv")
//   // .then(function(data){
//   //   console.log(data);
//   //   console.log(data.columns);
//
//     //add x axis
//     var x = d3.scaleLinear()
//       .domain(d3.extent(data, function(d) {return d.year;}))
//       .range([0, width]);
//     svg.append("g")
//       .attr("transform", "translate(0, " + height*0.8 + ")")
//       .call(d3.axisBottom(x).tickSize(-height*.7).tickValues([1900, 1925, 1975, 2000]))
//       .select(".domain").remove()
//
//     svg.selectAll(".tick line").attr("stroke", "#b8b8b8")
//
//     svg.append("text")
//       .attr("text-anchor", "end")
//       .attr("x", width)
//       .attr("y", height-30)
//       .text("Year")
//
//     var y = d3.scaleLinear()
//       .domain([-100000, 100000])
//       .range([height, 0]);
//
//     var color = d3.scaleOrdinal()
//       .domain(keys)
//       .range(d3.schemePaired);
//
//     //stack the data
//     var stackData = d3.stack()
//       .offset(d3.stackOffsetSilhouette)
//       .keys(keys)
//       (data)
//
//     //toop tip
//     var Tooltip = svg
//       .append("text")
//       .attr("x", 0)
//       .attr("y", 0)
//       .style("opacity", 0)
//       .style("font-size", 17)
//
//     //interactions
//     const mouseover = function(d){
//       Tooltip.style("opacity", 1)
//       d3.selectAll(".myArea").style("opacity", .2)
//       d3.select(this)
//         .style("stroke", "black")
//         .style("opacity", 1)
//     }
//
//     const mousemove = function(d, i){
//       grp = keys[i]
//       Tooltip.text(grp)
//     }
//
//     const mouseleave = function(d){
//       Tooltip.style("opacity", 0)
//       d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
//     }
//
//     // area generator
//     const area = d3.area()
//       .x(function(d){ return x(d.data.year); })
//       .y0(function(d){ return y(d[0]); })
//       .y1(function(d){ return y(d[1]); })
//
//       //show the area
//       svg.selectAll("mylayers")
//         .data(stackData)
//         .enter()
//         .append("path")
//           .attr("class", "myArea")
//           .style("fill", function(d){ return color(d.key); })
//           .attr("d", area)
//           .on("mouseover", mouseover)
//           .on("mousemove", mousemove)
//           .on("mouseleave", mouseleave)
//   })
//
//

// ------- sunburst js code (it's really messy right now!!) -------
var width = 275;
var height = 275;
var radius = Math.min(width, height) / 2 + 40;
var color = d3.scaleOrdinal(d3.schemeCategory20b);

var c_select = "United States";
var y_select = 2010;

groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function updateChart(y_select, c_select) {
    var g = d3
        .select("#sunburst")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var partition = d3.partition().size([2 * Math.PI, radius]);

    d3.csv("historical_emissions.csv", function (error, data) {
        json = data.map(function (value, key) {
            return {
                Country: value.Country,
                Sector: value.Sector,
                data_source: data[key]["Data source"],
                Gas: data[key]["Gas"],
                Unit: data[key]["Unit"],
                raw_data: data[key],
            };
        });
        data_gr = groupBy(json, "Country");
        country_data = data_gr[c_select];

        json_country = { name: "Sector", children: [] };
        for (var k = 0; k < country_data.length; k++) {
            var objName = country_data[k]["Country"];
            var objSec = country_data[k]["Sector"];
            var objGas = country_data[k]["Gas"];
            var objUnit = country_data[k]["Unit"];
            var objValue = country_data[k]["raw_data"][2010];
            const found = json_country["children"].find(
                (e) => e.name == objSec
            );
            if (
                objValue != "N/A" &&
                country_data[k]["data_source"] == "CAIT" &&
                !objSec.includes("Total") &&
                !objGas.includes("All")
            ) {
                if (found) {
                    found.children.push({
                        name: objGas,
                        unit: objUnit,
                        size: objValue,
                    });
                } else {
                    json_country["children"].push({
                        name: objSec,
                        children: [
                            {
                                name: objGas,
                                unit: objUnit,
                                size: objValue,
                            },
                        ],
                    });
                }
            }
        }
        var root = d3.hierarchy(json_country).sum(function (d) {
            return d.size;
        });

        sun_root = partition(root);
        root.each((d) => (d.current = d));

        var arc = d3
            .arc()
            .startAngle(function (d) {
                return d.x0;
            })
            .endAngle(function (d) {
                return d.x1;
            })
            .innerRadius(function (d) {
                return d.y0 - 40;
            })
            .outerRadius(function (d) {
                return d.y1 - 40;
            });

        const path = g
            .selectAll("g")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", "node")
            .append("path")
            .attr("display", function (d) {
                return d.depth ? null : "none";
            })
            .attr("d", arc)
            .on("mouseover", function (d) {
                color_d = color((d.children ? d : d.parent).data.name);
                if (d.depth == 2) {
                    color_d = shadeColor(color_d, 20);
                }
                d3.select(this)
                    .attr("r", 5.5)
                    .style("fill", shadeColor(color_d, 10))
                    .style("cursor", "pointer");
            })
            .on("mouseout", function (d) {
                color_d = color((d.children ? d : d.parent).data.name);

                if (d.depth == 2) {
                    color_d = shadeColor(color_d, 20);
                }
                d3.select(this)
                    .attr("r", 5.5)
                    .style("fill", color_d)
                    .style("cursor", "default");
            })
            .style("stroke", "#fff")
            .style("fill", function (d) {
                color_d = color((d.children ? d : d.parent).data.name);
                if (d.depth == 2) {
                    return shadeColor(color_d, 20);
                } else {
                    return color_d;
                }
            })
            .on("click", clicked);

        const text = g
            .selectAll(".node")
            .append("text")
            .text(function (d) {
                return d.parent ? d.data.name : "";
            })
            .attr("transform", function (d) {
                return (
                    "translate(" +
                    arc.centroid(d) +
                    ")rotate(" +
                    computeTextRotation(d) +
                    ")"
                );
            })
            .attr("dx", function (d) {
                if (d.depth == 2) {
                    return "-10";
                } else {
                    return "-25";
                }
            })
            .attr("dy", ".5em")
            .on("mouseover", function (d) {
                color_d = color((d.children ? d : d.parent).data.name);
                if (d.depth == 2) {
                    color_d = shadeColor(color_d, 20);
                }
                d3.select(this.parentNode)
                    .selectAll("path")
                    .style("fill", shadeColor(color_d, 10));
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("r", 5.5).style("fill", "black");
            })
            .style("font-size", "6.3px")
            .style("opacity", function (d) {
                length = this.getComputedTextLength();
                box = this.parentNode.getBBox();
                return length > 50 || d.value < 150 ? 0 : 1;
            });

        const parent = g
            .append("circle")
            .datum(sun_root)
            .attr("r", radius / 10)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked)
            .style("cursor", "pointer");

        function clicked(event, p) {
            console.log(event.data.name);
            parent.datum(event.parent || sun_root);

            sun_root.each((d) => {
                d.target = {
                    x0:
                        Math.max(
                            0,
                            Math.min(
                                1,
                                (d.x0 - event.x0) / (event.x1 - event.x0)
                            )
                        ) *
                        2 *
                        Math.PI,
                    x1:
                        Math.max(
                            0,
                            Math.min(
                                1,
                                (d.x1 - event.x0) / (event.x1 - event.x0)
                            )
                        ) *
                        2 *
                        Math.PI,
                    y0: Math.max(0, d.y0 - event.depth),
                    y1: Math.max(0, d.y1 - event.depth),
                };
            });
            console.log(path);

            const t = g.transition().duration(750);
            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween("data", (d) => {
                    const i = d3.interpolate(d.current, d.target);
                    return (t) => (d.current = i(t));
                })
                .filter(function (d) {
                    return (
                        +this.getAttribute("fill-opacity") ||
                        arcVisible(d.target)
                    );
                })
                .attr("fill-opacity", (d) =>
                    arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
                )
                .attrTween("d", arc);

            text.filter(function (d) {
                return (
                    +this.getAttribute("fill-opacity") || labelVisible(d.target)
                );
            })
                .transition(t)
                .attr("fill-opacity", (d) => +labelVisible(d.target))
                .attrTween("transform", (d) => () => labelTransform(d.current));
        }
    });
}
updateChart(y_select, c_select);
function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}
function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}
function computeTextRotation(d) {
    var angle = ((d.x0 + d.x1) / Math.PI) * 90;
    return angle < 180 ? angle - 90 : angle + 90;
}
function shadeColor(color, percent) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
    var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
    var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

    return "#" + RR + GG + BB;
}

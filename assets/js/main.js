// ------- Scroll reveal animation -------
const sr = ScrollReveal({
    distance: '30px',
    duration: 1800,
    reset: true,
});

sr.reveal(`.home__data, .map_container,
            .scatter_container,
            .sunburst_container`, {
    origin: 'top',
    interval: 200,
})

sr.reveal(`h2`, {
    origin: 'left'
})

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
var radius = Math.min(width, height) / 2;
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
        .attr(
            "transform",
            "translate(" + width / 2 + "," + height / 2 + ")"
        );

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

        partition(root);

        var arc = d3
            .arc()
            .startAngle(function (d) {
                return d.x0;
            })
            .endAngle(function (d) {
                return d.x1;
            })
            .innerRadius(function (d) {
                return d.y0;
            })
            .outerRadius(function (d) {
                return d.y1;
            });

        g.selectAll("g")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", "node")
            .append("path")
            .attr("display", function (d) {
                return d.depth ? null : "none";
            })
            .attr("d", arc)
            .on("mouseover", handleMouseOver)
            .on("mouseover", handleMouseOver)
            .style("stroke", "#fff")
            .style("fill", function (d) {
                return color((d.children ? d : d.parent).data.name);
            });

        g.selectAll(".node")
            .append("text")
            .attr("transform", function (d) {
                return (
                    "translate(" +
                    arc.centroid(d) +
                    ")rotate(" +
                    computeTextRotation(d) +
                    ")"
                );
            })
            .attr("dx", "-20")
            .attr("dy", ".5em")
            .style("font-size", "6px")
            .text(function (d) {
                return d.parent ? d.data.name : "";
            });

        function handleMouseOver(d, i) {
            console.log(d.data.name);
            d3.select(this).attr({
                fill: "orange",
                r: radius * 2,
            });
        }
        function handleMouseOut(d, i) {
            console.log("mouseout");
            d3.select(this).attr({
                fill: "black",
                r: radius,
            });
            d3.select("#t" + d.x + "-" + d.y + "-" + i).remove(); // Remove text location
        }
    });
}
updateChart(y_select, c_select);

function computeTextRotation(d) {
    var angle = ((d.x0 + d.x1) / Math.PI) * 90;
    return angle < 180 ? angle - 90 : angle + 90;
}

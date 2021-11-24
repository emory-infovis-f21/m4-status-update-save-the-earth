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

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

// ------- sunburst js code (it's really messy right now!!) -------
let box = document.querySelector(".sunburst_card");
var width = box.offsetWidth;
var height = box.offsetHeight - 30;
var radius = Math.min(width, height) / 2 + 80;
var color = d3.scaleOrdinal(d3.schemeCategory20b);

var c_select = "China";
var y_select = 1980;

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
    var dataCsv = d3.csv("historical_emissions.csv");

    dataCsv.then(function (data) {
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
                return d.y0 - 80;
            })
            .outerRadius(function (d) {
                return d.y1 - 80;
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
            .on("mouseover", function (d) {
                if (this.id != "selected") {
                    color_d = color((d.children ? d : d.parent).data.name);
                    if (d.depth == 2) {
                        color_d = shadeColor(color_d, 20);
                    }
                    d3.select(this)
                        .attr("r", 5.5)
                        .style("fill", shadeColor(color_d, 10))
                        .style("cursor", "pointer");

                    if (d.depth != 1) {
                        d3.select(".infobox .title").text(d.data.name + ":  ");
                        d3.select(".infobox .words").text(
                            d.value + " " + d.data.unit
                        );
                        d3.select(".infobox").style("visibility", "visible");
                    } else {
                        d3.select(".infobox").style("visibility", "visible");
                        d3.select(".infobox .title").text(d.data.name);
                        d3.select(".infobox .words").text(
                            Math.round((d.value / d.parent.value) * 100) + "%"
                        );
                    }
                }
            })
            .on("mouseout", function (d) {
                if (this.id != "selected") {
                    color_d = color((d.children ? d : d.parent).data.name);

                    if (d.depth == 2) {
                        color_d = shadeColor(color_d, 20);
                    }
                    d3.select(this)
                        .attr("r", 5.5)
                        .style("fill", color_d)
                        .style("cursor", "default");

                    d3.select(".infobox").style("visibility", "hidden");
                }
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
            .on("click", function (d) {
                if (this.id != "selected") {
                    d3.select(this).attr("id", "selected").style("fill", "red");
                    // d3.select(this.parentNode).style("font-weight", "900");
                } else {
                    color_d = color((d.children ? d : d.parent).data.name);
                    if (d.depth == 2) {
                        color_d = shadeColor(color_d, 20);
                    }
                    d3.select(this).attr("r", 5.5).style("fill", color_d);
                    d3.select(this).attr("id", "");
                }
            });

        g.selectAll(".node")
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
                    return "-50";
                }
            })
            .attr("dy", ".5em")
            .on("mouseover", function (d) {
                if (this.id != "selected") {
                    d3.select(this).style("cursor", "pointer");

                    color_d = color((d.children ? d : d.parent).data.name);
                    if (d.depth == 2) {
                        color_d = shadeColor(color_d, 20);
                    }
                    d3.select(this.parentNode)
                        .selectAll("path")
                        .style("fill", shadeColor(color_d, 10));

                    if (d.depth != 1) {
                        d3.select(".infobox .title").text(d.data.name + ":  ");
                        d3.select(".infobox .words").text(
                            d.value + " " + d.data.unit
                        );
                        d3.select(".infobox").style("visibility", "visible");
                    } else {
                        d3.select(".infobox").style("visibility", "visible");
                        d3.select(".infobox .title").text(d.data.name);
                        d3.select(".infobox .words").text(
                            Math.round((d.value / d.parent.value) * 100) + "%"
                        );
                    }
                }
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("r", 5.5).style("fill", "black");
            })
            .style("font-size", "14px")
            .style("visibility", function (d) {
                length = this.getComputedTextLength();
                box = this.parentNode.getBBox();
                return length > 120 || d.value < 190 ? "hidden" : "visible";
            });
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

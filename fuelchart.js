// GLOBALS
var w = 1000,h = 900;
var padding = 2;
var nodes = [];
var force, node, data, maxVal;
var brake = 0.2;
var radius = d3.scale.sqrt().range([10, 20]);
// beep on click. Instructions found at: https://www.youtube.com/watch?v=VlwSz2dXK_8
var beep = new Audio();
beep.src="beep-07.mp3";

var svgCentre = { 
    x: w / 3.6, y: h / 2
  };

var svg = d3.select("#chart").append("svg")
	.attr("id", "svg")
	.attr("width", w)
	.attr("height", h);

var nodeGroup = svg.append("g");

var tooltip = d3.select("#chart")
 	.append("div")
	.attr("class", "tooltip")
	.attr("id", "tooltip");

function transition(name) {
	if (name === "all-consumptions") {
		beep.currentTime = 0;
		beep.play();
		$("#initial-content").fadeIn(250);
		$("#value-scale").fadeIn(1000);
		$("#view-source-type").fadeOut(250);
		$("#view-fuelType-type").fadeOut(250);
		return total();
		//location.reload();
	}
	if (name === "group-by-fuelType") {
		beep.currentTime = 0;
		beep.play();
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-source-type").fadeOut(250);
		$("#view-fuelType-type").fadeIn(1000);
		return fuelTypeGroup();
	}
		
	if (name === "group-by-region") {
		beep.currentTime = 0;
		beep.play();
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-fuelType-type").fadeOut(250);
		$("#view-source-type").fadeIn(1000);
		return regionType();
	}
}

function start() {

	node = nodeGroup.selectAll("circle")
		.data(nodes)
	.enter().append("circle")
	        .attr("area", function(d) { return d.area; })
		.attr("class", function(d) { return "node " + d.party; })
		.attr("consumption", function(d) { return d.value; })
		.attr("region", function(d) { return d.region; })
		.attr("fuel", function(d) { return d.fuel; })
		.attr("fuelType", function(d) { return d.fuelType; })
		// disabled because of slow Firefox SVG rendering
		// though I admit I'm asking a lot of the browser and cpu with the number of nodes
		//.style("opacity", 0.9)
		.attr("r", 0)
		.style("fill", function(d) { return d.color; })
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", function(d) { window.open('https://google.com/search?q=' + d.donor)}); 
		// Alternative title based 'tooltips'
		// node.append("title")
		//	.text(function(d) { return d.donor; });

		force.gravity(0)
			.friction(0.75)
			.charge(function(d) { return -Math.pow(d.radius, 2) / 3; })
			.on("tick", all)
			.start();

		node.transition()
			.duration(2500)
			.attr("r", function(d) { return d.radius; });
}

function total() {

	force.gravity(0)
		.friction(0.9)
		.charge(function(d) { return -Math.pow(d.radius, 2) / 2.8; })
		.on("tick", all)
		.start();
}

function fuelTypeGroup() {
	force.gravity(0)
		.friction(0.8)
		.charge(function(d) { return -Math.pow(d.radius, 2.0) / 3; })
		.on("tick", fuelTypes)
		.start();
}

function regionType() {
	force.gravity(0)
		.friction(0.75)
		.charge(function(d) { return -Math.pow(d.radius, 2.0) / 3; })
		.on("tick", regions)
		.start();
}


function fuelTypes(e) {
	node.each(moveToFuelTypes(e.alpha));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

function regions(e) {
	node.each(moveToRegions(e.alpha));


		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}


function all(e) {
	node.each(moveToCentre(e.alpha))
		.each(collide(0.001));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}


function moveToCentre(alpha) {
	return function(d) {
		var centreX = svgCentre.x + 100;
			if (d.value <= 10001) {
				centreY = svgCentre.y + 55;
			} else if (d.value <= 50001) {
				centreY = svgCentre.y + 15;
			} else if (d.value <= 100001) {
				centreY = svgCentre.y - 25;
			} else  if (d.value <= 500001) {
				centreY = svgCentre.y - 75;
			} else  if (d.value <= maxVal) {
				centreY = svgCentre.y - 115;
			} else {
				centreY = svgCentre.y;
			}

		d.x += (centreX - d.x) * (brake + 0.06) * alpha * 0.9;
		d.y += (centreY - 100 - d.y) * (brake + 0.06) * alpha * 0.9;
	};
}

function moveToFuelTypes(alpha) {
	return function(d) {
		var centreX;
		var centreY;
        switch (d.fuelType){

            case 'Πετρέλαιο(diesel)':
                centreX = 300;
                centreY = 200;
                break;
            case 'Βενζίνη':
                centreX = 300;
                centreY = 350;
                break;
            case 'Μαζούτ':
                centreX = 450;
                centreY = 480;
                break;
            case 'Υγραέριο':
                centreX = 450;
                centreY = 280;
                break;
        }
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToRegions(alpha) {
	return function(d) {
		var centreY;
		var centreX;
		switch (d.region){
            case 'Βόρεια Ελλάς':
                centreX = 280;
                centreY = 200;
                break;
            case 'Κεντρική Ελλάς':
                centreX = 470;
                centreY = 200;
                break;
            case 'Νήσοι Αιγαίου και Κρήτη':
                centreX = 350;
                centreY = 420;
                break;
        }
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

// created in analogy to other 4 similar functions
function moveToConsumption(alpha) {
	return function(d) {
		var centreX;
		var centreY;
		if (d.value <= 500000){
			centreX = svgCentre.x +70;
			centreY = svgCentre.y -70;
		} else if (d.value <= 5000000){
			centreX = svgCentre.x +450;
			centreY = svgCentre.y -70;
		} else if (d.value <= 10000000){
			centreX = svgCentre.x +70;
			centreY = svgCentre.y +250;
		} else {
			centreX = svgCentre.x +500;
			centreY = svgCentre.y +250;
		}
		
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

// Collision detection function by m bostock
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + radius.domain()[1] + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
  };
}

function display(data) {

    data.forEach(function(d) {d.consumption = +d.consumption});	// string to number

	maxVal = d3.max(data, function(d) { return d.consumption; });

	var radiusScale = d3.scale.sqrt()
		.domain([0, maxVal])
			.range([3, 50]);

	data.forEach(function(d, i) {
		var y = radiusScale(d.consumption);
		var fuelColor;
		switch (d.fuelType){
			case 'Βενζίνη':
				fuelColor = 'green';
				break;
            case 'Πετρέλαιο(diesel)':
                fuelColor = 'red';
                break;
            case 'Μαζούτ':
                fuelColor = 'darkslategray';
                break;
            case 'Υγραέριο':
                fuelColor = 'orange';
                break;
			default:
                fuelColor = 'black';
                break;
		}
		var node = {
				radius: radiusScale(d.consumption),
				value: d.consumption,
				area: d.area,
				region: d.region,
				fuelType: d.fuelType,
				fuel: d.fuel,
				color: fuelColor,
				x: Math.random() * w,
				y: -y
      };
			
      nodes.push(node)
	});

	console.log(nodes);

	force = d3.layout.force()
		.nodes(nodes)
		.size([w, h]);

	return start();
}

function mouseover(d, i) {
	// tooltip popup
	var mosie = d3.select(this);
	var consumption = mosie.attr("consumption");
	var offset = $("svg").offset();

	var fuel;
	switch (d.fuel){
        case 'Σούπερ (LRP)': fuel = 'Super LRP'; break;
        case 'Αμόλυβδη (95 RON)': fuel = 'Unleaded 95 RON'; break;
        case 'Αμόλυβδη (98/100 RON)': fuel = 'Unleaded 98/100 RON'; break;
        case 'Θέρμανσης': fuel = 'Heating diesel'; break;
        case 'Κίνησης (BIO)': fuel = 'Auto diesel (BIO)'; break;
        case 'Χαμηλού Θείου': fuel = 'Low sulfur mazut'; break;
        case 'Υψηλού Θείου': fuel = 'High sulfur mazut'; break;
        case 'Υγραέριο (LPG)': fuel = 'Liquid propane gas'; break;
        default: fuel = ''; break;
    }


    var area;
    switch (d.area) {
        case 'Ανατολική Μακεδονία και Θράκη': area = 'Ease Macedonia and Thrace'; break;
        case 'Κεντρική Μακεδονία': area = 'Central Macedonia'; break;
        case 'Δυτική Μακεδονία': area = 'West Macedonia'; break;
        case 'Θεσσαλία': area = 'Thessaly'; break;
        case 'Ήπειρος': area = 'Epirus'; break;
        case 'Ιόνια Νησιά': area = 'Ionian Islands'; break;
        case 'Δυτική Ελλάδα': area = 'West Greece'; break;
        case 'Στερεά Ελλάδα και Εύβοια': area = 'Sterea and Evvia'; break;
        case 'Πελοπόννησος': area = 'Peloponese'; break;
        case 'Αττική': area = 'Attica'; break;
        case 'Βόρειο Αιγαίο': area = 'North Aegean'; break;
        case 'Νότιο Αιγαίο': area = 'South Aegean'; break;
        case 'Κρήτη': area = 'Crete'; break;
        default: area = ''; break;
    }
	
	var infoBox = "<p> Περιφεριακή ενότητα: <b>" + d.region + "</b></p>"
                    + "<p> Περιφέρεια: <b>" + d.area + "</b></p>"
                    + "<p> Τύπος Καυσίμου: <b>" + d.fuelType + "</b></p>"
                    + "<p> Καύσιμο: <b>" + d.fuel + "</b></p>"
                    + "<p> Κατανάλωση: <b>" + consumption + "t</b></p>";
	
	
	mosie.classed("active", true);
	d3.select(".tooltip")
  	.style("left", (parseInt(d3.select(this).attr("cx") - 80) + offset.left) + "px")
    .style("top", (parseInt(d3.select(this).attr("cy") - (d.radius+150)) + offset.top) + "px")
		.html(infoBox)
			.style("display","block");
	responsiveVoice.speak(fuel + " consumption in " + area + ":" + consumption + " metric tons");

	}



function mouseout() {
	// no more tooltips
		var mosie = d3.select(this);

		mosie.classed("active", false);

		d3.select(".tooltip")
			.style("display", "none");
	responsiveVoice.cancel();
		}

$(document).ready(function() {
		d3.selectAll(".switch").on("click", function(d) {
      var id = d3.select(this).attr("id");
      return transition(id);
    });
    return d3.csv("data/A0901_SDE15_TB_AN_00_2016_01_F_GR.csv", display);

});

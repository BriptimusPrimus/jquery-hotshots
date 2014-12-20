$(function () {

	var api = google.maps,
		mapCenter = new api.LatLng(50.91710, -1.40419),
		mapOptions = {
			zoom: 13,
			center: mapCenter,
			mapTypeId: api.MapTypeId.ROADMAP,
			disableDefaultUI: true
		},
		map = new api.Map(document.getElementById("map"), mapOptions),
		ui = $("#ui"),
		clicks = 0,
		positions = [];


		// Add a marker to the map
		var homeMarker = new api.Marker({
			position: mapCenter,
			map: map,
			icon: "img/hq.png"
		});

		// Add a custom overlay to display the company 
		// information when the new marker is clicked
		var infoWindow = new api.InfoWindow({
			content: document.getElementById("hqInfo")
		});

		// Add a click handler to show the overlay when 
		// the marker is clicked
		api.event.addListener(homeMarker, "click", 
		function(){ 
			infoWindow.open(map, homeMarker);
		});


		// Capture clicks on the map
		var addMarker = function (e) {

			if (clicks <= 1) {

				positions.push(e.latLng);

				var marker = new api.Marker({
					map: map,
					position: e.latLng,
					flat: (clicks === 0) ? true : false,
					animation: api.Animation.DROP,
					title: (clicks === 0) ? "Start" : "End",
					icon: (clicks === 0) ? "img/start.png" : "",
					draggable: true,
					id: (clicks === 0) ? "Start" : "End"
				});

				// Bind each marker to the dragend event
				api.event.addListener(marker, "dragend", markerDrag);

				api.event.trigger(map, "locationAdd", e);

			} else {
				api.event.removeListener(mapClick);
				return false;
			}
		}

		// attach a listener for clicks on the map
		var mapClick = api.event.addListener(map, "click", addMarker);

		
		// Update the UI with the start and end locations
		api.event.addListener(map, "locationAdd", function(e){

			var journeyEl = $("#journey"),
				outer = (journeyEl.length) ? journeyEl : 
					$("<div>", {
						id: "journey"
					});

				new api.Geocoder().geocode({
					"latLng": e.latLng },
					function(results){

						$("<h3 />", {
							text: (clicks === 0) ? "Start" : "End:"
						}).appendTo(outer);
						$("<p />", {
							text: results[0].formatted_address,
							id: (clicks === 0) ? "StartPoint" : "EndPoint",
							"data-latLng": e.latLng
						}).appendTo(outer);

						if(!journeyEl.length){
							outer.appendTo(ui);
						} else {
							$("<button />", {
								id: "getQuote",
								text: "Get quote"
							}).prop("disabled", true).appendTo(journeyEl);
						}

						clicks++;
					});
		});


		// Add the handler function for the dragend event		
		var markerDrag = function(e){
			var elId = ["#", this.get("id"), "Point"].join("");

			new api.Geocoder().geocode({
				"latLng": e.latLng
			}, function(results){
				$(elId).text(results[0].formatted_address);
			});
		}


		// Add a handler for the <input> element
		// once a weight is entered the <button> becomes clickable
		$("#weight").on("keyup", function () {
		    if (timeout) {
		        clearTimeout(timeout);
		    }

		    var field = $(this),
		        enableButton = function () {
		            if (field.val()) {
		                $("#getQuote").prop("disabled", false);
		            } else {
		                $("#getQuote").prop("disabled", true);
		            }
		        },
		        timeout = setTimeout(enableButton, 250);
		});

		// Display the projected distance and cost
		$("body").on("click", "#getQuote", function (e) {
		    e.preventDefault();

		    $(this).remove();

		    // get the distance between the two points
			new api.DistanceMatrixService().getDistanceMatrix({
			    origins: [$("#StartPoint").attr("data-latLng")],
			    destinations: [$("#EndPoint").attr("data-latLng")],
			    travelMode: google.maps.TravelMode.DRIVING,
			    unitSystem: google.maps.UnitSystem.IMPERIAL
			}, function (response) {

				// compute and display the cost
				var list = $("<dl/>", {
				        "class": "clearfix",
				        id: "quote"
				    }),
				    format = function (number) {
				        var rounded = Math.round(number * 100) / 100,
				            fixed = rounded.toFixed(2);

				        return fixed;
				    },
				    term = $("<dt/>"),
				    desc = $("<dd/>"),
				    distance = response.rows[0].elements[0].distance,
				    weight = $("#weight").val(),
				    distanceString = distance.text + "les",
				    distanceNum = parseFloat(distance.text.split(" ")[0]),
				    distanceCost = format(distanceNum * 3),
				    weightCost = format(distanceNum * 0.25 * distanceNum),
				    totalCost = format(+distanceCost + +weightCost);

				    // generate the HTML structure that we'll use to 
				    // display the computed figures
					$("<h3>", {
					    text: "Your quote",
					    id: "quoteHeading"
					}).appendTo(ui);

					term.clone().html("Distance:").appendTo(list);
					desc.clone().text(distanceString).appendTo(list);
					term.clone().text("Distance cost:").appendTo(list);
					desc.clone().text("£" + distanceCost).appendTo(list);
					term.clone().text("Weight cost:").appendTo(list);
					desc.clone().text("£" + weightCost).appendTo(list); 
					term.clone().addClass("total")
						.text("Total:")
						.appendTo(list);
					desc.clone().addClass("total")
						.text("£" + totalCost)
						.appendTo(list);

					list.appendTo(ui);				    
			});


		});		

});
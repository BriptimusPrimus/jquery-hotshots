$(function () {

var numberOfPieces = 12,
    aspect = "3:4",
    aspectW = parseInt(aspect.split(":")[0]),
    aspectH = parseInt(aspect.split(":")[1]),
    container = $("#puzzle"),
    imgContainer = container.find("figure"),
    img = imgContainer.find("img"),
    path = img.attr("src"),
    piece = $("<div/>"),
    pieceW = Math.floor(img.width() / aspectW),
    pieceH = Math.floor(img.height() / aspectH),
    idCounter = 0,
    positions = [],
    empty = {
        top: 0, 
        left: 0,
        bottom: pieceH, 
        right: pieceW
    },
    previous = {},
    timer,
    currentTime = {},
    timerDisplay = container.find("#time").find("span");

    //generate the different pieces that make up the puzzle
	for (var x = 0, y = aspectH; x < y; x++){
		for (var a = 0, b = aspectW; a < b; a++){
			var top = pieceH * x,
				left = pieceW * a;

			piece.clone()
				 .attr("id", idCounter++)
				 .css({
					width: pieceW,
					height: pieceH,
					position: "absolute",
					top: top,
					left: left,
					backgroundImage: ["url(", path, ")"].join(""),
					backgroundPosition: [
						"-", pieceW * a, "px ", 
						"-", pieceH * x, "px"
					].join("")
			}).appendTo(imgContainer);

			positions.push({ top: top, left: left });
		}
	}

	// Removing the original image from the page
	img.remove();

	// Removing the first piece of the puzzle
	container.find("#0").remove();

	// Removing the first item in the positions array
	positions.shift();


	// Shuffling the pieces randomly
	$("#start").on("click", function(e){
		var pieces = imgContainer.children();
		var monitor = true,
			switcher = true;

		function shuffle(array) {
			var i = array.length;

			if(i === 0) {
				return false;
			}
			while(i--) {
				var j = Math.floor(Math.random() * (i + 1)),
					tempi = array[i],
					tempj = array[j];

					array[i] = tempj;
					array[j] = tempi;
			}
		}

		function shuffle2(array) {
			var i = array.length;

			if(i === 0) {
				return false;
			}

			var swapsCount = 0;				

			function trySwapping(){

				var neighbour = false,
					randomeElm;

				while(!neighbour){
					var j = Math.floor(Math.random() * (i));
					
					randomeElm = $(array[j]);

					var current = getPosition(randomeElm);

					// is it horizontally or vertically aligned to the empty space?
					if (current.left === empty.left || current.top === empty.top){
						neighbour = true;
						// is it adjacent  to the empty space?
						if (current.bottom < empty.top || 
						    current.top > empty.bottom ||
						    current.left > empty.right || 
						    current.right < empty.left) {
								neighbour = false;		    	
						    }					
					}
				}

				//swap positions
				var tempPos = {};
			    tempPos.top = current.top;
			    tempPos.left = current.left;

			    randomeElm.css({
					top: empty.top,
					left: empty.left
				});

			    empty.top = tempPos.top;
			    empty.left = tempPos.left;
			    empty.bottom = tempPos.top + pieceH;
			    empty.right = tempPos.left + pieceW;

				swapsCount++; console.log("swapped!" + swapsCount);

				if (swapsCount < 100){
					setTimeout(trySwapping, 100);
				} else {
					// stop waiting
					start(array);
				}

			}

			trySwapping();
		}		

		shuffle2(pieces);

		// wait until all the shuffling is done
		// while(monitor){ switcher = !switcher; }

		// $.each(pieces, function(i){
		// 	pieces.eq(i).css(positions[i]);
		// });

		// pieces.appendTo(imgContainer);

		// empty.top = 0;
		// empty.left = 0;		
	});


	function getPosition(el) {
	    return {
	        top: parseInt(el.css("top")),
	        bottom: parseInt(el.css("top")) + pieceH,
	        left: parseInt(el.css("left")),
	        right: parseInt(el.css("left")) + pieceW
	    }
	}


	function start(pieces){

		container.find("#ui").find("p").not("#time").remove();


		// Check the timer isn't already running when the Start button is clicked
		if (timer) {
		    clearInterval(timer);
		    timerDisplay.text("00:00:00");
		}

		// Start the timer from 0
		timer = setInterval(updateTime, 1000);
		currentTime.seconds = 0;
		currentTime.minutes = 0;
		currentTime.hours = 0;		

		// Increment the timer every second
		function updateTime(){

			if (currentTime.hours == 23 && currentTime.minutes == 59 && currentTime.seconds === 59){
				clearInterval(timer);
			} else if (currentTime.minutes === 59 && currentTime.seconds === 59){
				currentTime.hours++;
				currentTime.minutes = 0;
				currentTime.seconds = 0;
			} else if (currentTime.seconds === 59) {
				currentTime.minutes++;
				currentTime.seconds = 0;
			} else {
				currentTime.seconds++;
			}

			// Update the display on the page 
			newHours = (currentTime.hours <= 9) ? 
				"0" + currentTime.hours : currentTime.hours;

			newMins = (currentTime.minutes <= 9) ? 
				"0" + currentTime.minutes : currentTime.minutes;

			newSecs = (currentTime.seconds <= 9) ?
				"0" + currentTime.seconds : currentTime.seconds;

			timerDisplay.text([
				newHours, ":", newMins, ":", newSecs
			].join(""));

		}


		// Making the puzzle pieces draggable using jQuery UI's Draggable component
		pieces.draggable({
		    containment: "parent",
		    grid: [pieceW, pieceH],
		    start: function (e, ui) {

				var current = getPosition(ui.helper);

				if (current.left === empty.left) {
				    ui.helper.draggable("option", "axis", "y");
				} else if (current.top === empty.top) {
				    ui.helper.draggable("option", "axis", "x");
				} else {
				    ui.helper.trigger("mouseup");
				    return false;
				}

				if (current.bottom < empty.top || 
				    current.top > empty.bottom ||
				    current.left > empty.right || 
				    current.right < empty.left) {
				        ui.helper.trigger("mouseup");
				        return false;
				    }

				    previous.top = current.top;
				    previous.left = current.left;					    		

		    },
		    drag: function (e, ui) {

				var current = getPosition(ui.helper);

				ui.helper.draggable("option", "revert", false);

				if (current.top === empty.top && current.left === empty.left) {
				    ui.helper.trigger("mouseup");
				    return false;
				}

				if (current.top > empty.bottom ||
				    current.bottom < empty.top || 
				    current.left > empty.right || 
				    current.right < empty.left) {
				        ui.helper.trigger("mouseup")
				                 .css({ 
				                     top: previous.top, 
				                     left: previous.left 
				                 });
				        return false;
				}				

		    },
		    stop: function (e, ui) { 

				var current = getPosition(ui.helper),
					correctPieces = 0;

				if (current.top === empty.top && current.left === empty.left) {

				    empty.top = previous.top;
				    empty.left = previous.left;
				    empty.bottom = previous.top + pieceH;
				    empty.right = previous.left + pieceW;
				}

				// Check the order of pieces to see if they match 
				// the starting order of the pieces
				$.each(positions, function(i){
					var currentPiece = $("#" + (i + 1)),
						currentPosition = getPosition(currentPiece);

					if(positions[i].top === currentPosition.top 
						&& positions[i].left === currentPosition.left){
							correctPieces++; 
					}
				});	

				if(correctPieces === positions.length){
					// Stop the timer
					clearInterval(timer);

					// Display congratulatory message
					$("<p/>", {
						text: "Congratulations, you solved the puzzle!"
					}).appendTo("#ui");			

					var totalSeconds = (currentTime.hours * 60 * 60) +
						(currentTime.minutes * 60) + currentTime.seconds;

					// Check whether a best time has been saved
					if(localStorage.getItem("puzzleBestTime")){

						var bestTime = localStorage.getItem("puzzleBestTime");
						
						// Check whether the current best time is better than the saved best time
						if(totalSeconds < bestTime){

							// Update the saved best time when the current best time is better than it
							localStorage.setItem("puzzleBestTime", totalSeconds);

							// Display an additional message when the saved best time is beaten
							$("<p/>", {
								text: "You got a new best time!"
							}).appendTo("#ui");

						}

					} else {
						localStorage.setItem("puzzleBestTime", totalSeconds);
					
						// Display an additional message when the saved best time is beaten
						$("<p/>", {
							text: "You got a new best time!"
						}).appendTo("#ui");						
					}						
				}							

		    }
		});

	}


});
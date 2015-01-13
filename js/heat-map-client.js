$(function () {

	//vars
	var doc = $(document),
	    clickStats = {
	        url: document.location.href,
	        clicks: []
	    },
	    layouts = [];

	//set some AJAX defaults
	$.ajaxSetup({
	    type: "POST",
	    contentType: "application/json",
	    dataType: "json"
	});

	//parse stylesheet(s) for media queries
	$.each(doc[0].styleSheets, function (x, ss) {

		$.each(ss.rules, function (y, rule) {

			if (rule.media&&rule.media.length) {

			  	//get min/max values
				var jq = $,
					current = rule.media[0],
					mq = {
						min: (current.indexOf("min") !== -1) ? 
							jq.trim(current.split("min-width:")[1]
								.split("px")[0]) : 0,

						max: (current.indexOf("max") !== -1) ? 
							jq.trim(current.split("max-width:")[1]
								.split("px")[0]) : "none"
					};

			  	layouts.push(mq);
			}
		});
	});

	//sort layouts array
	layouts.sort(function (a, b) {
	    return a.min - b.min;
	});

	//store number of layouts
	$.ajax({
	    url: "/heat-map.asmx/saveLayouts",
	    data: JSON.stringify({ url: url, layouts: layouts })
	});
});
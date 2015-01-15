$(function () {

    var vm = {
    	//properties
        elements: ko.observableArray(data.elements),
		nameOrder: ko.observable("ascending"),
		numberOrder: ko.observable("ascending"),
		symbolOrder: ko.observable("ascending"),
		weightOrder: ko.observable("ascending"),
		discoveredOrder: ko.observable("ascending"),  
		pageSize: ko.observable(10),
		currentPage: ko.observable(0),
		elementsPaged: ko.observableArray(),	
		pages: ko.observableArray(),	      

		//methods
		sort: function (viewmodel, e) {

		    var orderProp = $(e.target).attr("data-bind")
		                               .split(" ")[1],

		        orderVal = viewmodel[orderProp](),
		        comparatorProp = orderProp.split("O")[0];

		    viewmodel.elements.sort(function (a, b) {

		        var propA = a[comparatorProp],
		            propB = b[comparatorProp];

		        if (typeof (propA) !== typeof (propB)) {

		            propA = (typeof (propA) === "string") ? 0 :propA;
		            propB = (typeof (propB) === "string") ? 0 :propB;
		        }

		        if (orderVal === "ascending") {
		            return (propA === propB) ? 0 : (propA<propB) ? -1 : 1;
		        } else {
		            return (propA === propB) ? 0 : (propA<propB) ? 1 : -1;
		        }

		    });

		    //toggle order property of clicked heading
		    orderVal = (orderVal === "ascending") ? 
		    	"descending" : "ascending";		  		
		    viewmodel[orderProp](orderVal);

		    //reset order property of other headings
		    for (prop in viewmodel) {
		        if (prop.indexOf("Order") !== -1 && prop !== orderProp) {
		            viewmodel[prop]("ascending");
		        }
		    }
		},

		totalPages: function () {
		    var totalPages = this.elements().length / this.pageSize() || 1;
		        return Math.ceil(totalPages);
		},
		goToNextPage: function () {
		    if (this.currentPage() < this.totalPages() - 1) {
		        this.currentPage(this.currentPage() + 1);
		    }
		},
		goToPrevPage: function () {
		    if (this.currentPage() > 0) {
		        this.currentPage(this.currentPage() - 1);
		    }
		},
		changePage: function (obj, e) {
		    var el = $(e.target),
		        newPage = parseInt(el.text(), 10) - 1;

		    vm.currentPage(newPage);
		}					
			
    };

	vm.createPage = ko.computed(function () {

		//create page of data
	    if (this.pageSize() === "all") {
	        this.elementsPaged(this.elements.slice(0));
	    } else {
	        var pagesize = parseInt(this.pageSize(), 10),
	            startIndex = pagesize * this.currentPage(),
	            endIndex = startIndex + pagesize;

	        this.elementsPaged(this.elements.slice(startIndex,endIndex));
	    }

	}, vm); 

	vm.createPages = ko.computed(function () {

	    var tmp = [];

	    for (var x = 0; x < this.totalPages(); x++) {
	        tmp.push({ num: x + 1 });
	    }

	    this.pages(tmp);

	}, vm);	   

    ko.applyBindings(vm);

});
(function() {

    var tags = "",
        getBounties = function(page, callback) {

            $.ajax({
                url: "https://api.stackexchange.com/2.0/questions/featured",
                dataType: "jsonp",
                data: {
                    page: page,
                    pagesize: 10,
                    tagged: tags,
                    order: "desc",
                    sort: "activity",
                    site: "stackoverflow",
                    filter: "!)4k2jB7EKv1OvDDyMLKT2zyrACssKmSCXeX5DeyrzmOdRu8sC5L8d7X3ZpseW5o_nLvVAFfUSf"
                },
                beforeSend: function () {
                    $.mobile.loadingMessageTextVisible = true;
                    $.mobile.showPageLoadingMsg("a", "Searching");
                }
            }).done(function (data) {

                callback(data);

            });
        };


        // Get some bounties
        $(document).on("pageinit", "#welcome", function () {

            $("#search").on("click", function () {
                
                $(this).closest(".ui-btn")
                          .addClass("ui-disabled");

                tags = $("#tags").val();

                getBounties(1, function(data) {

                    data.currentPage = 1;

                    localStorage.setItem("res", JSON.stringify(data)); 
              
                    $.mobile.changePage("bounty-hunter-list.html", {
                        transition: "slide"
                    });
                });
            });
        });      

        $(document).on("pageshow", "#welcome", function () {
            $("#search").closest(".ui-btn")
                        .removeClass("ui-disabled");
        });

}());
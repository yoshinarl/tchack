// jshint devel:true
(function($) {
    $('#detail').load('./detail.html');

    $("#current-sort").on("click touchend", function(e) {
        e.preventDefault();
        $("#select-sort li, #select-sort .closer").hide();
        $("#select-sort").fadeIn(function() {
            $(window).on('touchmove.noScroll', function(e) {
                e.preventDefault();
            });
            $("#select-sort .closer").show("scale", 100);
            $("#select-sort li").each(function(i, elem) {
                $(elem).delay(i * 100).show("slide", 300);
            });
        });

        $("#select-sort .closer").on("click touchend", function(e) {
            e.preventDefault();
            $("#select-sort li").each(function(i, elem) {
                $(elem).delay(i * 100).hide("slide", 300);
            });
            $(window).off('.noScroll');
            $("#select-sort").fadeOut();
        });

    });


})(jQuery);

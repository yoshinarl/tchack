// jshint devel:true
(function($) {
    $('#detail').load('./detail.html');

    // TODO: load from static dummy json file
    var orders = [1, 2, 3, 4, 5];

    $("#orders").append($("#tmpl-order").render(orders));
    $(".order").each(function(i, elem) {
        $(elem).delay(i * 200).show("slide");
    });

    $("#current-sort").on("click touchend", function(e) {
        e.preventDefault();
        $("#select-sort li, #select-sort .closer").hide();
        $("#select-sort").fadeIn(function() {
            $("html, body").css("overflow", "hidden").css("height", "100%");
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
            $("html, body").css("overflow", "").css("height", "");
            $("#select-sort").fadeOut();
        });

    });

    $('#button-pay').on('click touchend', function(e) {
        e.preventDefault();

        location.href = 'payed.html';
    });
})(jQuery);

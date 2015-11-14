// jshint devel:true
(function($) {
    // $('#detail').load('./detail.html');
    var file = './detail.html';
    $.when($.get(file)).done(function(tmplData) {
        $.templates({ detail: tmplData });
        // $(item.selector).html($.render.tmpl(item.data));
     });

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

    var isDragged = false;
    $("#orders").on("click touchend", ".order", function(e) {
        e.preventDefault();

        var documentHeight = $(window).height(),
            closer = $(this).find(".order-closer"),
            wrapper = $(this).find(".order-wrapper"),
            container = $(this).find(".container"),
            hiddens = $(this).find(".order-hidden");

        if (closer.is(":visible")) {
            return;
        }
        if (isDragged) {
            isDragged = false;
            return;
        }

        closer.fadeIn();
        closer.on("click touchend", function(e) {
            // close
            e.preventDefault();
            hiddens.hide();
            closer.fadeOut();
            wrapper.animate({ height: container.innerHeight() + 20 });
        });

        // open
        wrapper.animate({ height: documentHeight - 20 });
        $("body, html").animate({ scrollTop: $(this).offset().top });
        hiddens.fadeIn();

        // TODO: type details

        $(this).on("click touchend", ".order-button-join > button", function(e) {
            e.preventDefault();
            $(".order-button-join").hide();
            $(".order-joined").show("bounce");
        });
        $(this).on("click touchend", ".order-button-cancel", function(e) {
            e.preventDefault();
            console.log("here");
            $(".order-joined").hide();
            $(".order-button-join").fadeIn();
        });

    }).on('mousemove touchmove', function() {
        isDragged = true;
    });
})(jQuery);

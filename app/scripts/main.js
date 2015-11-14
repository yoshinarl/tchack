// jshint devel:true
(function($) {
    // $('#detail').load('./detail.html');
    var file = './detail.html',
        shopFile = './datas/shops.csv',
        isDragged = false;

    $.when($.get(file)).done(function(tmplData) {
        $.templates({ detail: tmplData });
        // $(item.selector).html($.render.tmpl(item.data));
    });

    $.ajax({
        url: shopFile,
        success: function(data) {
            var json = $.csv.toObjects(data);
            $("#orders").append($("#tmpl-order").render(json));
            viewShoplist();
        }
    });

    function viewShoplist() {
        $(".order").each(function(i, elem) {
            $(elem).delay(i * 200).show("slide");
        });
    }

    // TODO: load from static dummy json file
    var orders = [1, 2, 3, 4, 5];

    function sortShopList(sort) {
        // TODO: sort
        viewShoplist();
    }

    $("#current-sort").on("click touchend", function(e) {
        e.preventDefault();
        $('body').css('position', 'fixed');
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
            $('body').css('position', 'static');
            $("html, body").css("overflow", "").css("height", "");
            $("#select-sort").fadeOut();
        });
    });

    $('#button-pay').on('click touchend', function(e) {
        e.preventDefault();

        location.href = 'payed.html';
    });

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

        var imageHeight = container.innerWidth() / 6 * 4;
        // open
        wrapper.animate({ height: container.innerHeight() +  210 + imageHeight });
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
            $(".order-joined").hide();
            $(".order-button-join").fadeIn();
        });

    }).on('mousemove touchmove', function() {
        isDragged = true;
    });

    var socket = new Socket("ws://make-it-back.com:4000/api/socket/websocket?vsn=1.0.0")
    socket.connect();
    var channel = socket.channel("rooms:lobby", {});
    channel.join();
    channel.on("achive", function(dt) {
        $("#modal-confirm").modal();
    });

})(jQuery);

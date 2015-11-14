// jshint devel:true
(function($) {
    // $('#detail').load('./detail.html');
    var file = './detail.html',
        shopFile = './datas/shops.csv',
        shopDatas = null,
        isDragged = false,
        sortType = {
            hot: 1,
            new: 2,
            neary: 3,
            around: 4
        };

    $.when($.get(file)).done(function(tmplData) {
        $.templates({ detail: tmplData });
        // $(item.selector).html($.render.tmpl(item.data));
    });

    $.ajax({
        url: shopFile,
        success: function(data) {
            shopDatas = $.csv.toObjects(data);
            viewShopList(shopDatas);
        }
    });

    function viewShopList(data) {
        $("#orders").empty();
        $("#orders").append($("#tmpl-order").render(data));
        $(".order").each(function(i, elem) {
            $(elem).delay(i * 200).show("slide");
        });
    }

    function sortShopList(sort) {
        var type = sortType[sort],
            sortKey = null,
            transformed = {};

        if (type === 1) {
            sortKey = 'score';
        } else if (type === 2) {
            sortKey = 'register_date';
        } else if (type === 3) {
            sortKey = 'event_date';
        } else if (type === 4) {
            // TODO: implement distance sort;
            return;
        } else {
            return;
        }

        transformed = transformWithType(sortKey);

        var sorted = [],
            order = [];

        $.each(transformed, function(k, v) {
            if (typeof v[sortKey] !== 'undefined') {
                order.push(k);
            }
            order.sort();
        });

        $.each(order, function(i, item) {
            sorted.push(transformed[item]);
        });

        viewShopList(sorted);
    }


    function transformWithType(key) {
        var transformed = {};
        $.each(shopDatas, function(i, shop) {
            if (typeof shop[key] !== 'undefined') {
                transformed[shop[key]] = shop;
            }
        });
        return transformed;

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

        $('.sort-type').on('click touchend', function(e) {
            e.preventDefault();
            sortShopList($(this).data('type'));
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

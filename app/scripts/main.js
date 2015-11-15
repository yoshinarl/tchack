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
        },
        sortDetail = {
            1: {
                glyphicon: 'fire',
                label: 'Hot'
            },
            2: {
                glyphicon: 'bullhorn',
                label: 'New'
            },
            3: {
                glyphicon: 'time',
                label: 'もうすぐ'
            },
            4: {
                glyphicon: 'map-marker',
                label: '周辺'
            }
        };

    $.when($.get(file)).done(function(tmplData) {
        $.templates({ detail: tmplData });
    });

    $.ajax({
        url: shopFile,
        success: function(data) {
            shopDatas = $.csv.toObjects(data);
            $(shopDatas).each(function(i, dt) {
                dt.quota = Number(dt.quota);
                dt.current_member = Number(dt.current_member);
                dt.remained = dt.quota - dt.current_member;
            });
            sortShopList('hot');
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
            transformed = {};

        decideSortKey(type).done(function(sortKey) {
            transformed = transformWithType(sortKey);

            var sorted = [],
                order = [];

            $.each(transformed, function(k, v) {
                if (typeof v[sortKey] === 'undefined') {
                    return true;

                }

                if (sortKey === 'event_date' || sortKey === 'register_date') {
                    var date = moment(v[sortKey], "M/D/YYYY");
                    order.push(date.valueOf());
                    order.sort(function(a, b) {
                        return (a > b ? 1 : -1);
                    });
                } else {
                    order.push(k);
                    order.sort(function(a, b) {
                        return (Number(a) > Number(b) ? 1 : -1);
                    });
                }
            });

            $.each(order, function(i, item) {
                if (sortKey === 'event_date' || sortKey === 'register_date') {
                    sorted.push(transformed[moment(item).format('M/D/YYYY')]);
                } else {
                    sorted.push(transformed[item]);
                }
            });

            viewShopList(sorted);

        });
    }


    function decideSortKey(type) {
        var deferred = new $.Deferred();

        if (type === 1) {
            deferred.resolve('score');
        } else if (type === 2) {
            deferred.resolve('register_date');
        } else if (type === 3) {
            deferred.resolve('event_date');
        } else if (type === 4) {
            getCurrentPosition().done(function(position) {
            $.each(shopDatas, function(i, shop) {
                shop.dist = Number(geolib.getDistance(
                    {latitude: position.lat, longitude: position.lon},
                    {latitude: Number(shop.lat), longitude: Number(shop.lon)}
                ));
            });
                deferred.resolve('dist');
            });
        } else {
            return deferred.reject();
        }

        return deferred.promise();
    }


    function getCurrentPosition() {
        var deferred = new $.Deferred();

        if(!navigator.geolocation) {
            alert('ご利用の端末は位置情報の取得に対応しておりません。');
            deferred.reject();
        }

        var position = navigator.geolocation.getCurrentPosition(
            function(position) {
                deferred.resolve({
                    lat: position.coords.latitude,
                    lon:position.coords.longitude
                });
            },
            function(error) {
                var errorMessage = {
                    0: "原因不明のエラーが発生しました。設定を確認の上、再度お試しください。" ,
                    1: "位置情報の取得が許可されていません。設定を確認の上、再度お試しください。" ,
                    2: "電波状況などで位置情報が取得できませんでした。電波の良い場所で再度お試しください。" ,
                    3: "位置情報の取得に時間がかかっています。電波の良い場所で再度お試しください。"
                };
                alert(errorMessage[error.code]);
                deferred.reject();
            }
        );

        return deferred.promise();
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
        var currentType = $(this).attr('data-type');
        $('#current-sort-flag').remove();
        $('body').css('position', 'fixed');
        $("#select-sort li, #select-sort .closer").hide();
        $("#select-sort").fadeIn(function() {
            $("html, body").css("overflow", "hidden").css("height", "100%");
            $("#select-sort .closer").show("scale", 100);
            $("#select-sort li").each(function(i, elem) {
                if (currentType === $(elem).data('type')) {
                    $(elem).off('click touchend');
                    $(elem).prepend('<span class="glyphicon glyphicon-menu-right" id="current-sort-flag" style="margin-right:4px;"></span>');
                }
                $(elem).delay(i * 100).show("slide", 300);
            });
        });

        $("#select-sort .closer").on("click touchend", function(e) {
            e.preventDefault();
            fadeOutSortScreen();
        });

        $('.sort-type').on('click touchend', function(e) {
            e.preventDefault();
            var type = $(this).data('type');
            sortShopList(type);
            fadeOutSortScreen(type);
        });
    });

    function fadeOutSortScreen(type) {
        if (typeof type !== 'undefined') {
            $('#current-sort > span').first().attr('class', 'glyphicon glyphicon-' + sortDetail[sortType[type]].glyphicon);
            $('#current-sort').attr('data-type', type);
            $('#current-sort > b').text(sortDetail[sortType[type]].label);
        }

        $("#select-sort li").each(function(i, elem) {
            $(elem).delay(i * 100).hide("slide", 300);
        });
        $('body').css('position', 'static');
        $("html, body").css("overflow", "").css("height", "");
        $("#select-sort").fadeOut();
    }

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
            hiddens = $(this).find(".order-hidden"),
            id = $(this).data("order-id");

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
            incrementMember(id, 1);
            $(".order-button-join").hide();
            $(".order-joined").show("bounce");
        });
        $(this).on("click touchend", ".order-button-cancel", function(e) {
            e.preventDefault();
            incrementMember(id, -1);
            $(".order-joined").hide();
            $(".order-button-join").fadeIn();
        });

    }).on('mousemove touchmove', function() {
        isDragged = true;
    });

    function getEventById(id) {
        var detected = null;
        $(shopDatas).each(function(i, shop) {
            if (shop.id == id) {
                detected = shop;
                return false;
            }
        });
        return detected;
    }

    var socket = new Socket("ws://make-it-back.com:4000/api/socket/websocket?vsn=1.0.0")
    socket.connect();
    var channel = socket.channel("rooms:lobby", {});
    channel.join();
    channel.on("achive", function(dt) {
        $("#confirm-message .confirm-hidden").hide();
        $("html, body").css("overflow", "hidden").css("height", "100%");
        $("#confirm-message").fadeIn(function() {
            $("#confirm-message .confirm-label").show("puff", {easing: "easeOutBounce"}, 500, function() {
                $("#confirm-message .confirm-order").html($("#tmpl-confirm-order").render(getEventById(dt.id)));
                $("#confirm-message .confirm-form, #confirm-message .confirm-order").fadeIn();
            });
            $("#confirm-message .closer")
                .fadeIn()
                .on("click touchend", function(e) {
                    e.preventDefault();
                    $("#confirm-message").fadeOut();
                    $("html, body").css("overflow", "").css("height", "");
                });
        });
    });

    function incrementMember(id, _count) {
        var count = _count || 1;
        var ev = getEventById(id);
        ev.current_member += count;
        ev.remaind = ev.quota - ev.current_member;
        if (ev.remaind < 0) {
            ev.remaind = 0;
        }
        var color = (count > 0) ? "rgb(74, 175, 70)" : "#D32F2F";
        var elem = $(".order[data-order-id='" + id + "']");
        elem.find(".order-members span").text(ev.remaind).css("color", color).animate({ color: "#fff" });
    }

    channel.on("reduce", function(dt) {
        incrementMember(dt.id);
    });

    $(document).on('click touchend', '.gnavi-link', function(e) {
        e.preventDefault();
        window.open().location.href = $(this).data('href');
    });

})(jQuery);

$.views.converters({
    'date':  function(value) {
        return moment(value, 'M/D/YYYY').format('YYYY年MM月DD日');
    },
    'number': function(value) {
        return Number(value).toLocaleString();
    }
});

// jshint devel:true
(function($) {
    $('#detail').load('./detail.html');

    $('#button-pay').on('click touchend', function(e) {
        e.preventDefault();

        location.href = 'payed.html';
    });
})(jQuery);

function add_to_cart(_link) {
    var $link = $(_link);

    console.log($link.data('product-id'));
}

$(function() {
    $.post(
        'ajax/header/', {},
        function(response) {
            if (response.hasOwnProperty('user')) {
                $('#user_menu').html(response.user);
            }

            if (response.hasOwnProperty('cart')) {
                $('#mini_cart').html(response.cart);
            }
        },
        'json'
    );
});
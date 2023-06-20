var LANG, DEF_LANG, _LANG = {},
    BASE_URL, $black, $ajax_loader, $error_message,
    emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
    ruleRegex = /^(.+)$/;

function get_lang(key) {
    return _LANG[key] !== undefined ? _LANG[key] : key + ' TRANSLATE!';
}

jQuery.fn.placeholder = function(label) {
    return this.each(function() {

        if ($.trim($(this).val()) === '') {
            $(this).val(label);
        } else {
            $(this).attr('title', label);
        }

        $(this)
            .on('click focus', function() {
                if ($.trim($(this).val()) === label) {
                    $(this).val('').attr('title', label);
                }
            })
            .on('keyup', function() {
                $(this).removeClass('error');
            })
            .on('blur', function() {
                if ($.trim($(this).val()) === '') {
                    $(this).val(label).removeAttr('title');
                } else {
                    $(this).attr('title', label);
                    $(this).removeClass('error');
                }
            });
    });
};

jQuery.fn.dropdown = function(options) {

    var settings = $.extend({
        action: 'init',
        multiSelect: false,
        label: '',
        arrow: '',
        prevent: true,
        onChange: ''
    }, options);
    return this.each(function() {
        var $this = $(this);

        if (settings.label == '') {
            if ($this.find('.overflow').data('label') != '') {
                settings.label = $this.find('.overflow').data('label');
            } else {
                settings.label = get_lang('dont_select');
            }
        }

        if (settings.action == 'reinit' || settings.action == 'unset') {
            $this.off('click', '.overflow').find('ul').eq(0).off('click', 'a');
            if (settings.action == 'unset') {
                return;
            }
            settings.action = 'init';
        }
        if (settings.action == 'init' && !$this.hasClass('init')) {
            if ($this.find('.selected').length > 0) {
                if (!settings.multiSelect) {
                    $this.find('span:eq(0)')
                        .html($this.find('.selected').text() + settings.arrow)
                        .end()
                        .find('input').val($this.find('.selected a').data('value'))
                        .end()
                        .find('.selected').closest('li').hide();
                } else {

                    names = [];
                    ids = [];

                    $this.find('.selected').each(function(index, el) {
                        names.push($(this).find('a').text());
                        ids.push($(this).find('a').data('value'));
                    });

                    console.log(names);
                    $this.find('span:eq(0)').html(names.join(', ')).end().find('input').val(ids.join(','));
                }
            }

            $this.on('click', '.overflow', function(e) {
                e.preventDefault();

                if (!$(this).closest('.dropdown').hasClass('dropdown-open')) {
                    $.when($('.dropdown').each(function() {
                        $(this).removeClass('dropdown-open').find('ul:eq(0)').slideUp();
                    })).then(function() {
                        $this.addClass('dropdown-open').find('ul:eq(0)').slideDown(function() {
                            var h = parseInt($(this).outerHeight(true, true)),
                                top = parseInt($(this).offset()['top']) - parseInt($(document).scrollTop()),
                                wh = parseInt($(window).height());

                            if (top + h > wh) {
                                $(this).css({
                                    'max-height': wh - top - 10
                                });
                            } else {
                                $(this).css({
                                    'max-height': 'auto'
                                });
                            }
                        });
                    });
                } else {
                    $this.removeClass('dropdown-open').find('ul:eq(0)').slideUp();
                }
            });

            $this.find('ul').eq(0).on('click', 'a', function(e) {
                e.preventDefault();

                if (!$(this).hasClass('disabled')) {
                    if (settings.prevent === false) {
                        window.location.href = $(this).attr('href');
                    } else {
                        if (!settings.multiSelect) {
                            $(this).closest('ul').find('.selected').removeClass('selected').show().end().end().closest('li').addClass('selected').hide();
                            $this.find('span:eq(0)').html($(this).text() + settings.arrow).end().find('input').val($(this).data('value'));
                            $this.removeClass('dropdown-open').find('ul:eq(0)').slideUp();
                        } else {
                            $(this).closest('li').addClass('selected');

                            names = [];
                            ids = [];

                            $(this).closest('ul').find('.selected').each(function(index, el) {
                                names.push($(this).find('a').text());
                                ids.push($(this).find('a').data('value'));
                            });

                            $this.find('span:eq(0)').html(names.join(', ')).end().find('input').val(ids.join(','));
                        }

                        if (!settings.multiSelect) {}
                        if ($.isFunction(settings.onChange)) settings.onChange($(this));
                    }
                }
            });
            $(this).addClass('init')
        }
        if (settings.action == 'refresh') {
            console.log($this.find('.overflow').find('span'), settings.label);
            $this.find('.overflow').find('span').text(settings.label)
                .end().end()
                .find('input').val('')
                .end()
                .find('ul').find('.selected').removeAttr('style').removeClass('selected');
        }
    });
};

jQuery.fn.filter_dropdown = function(options) {

    var settings = $.extend({
        onChange: ''
    }, options);

    return this.each(function() {
        var $this = $(this);

        if ($this.hasClass('dropdown-open')) {
            $this.addClass('dropdown-open').find('ul').eq(0).stop().slideDown();
        }

        $this.find('span').eq(0).on('click', function(e) {
            e.preventDefault();

            if ($this.hasClass('dropdown-open')) {
                $this.removeClass('dropdown-open').find('ul').eq(0).stop().slideUp();
            } else {
                $this.addClass('dropdown-open').find('ul').eq(0).stop().slideDown();
            }
        });

        $this.find('ul').eq(0).on('click', 'a', function(e) {
            e.preventDefault();

            if (!$(this).hasClass('filter-disabled')) {
                $(this).hasClass('filter-selected') ? $(this).removeClass('filter-selected') : $(this).addClass('filter-selected');
                if ($.isFunction(settings.onChange)) settings.onChange($(this));
            }
        });
    });
};

function setcookie(name, value, expires, path, domain, secure) {
    expires instanceof Date ? expires = expires.toGMTString() : typeof(expires) === 'number' && (expires = (new Date(+(new Date) + expires * 1e3)).toGMTString());
    var r = [name + "=" + value],
        s, i;
    for (i in s = {
            expires: expires,
            path: path,
            domain: domain
        }) s[i] && r.push(i + "=" + s[i]);
    return secure && r.push("secure"), document.cookie = r.join(";"), true;
}

function full_url(uri) {
    return window.location.protocol + '//' + window.location.hostname + (LANG === DEF_LANG ? '' : '/' + LANG) + '/' + (uri !== '' ? uri + '/' : '');
}

function base_url(uri) {
    return window.location.protocol + '//' + window.location.hostname + '/' + uri;
}

function roundPlus(x, n) {
    if (isNaN(x) || isNaN(n)) return false;
    var m = Math.pow(10, n);
    return Math.round(x * m) / m;
}

function mini_cart(data) {
    var cart_content = '';

    if (data.total > 0) {
        var last_products = '';

        // for (var i = 0; i < data.products.length; i++) {
        // 	last_products += '<div class="fm mw_one"><div class="fm mw_delete"><button type="button" class="mini_cart_delete" data-product-id="' + data['products'][i]['product_id'] + '" data-size-id="' + data['products'][i]['size_id'] + '"></button></div><div class="fm mw_photo"><a href="' + data['products'][i]['url'] + '">' + (data['products'][i]['image'] != '' ? '<img src="' + data['products'][i]['image'] + '" alt="">' : '') + '</a></div><div class="fm mw_desc"><div class="fm mw_name"><a href="' + data['products'][i]['url'] + '">' + data['products'][i]['title'] + (data['products'][i]['size'] !== '' ? '<br>' + get_lang('size') + ':' + data['products'][i]['size'] : '') + '</a></div><div class="fm mw_amount">' + data['products'][i]['total'] + ' ' + get_lang('шт.') + '</div><div class="fm mw_price">' + data['products'][i]['screen_price'] + ' ' + get_lang('uah') + '</div></div></div>';
        // }

        cart_content = '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#shopping-cart"></use></svg><span class="compare_counter">' + data.total + '</span><span class="shopping_sum">' + data.price + ' ' + get_lang('uah') + '</span>';
    } else {
        cart_content = '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#shopping-cart"></use></svg>';
    }

    $('.shopping_cart').html(cart_content);

    if ($(document).find('.sticky_cart').length > 0) {
        if (data.total > 0) {
            $(document).find('.sticky_cart').html('<a href="#" class="show_cart_form">' + get_lang('cart') + '<span>' + data.total + '</span></a>');
        } else {
            $(document).find('.sticky_cart').html('<div class="mc_empty"><i></i></div>');
        }
    }
}

function get_product_info(obj, product_place) {
    var $event_trigger = obj,
        product_id = 0,
        response = {},
        total = 0,
        basket_request = {};


    if (product_place == 'cart') {
        var $product_box = $event_trigger.closest('.one_ct_good');
        product_id = $product_box.data('product-id');
        total = $product_box.find('.right_box_cart').find('.cart_total').find('input').val();
    }
    if (product_place == 'order') {
        product_id = $event_trigger.data('product-id');
        total = parseInt($event_trigger.find('.your_cart_product_amount').text());
    }
    if (product_place == 'details') {
        if ($event_trigger.data('basket')) {
            basket_request = $event_trigger.data('basket');
        } else {
            basket_request = {
                'product_id': $event_trigger.data('product-id')
            };
        }
        product_id = basket_request.product_id;
    }

    $.ajaxSetup({
        async: false
    });
    $.post(full_url('catalog/get_product_info'), {
        product_id: product_id
    }, function(xhr) {
        if (xhr.success) {
            xhr.product['total'] = (total == 0 ? 1 : total);
            xhr.product['product_id'] = product_id;
            response = xhr.product;

        }
    }, 'json');
    return response;
}

function addLink() {
    var body_element = document.getElementsByTagName('body')[0],
        selection = window.getSelection(),
        pagelink = (LANG === 'ua' ? ' Детальніше: ' : ' Подробнее: ') + window.location.href,
        copy_text = (selection + '. ' + pagelink).replace('..', '.'),
        new_div = document.createElement('div');

    new_div.style.left = '-99999px';
    new_div.style.position = 'absolute';

    body_element.appendChild(new_div);
    new_div.innerHTML = copy_text;
    selection.selectAllChildren(new_div);

    window.setTimeout(function() {
        body_element.removeChild(new_div);
    }, 0);
}

$(function() {

    //sets
    var setsSlider = $('.sets-slider');
    if (setsSlider.length > 0) {
        setsSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
        });
    }

    $('.mobile_search').on('click', function() {
        var $btn = $(this);

        $btn.addClass('active');
        $black.removeClass('hidden');

        $black.one('click', function() {
            $btn.removeClass('active');
            $black.addClass('hidden');
        });
    });

    $('.ring').animate({
        opacity: 0
    }, 500, function() {
        $(this).remove();
    });

    $('.lazy').Lazy();

    //--------------------------------------------------------------------------------------------------------------------------------------

    $black = $('<div/>', {
        'class': 'black hidden'
    }).fadeTo(20, 0.6);
    $ajax_loader = $('<div/>', {
        'class': 'popup hidden'
    }).append($('<img/>', {
        src: 'images/ring.gif'
    }));
    $error_message = $('<div>', {
        'class': 'popup hidden'
    });

    $('body').append($black).append($ajax_loader).append($error_message);

    //--------------------------------------------------------------------------------------------------------------------------------------

    $error_message.append($('<button/>', {
        'type': 'button',
        'class': 'popup_close'
    }))
    $error_message.append($('<div/>', {
        'class': 'popup_title'
    }).text(get_lang('error')));
    $error_message.append($('<div/>', {
        'class': 'popup_subtitle'
    }).text(get_lang('error_unknown')));

    $error_message.on('click', '.popup_close', function() {
        $black.off('click');
        $error_message.add($black).addClass('hidden');
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    $('.print_icon').on('click', function() {
        window.open(full_url('printing/index') + '?module=' + $(this).data('module') + '&id=' + $(this).data('id'), '', 'width=800,height=600,scrollbars=yes,status=no,resizable=yes,screenx=0,screeny=0');
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    $(document)
        .on('show_error_popup', function() {
            $error_message.css('top', $(document).scrollTop() + 50).removeClass('hidden');

            $black.off('click').one('click', function() {
                $black.add($error_message).addClass('hidden');
            });
        })
        .on('click', function(e) {
            $(document).find('#search_form').removeClass('active');
            $(document).find('.phone_container').removeClass('active');
            $(document).find('.mob-mmenu').removeClass('active');

            $(".feedback_dropdown").addClass("hidden");
            $(".btn_feedback").removeClass("active");

            if ($(e.target).hasClass('mob-menu-close')) {
                $black.addClass('hidden');
            }

            if ($('.banner_catalog.header_catalog').hasClass('active')) {
                $('.banner_catalog.header_catalog').removeClass('active');
                $('.catalog_button').removeClass('active');
                $black.addClass('hidden');
            }
        });

    //--------------------------------------------------------------------------------------------------------------------------------------

    $(window).scroll(function() {
        var ww = $(window).width();

        if (ww > 380) {
            clearTimeout($.data(this, 'scrollTimer'));

            $.data(this, 'scrollTimer', setTimeout(function() {
                $('.popup:visible').not('.no_scroll').animate({
                    'top': $(document).scrollTop() + 50
                });
            }, 250));
        }
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    $(document)
        .on('click', '.order-call-phones__item', function(e) {
            e.stopPropagation();

            $(this).closest('.phone_container').toggleClass('active');
        })
        .on('click', '.call_form_open', function(e) {
            e.stopPropagation();
            e.preventDefault();

            $(document).find('.btn_catalog').add($(document).find('.mob-mmenu')).removeClass('active');

            var $self = $(this);

            $ajax_loader.css('top', $(document).scrollTop() + 50);
            $ajax_loader.add($black).removeClass('hidden');

            $.ajax({
                    url: full_url('popup/call_popup'),
                    method: 'post',
                    data: {
                        event_name: $self.data('event-name'),
                        product_id: $self.data('product-id')
                    }
                })
                .done(function(response) {
                    $('body').append(response);

                    var $call_form = $(document).find('.callback_popup');

                    $call_form.find('[name="phone"]').inputmask('+38 (999) 999-99-99');

                    $call_form
                        .on('click', '.popup_close', function(e) {
                            e.preventDefault();

                            $call_form.trigger('close');
                        })
                        .on('submit', 'form', function(e) {
                            e.preventDefault();

                            var validate = true;

                            if ($.trim($call_form.find('[name="name"]').val()) === '') {
                                validate = false;
                                $call_form.find('[name="name"]').addClass('error');
                            }

                            if ($.trim($call_form.find('[name="phone"]').val()) === '') {
                                validate = false;
                                $call_form.find('[name="phone"]').addClass('error');
                            }

                            if ($call_form.find('[name="email"]').length > 0 && $.trim($call_form.find('[name="email"]').val()) === '') {
                                validate = false;
                                $call_form.find('[name="email"]').addClass('error');
                            }

                            if (validate) {
                                $call_form.addClass('hidden');
                                $ajax_loader.removeClass('hidden');

                                $.ajax({
                                        url: $call_form.find('form').attr('action'),
                                        method: $call_form.find('form').attr('method'),
                                        dataType: 'json',
                                        data: {
                                            event_name: $self.data('event-name'),
                                            name: $call_form.find('[name="name"]').val(),
                                            phone: $call_form.find('[name="phone"]').val(),
                                            email: $call_form.find('[name="email"]').val(),
                                            message: $call_form.find('[name="message"]').val(),
                                            url: window.location.href
                                        }
                                    })
                                    .done(function(response) {
                                        $ajax_loader.addClass('hidden');
                                        $call_form.html(response.message).removeClass('hidden');
                                    })
                                    .fail(function(response) {
                                        $ajax_loader.addClass('hidden');
                                        $(document).trigger('show_error_popup');
                                    });
                            }
                        })
                        .on('close', function() {
                            $black.off('click').addClass('hidden');
                            $call_form.remove();
                        });

                    $black.one('click', function() {
                        $call_form.trigger('close');
                    });

                    $ajax_loader.addClass('hidden');
                    $call_form.css('top', $(document).scrollTop() + 50).removeClass('hidden');
                })
                .fail(function(a, b) {
                    $ajax_loader.addClass('hidden');
                    $(document).trigger('show_error_popup');
                });

            //$(document).find('.callback_popup').add($black).removeClass('hidden');
        });

    //--------------------------------------------------------------------------------------------------------------------------------------

    var $search_form = $('#search_form');

    if ($search_form.find('.all_categories').find('.active').length > 0) {
        $search_form.find('.all_categories').find('[type="button"]').text($search_form.find('.all_categories').find('.active').text());
    }

    $search_form
        .on('click', '[type="button"]', function(e) {
            e.preventDefault();
            e.stopPropagation();

            $search_form.toggleClass('active');
        })
        .on('click', 'a.search', function(e) {
            e.preventDefault();
            $search_form.find('form').trigger('submit');
        })
        .on('click', '.all_categories_dropdown a', function(e) {
            e.preventDefault();
            e.stopPropagation();

            $search_form.find('[type="button"]').text($(this).text());
            $search_form.find('[name="search_category"]').val($(this).data('menu-id'));
            $search_form.toggleClass('active');

            /* $search_form.css('z-index', 101);
            $black.removeClass('hidden').one('click', function () {
            	$search_form.css('z-index', 'inherit');
            	$black.addClass('hidden');
            }); */
        })
        /* .on('focus', '[type="text"]', function () {
        	$search_form.css('z-index', 101);
        	$black.removeClass('hidden').one('click', function () {
        		$search_form.css('z-index', 'inherit');
        		$black.addClass('hidden');
        	});
        }) */
        .on('submit', 'form', function(e) {
            var query = $.trim($(this).find('[type="text"]').val());

            if (query === '' && query === get_lang('Пошук')) {
                e.preventDefault();
            }
        });

    //--------------------------------------------------------------------------------------------------------------------------------------

    $('.map_slide').on('click', function() {
        $(this).closest('.map').toggleClass('active');
        $(this).toggleClass('active');
    });

    $(document).on('products_slider_component', function() {
        $('.products_slider_component').not('.intslk').map(function() {
            var $self = $(this);

            $self.addClass('intslk');

            $self.find('.simple_box_nav').on('click', 'a', function(e) {
                e.preventDefault();

                $(this).closest('ul').find('.active').removeClass('active');
                $(this).addClass('active');

                $self.find('.products_slider').slick('unslick');

                $self.find('.products_slider').find('.one_good').addClass('hidden');
                $self.find('.products_slider').find('.one_good[data-id="' + $(this).data('id') + '"]').removeClass('hidden');

                $self.find('.products_slider').trigger('init_slick');
            });

            $self.find('.simple_box_nav')
                .slick({
                    mobileFirst: true,
                    adaptiveHeight: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [{
                            breakpoint: 639,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 1200,
                            settings: 'unslick'
                        }
                    ]
                })
                .on('afterChange', function(a, b) {
                    $self.find('.simple_box_nav').find('.slick-active').find('a').trigger('click');
                });

            $self.find('.products_slider').on('init_slick', function() {
                $self.find('.products_slider').slick({
                        slide: '.one_good:not(.hidden)',
                        mobileFirst: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        responsive: [{
                                breakpoint: 479,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 2
                                }
                            },
                            {
                                breakpoint: 992,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 3
                                }
                            },
                            {
                                breakpoint: 1199,
                                settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 4
                                }
                            }
                        ]
                    })
                    .on('afterChange', function(a, b) {
                        $('.lazy').Lazy();
                    });
            });

            $self.find('.products_slider').trigger('init_slick');
        });

        $('.category_comments').not('.intslk').map(function() {
            $(this).addClass('intslk');

            /* $(this).on('setPosition', function () {
            	$(this).find('.slick-slide').height('auto');
            	var slickTrack = $(this).find('.slick-track');
            	var slickTrackHeight = $(slickTrack).height();
            	$(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
            }); */

            $(this).slick({
                mobileFirst: true,
                adaptiveHeight: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                responsive: [{
                        breakpoint: 479,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 639,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    }
                ]
            });
        });

        $('.catalog_slider_inner').not('.intslk').map(function() {
            $(this).addClass('intslk');

            $(this).slick({
                slidesToShow: 4,
                slidesToScroll: 2,
                speed: 500,
                responsive: [{
                        breakpoint: 1000,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 640,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        });

        $('.slider_width').not('.intslk').map(function() {
            $(this).addClass('intslk');

            $(this).slick({
                slidesToShow: 6,
                slidesToScroll: 2,
                speed: 500,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 1000,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 640,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        });

        $('.news_slider').map(function() {
            if (!$(this).hasClass('intslk')) {
                $(this).addClass('intslk');

                $(this).slick({
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    adaptiveHeight: true,
                    speed: 500,
                    responsive: [{
                            breakpoint: 479,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4
                            }
                        }
                    ]
                });
            }
        });
    });

    $(document).trigger('products_slider_component');
    //--------------------------------------------------------------------------------------------------------------------------------------

    var $page_up = $('.page_up');

    $(window).on('scroll', function() {
        if ($(document).scrollTop() > 0) {
            $page_up.addClass('active');
        } else {
            $page_up.removeClass('active');
        }
    });

    $page_up.on('click', function(e) {
        e.preventDefault();

        $('html, body').animate({
            scrollTop: 0
        });
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    var $main_menu = $('.banner_catalog.header_catalog');

    if ($main_menu.find('ul').length > 0) {
        $main_menu.find('.for_evry_drop').map(function() {
            var ul_l = $(this).find('li').length;

            if (ul_l > 20) {
                $(this).find('ul').eq(0).addClass('ul_c3');
            } else if (ul_l > 10) {
                $(this).find('ul').eq(0).addClass('ul_c2');
            }
        });

        $main_menu
            .find('ul').eq(0).children()
            .on('mouseenter', function() {
                var $li = $(this);

                if ($li.find('.for_evry_drop').length > 0) {
                    $.when(
                        $('.for_evry_drop').removeClass('active')
                    ).then(function() {
                        if ($li.find('.for_evry_drop').length > 0) {
                            if ($(window).width() - $li.closest('nav').outerWidth() < $li.find('.for_evry_drop').outerWidth()) {
                                $li.find('.for_evry_drop').css('width', $(window).width() - $li.closest('nav').outerWidth() - 20);
                            } else {
                                $li.find('.for_evry_drop').css('width', $li.closest('.center').outerWidth());
                            }

                            $li
                                .find('.for_evry_drop').addClass('active')
                                .end()
                                .find('a').eq(0).addClass('active');
                        }
                    });
                } else {
                    $li.find('a').eq(0).addClass('active');
                }
            })
            .on('mouseleave', function() {
                var $li = $(this);

                if (!$li.find('a').eq(0).hasClass('nra')) {
                    $li.find('a').eq(0).removeClass('active');
                    $main_menu.find('.nra').addClass('active');
                }

                $li.find('.for_evry_drop').removeClass('active');
            });

        var $mob_catalog = $('<ul/>', {
            'class': 'hidden'
        });

        $('.header_catalog').find('ul').eq(0).children().map(function() {
            if ($(this).text() !== '') {
                var $li = $('<li/>').append($('<a/>', {
                    'href': $(this).find('ul').length > 0 ? '#' : $(this).find('a').eq(0).attr('href')
                }).text($(this).find('a').eq(0).text()));

                if ($(this).find('ul').length > 0) {
                    $li.addClass('has-submenu');

                    var $ul = $('<ul/>', {
                        'class': 'hidden'
                    });

                    $(this).find('ul').eq(0).children().map(function() {
                        var $_li = $('<li/>').append($('<a/>', {
                            'href': $(this).find('ol').length > 0 ? '#' : $(this).find('a').eq(0).attr('href')
                        }).text($(this).find('a').eq(0).text()));

                        if ($(this).find('ol').length > 0) {
                            $_li.addClass('has-submenu');

                            var $__ul = $('<ul/>', {
                                'class': 'hidden'
                            });

                            $(this).find('ol').eq(0).children().map(function() {
                                var $__li = $('<li/>').append($('<a/>', {
                                    'href': $(this).find('a').eq(0).attr('href')
                                }).text($(this).find('a').eq(0).text()));

                                $__ul.append($__li);
                            });

                            $_li.append($__ul);
                        }

                        $ul.append($_li);
                    });

                    $li.append($ul);
                }

                $mob_catalog.append($li);
            }
        });

        $('.mob-catalog-menu').append($mob_catalog);
        $('.mob-catalog-menu').on('click', 'a', function(e) {
            if ($(this).attr('href') === '#' && $(this).closest('li').hasClass('has-submenu')) {
                e.preventDefault();
                e.stopPropagation();

                $(this).toggleClass('active').closest('li').find('ul').eq(0).toggleClass('hidden');
            }
        });

        var $mob_menus = $('<ul/>');

        $('.top_menu').find('a').map(function() {
            var $a = $('<a/>', {
                'href': $(this).attr('href')
            }).text($(this).text());

            if ($(this).data('class')) {
                $a.append($('<i/>', {
                    'class': $(this).data('class')
                }));
            }

            $mob_menus.append($('<li/>').append($a));
        });

        $('.mob-main-menu').find('ul').eq(0).append($mob_menus.html());
    }

    $('.main_slider_container li').on('mouseover', function() {
        $('.catalog_btn-wrap').find('nav').addClass('active');
    });

    $('.catalog_btn').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $('.banner_catalog.header_catalog').addClass('active');
        $black.removeClass('hidden');

        if ($('.banner_catalog.header_catalog').find('a').eq(0).hasClass('has_drop')) {
            var $li = $('.banner_catalog.header_catalog').find('li').eq(0)

            if ($(window).width() - $li.closest('nav').outerWidth() < $li.find('.for_evry_drop').outerWidth()) {
                $li.find('.for_evry_drop').css('width', $(window).width() - $li.closest('nav').outerWidth() - 20);
            } else {
                $li.find('.for_evry_drop').css('width', $li.closest('.center').outerWidth());
            }

            console.log($li.length);

            $li
                .addClass('active')
                .find('.for_evry_drop').addClass('active')
                .end()
                .find('a').eq(0).addClass('active');
        }

        $black.on('click', function(e) {
            e.preventDefault();

            $('.banner_catalog.header_catalog').removeClass('active');
            $black.addClass('hidden');
        });
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    if ($('.main_slider').length > 0) {
        $('.main_slider').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false,
            adaptiveHeight: true,
            autoplay: true,
            autoplaySpeed: 5000,
        });
    }

    //--------------------------------------------------------------------------------------------------------------------------------------

    //	if ($('.brands_place').length > 0) {
    //		$.ajax(
    //			'/js/components/brands.js',
    //			{
    //				dataType: 'script',
    //				cache: true
    //			}
    //		);
    //	}

    //--------------------------------------------------------------------------------------------------------------------------------------

    var _uri = window.location.href.split('#');

    if (_uri.length > 1) {
        var $an_link = $('[data-uri="' + _uri[1] + '"]');

        if ($an_link.length > 0) {
            var an_type = $an_link.data('box'),
                an_text = $an_link.data('text');

            $an_link.closest('.' + an_type).removeClass('hidden');
            $('html, body').animate({
                scrollTop: $an_link.closest('.' + an_type).offset()['top']
            });

            if ($(document).find('#mm_box').length > 0) {
                $(document).find('#mm_box').remove();
            }

            $('body').append('<div id="mm_box" class="wishes_popup popup"><button type="button" class="popup_close"></button><div class="popup_title">' + get_lang('mm_1') + '</div><div class="popup_subtitle">' + (an_text !== '' ? an_text : get_lang('mm_2')) + '</div></div>');
            $black.removeClass('hidden').one('click', function() {
                $black.addClass('hidden');
            });

            $(document).find('#mm_box').on('click', '.popup_close', function() {
                $(document).find('#mm_box').remove();
                $black.addClass('hidden');
            });

            //$an_link.closest('.form_content').html(an_text === '' ? get_lang('Надіслано') : an_text);
        }
    }

    //--------------------------------------------------------------------------------------------------------------------------------------

    $(document).on('click', '.sale_form_open', function(e) {
        e.preventDefault();
        $(this).closest('.sale_form_box').find('.sale_form').removeClass('hidden');
    });

    $(document).on('click', '.sale_form_close', function(e) {
        e.preventDefault();
        $(this).closest('.sale_form').addClass('hidden');
    });

    $(document).on('click', '.sale_send', function(e) {
        e.preventDefault();

        var $self = $(this),
            $box = $self.closest('.sale_form_box'),
            $name = $box.find('.sale_name'),
            $email = $box.find('.sale_email'),
            $phone = $box.find('.sale_phone'),
            $question = $box.find('.sale_question'),
            def_label = $self.text(),
            uri = $self.data('uri');

        $name.add($phone).add($email).on('keyup paste blur', function() {
            $(this).removeClass('error');
        });

        if (!ruleRegex.test($name.val())) {
            $name.addClass('error');
            return false;
        }

        if ($phone.length > 0 && !ruleRegex.test($phone.val())) {
            $phone.addClass('error');
            return false;
        }

        if ($email.length > 0 && !emailRegex.test($email.val())) {
            $email.addClass('error');
            return false;
        }

        if ($question.length > 0 && $question.val() === '') {
            $question.addClass('error');
            return false;
        }

        $ajax_loader.css('top', $(document).scrollTop() + 50).removeClass('hidden');
        $ajax_loader.add($black).removeClass('hidden');

        var request = {
            name: $name.val(),
            phone: $phone.val(),
            email: $email.length > 0 ? $email.val() : '',
            question: $question.length > 0 ? $question.val() : '',
            question_uri: window.location.href
        };

        $self.find('span').text(get_lang('Відправка'));

        $.post(
            full_url('feedback/sale'),
            request,
            function(response) {
                if (response.success) {
                    $ajax_loader.addClass('hidden');
                    $('body').append('<div class="popup sale_popup">' + response.message + '</div>');

                    var $one_click_popup = $(document).find('.sale_popup');
                    $one_click_popup.css('top', $(document).scrollTop() + 50);

                    $one_click_popup.find('.popup_close').add($black).one('click', function(e) {
                        e.preventDefault();

                        $one_click_popup.remove();
                        $black.addClass('hidden');
                    });
                }

                $self.find('span').text(def_label);

                $name.val('');

                if ($phone.length > 0) {
                    $phone.val('');
                }

                if ($email.length > 0) {
                    $email.val('');
                }

                if ($question.length > 0) {
                    $question.val('');
                }
            },
            'json'
        );

        return true;
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    if (jQuery().raty) {
        $('.raty').raty({
            readOnly: true,
            path: 'js/raty/images',
            score: function() {
                return $(this).attr('data-score');
            },
            number: function() {
                return $(this).attr('data-number');
            }
        });
    }

    //--------------------------------------------------------------------------------------------------------------------------------------

    var $cart = $('#cart');

    $(document)
        .on('click', '.to_cart', function(e) {
            e.preventDefault();

            $(document).find('.zoom_window').addClass('hidden');

            var $link = $(this),
                basket_request = {};

            $ajax_loader.css('top', $(document).scrollTop() + 50).removeClass('hidden');
            $ajax_loader.add($black).removeClass('hidden');

            if ($link.data('basket')) {
                basket_request = $link.data('basket');
            } else {
                basket_request = {
                    'product_id': $link.data('product-id')
                };
            }

            $.post(
                full_url('cart/cart_put'),
                basket_request,
                function(response) {
                    $(document).find('.to_cart').map(function() {
                        if (parseInt($link.data('size-id')) === parseInt($(this).data('size-id')) && ($link.data('size-id') === undefined || parseInt($link.data('size-id')) === parseInt($(this).data('size-id')))) {
                            $(this)
                                .removeClass('to_cart')
                                .addClass('in_cart')
                                .addClass('show_cart_form')
                                .text(get_lang('В кошику'));

                            if ($(this).closest('.simple_box').length === 0 || $(this).hasClass('zoom_buy')) {
                                $(this).text(get_lang('in_cart'));
                            }
                        }
                    });

                    $link
                        .removeClass('to_cart')
                        .addClass('in_cart')
                        .addClass('show_cart_form')
                        .trigger('click');

                    var _current_product;
                    _current_product = get_product_info($link, 'details');

                    gtag('event', 'add_to_cart', {
                        currency: 'UAH',
                        items: [{
                            item_id: _current_product.product_id,
                            item_name: _current_product.title,
                            price: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old : _current_product.screen_price),
                            discount: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old - _current_product.screen_price : 0),
                            item_category: _current_product.menu_name,
                            currency: 'UAH',
                            quantity: _current_product.total,
                        }],
                        value: _current_product.screen_price
                    });

                    mini_cart(response);
                },
                'json'
            );
        })
        .on('click', '.show_cart_form', function(e) {
            e.preventDefault();

            $ajax_loader.css('top', $(document).scrollTop() + 50).removeClass('hidden');
            $ajax_loader.add($black).removeClass('hidden');

            $.post(
                full_url('cart/form'),
                function(response) {
                    $ajax_loader.addClass('hidden');
                    $cart.css('top', $(document).scrollTop() + 50).removeClass('hidden').addClass('active');

                    $black.off('click').one('click', function() {
                        $black.add($cart).addClass('hidden');
                    });

                    if (window.history.replaceState) {
                        window.history.replaceState({}, null, window.location.href.replace('?cart-open', '') + '?cart-open');
                    } else {
                        window.history.pushState('', '', window.location.href.replace('?cart-open', '') + '?cart-open');
                    }

                    $cart.html(response.form).trigger('change_cart');

                    $cart.find('[type="tel"]').inputmask({
                        'mask': '+38 (999) 999-99-99',
                        'onKeyValidation': function() {
                            if ($cart.find('[type="tel"]').inputmask('isComplete')) {
                                $cart.find('[type="tel"]').removeClass('error');
                            }
                        }
                    });
                },
                'json'
            );
        });
    var _current_product_total = 1;
    $cart
        .on('change_cart', function() {
            var total_price = 0,
                discount = 0;

            $(this).find('.added_goods').not('.one_ct_ignore').map(function() {
                var price = $(this).data('price'),
                    prices = $(this).data('prices'),
                    total = parseInt($(this).find('.ct_total').val());

                if (prices) {
                    $.each(prices, function(_limit, _price) {
                        if (total >= _limit) {
                            price = _price;
                        }
                    });
                }

                var row_price = roundPlus(total * price, 0);

                if (row_price > 0) {
                    $(this).find('.total_sum').text(row_price + ' ' + get_lang('грн'));

                    if ($(this).is('.one_ct_kit')) {
                        var $kit = $(this).next(),
                            kit_price = $kit.data('price'),
                            kit_total = total;

                        $kit.find('.total_sum').text(roundPlus(total * kit_price, 0) + ' ' + get_lang('грн'));
                        row_price += (total * kit_price);
                    }
                }

                total_price += row_price;
            });

            $cart.find('.all_sum').find('span').eq(0).text(total_price);

            if (discount > 0) {
                $cart.find('.discount').find('span').eq(0).text(discount);
                $cart.find('.discount').closest('.mw_total').removeClass('hidden');
            } else {
                $cart.find('.discount').closest('.mw_total').addClass('hidden');
            }
        })
        .on('click', '.ct_plus', function(e) {
            e.preventDefault();

            var $product = $(this).closest('.added_goods'),
                $link = $(this),
                total = parseInt($product.find('.ct_total').val()) + 1;
            console.log($product);
            $.post(
                full_url('cart/cart_change'), {
                    product_id: $product.data('product-id'),
                    size_id: $product.data('size-id'),
                    id_key: $product.data('id-key'),
                    total: total
                },
                function(response) {
                    mini_cart(response);
                },
                'json'
            );

            $product.find('.ct_total').val(total);
            $cart.trigger('change_cart');
        })
        .on('click', '.ct_minus', function(e) {
            e.preventDefault();

            var $product = $(this).closest('.added_goods'),
                $link = $(this),
                total = parseInt($product.find('.ct_total').val()) - 1;

            if (total >= 1) {
                $.post(
                    full_url('cart/cart_change'), {
                        product_id: $product.data('product-id'),
                        size_id: $product.data('size-id'),
                        id_key: $product.data('id-key'),
                        total: total
                    },
                    function(response) {

                        var _current_product;
                        _current_product = get_product_info($link, 'cart');

                        gtag('event', 'remove_from_cart', {
                            currency: 'UAH',
                            items: [{
                                item_id: _current_product.product_id,
                                item_name: _current_product.title,
                                price: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old : _current_product.screen_price),
                                discount: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old - _current_product.screen_price : 0),
                                item_category: _current_product.menu_name,
                                currency: 'UAH',
                                quantity: _current_product.total,
                            }],
                            value: _current_product.screen_price
                        });

                        mini_cart(response);
                    },
                    'json'
                );

                $product.find('.ct_total').val(total);
                $cart.trigger('change_cart');
            }
        })
        .on('focus', '.ct_total', function(event) {
            event.preventDefault();
            _current_product_total = $(this).val();
        })
        .on('blur keyup paste', '.ct_total', function(e) {
            e.preventDefault();

            var $product = $(this).closest('.added_goods'),
                $link = $(this),
                total = parseInt($(this).val());

            var _current_product;
            _current_product = get_product_info($link, 'cart');

            if (total >= 1) {
                $.post(
                    full_url('cart/cart_change'), {
                        product_id: $product.data('product-id'),
                        size_id: $product.data('size-id'),
                        id_key: $product.data('id-key'),
                        total: total
                    },
                    function(response) {

                        gtag('event', (_current_product_total > total ? 'remove_from_cart' : 'add_to_cart'), {
                            currency: 'UAH',
                            items: [{
                                item_id: _current_product.product_id,
                                item_name: _current_product.title,
                                price: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old : _current_product.screen_price),
                                discount: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old - _current_product.screen_price : 0),
                                item_category: _current_product.menu_name,
                                currency: 'UAH',
                                quantity: _current_product.total,
                            }],
                            value: _current_product.screen_price
                        });

                        mini_cart(response);
                    },
                    'json'
                );

                $cart.trigger('change_cart');
            }
        })
        .on('click', '.ct_delete', function(e) {
            e.preventDefault();

            var $product = $(this).closest('.added_goods'),
                $link = $(this);

            $cart.addClass('hidden');
            $ajax_loader.css('top', $(document).scrollTop() + 50).removeClass('hidden');

            $.post(
                full_url('cart/delete_item'), {
                    product_id: $product.data('product-id'),
                    size_id: $product.data('size-id'),
                    id_key: $product.data('id-key')
                },
                function(response) {
                    if ($product.is('.one_ct_kit')) {
                        $product.closest('.cart_kit').remove();
                    } else {
                        $product.remove();
                    }

                    if (response[0] !== undefined && parseInt(response[0]) === 0) {
                        $ajax_loader.add($black).addClass('hidden');
                    } else {
                        $ajax_loader.addClass('hidden');
                        $cart.removeClass('hidden');
                    }

                    var _current_product;

                    _current_product = get_product_info($link, 'cart');

                    gtag('event', 'remove_from_cart', {
                        currency: 'UAH',
                        items: [{
                            item_id: _current_product.product_id,
                            item_name: _current_product.title,
                            price: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old : _current_product.screen_price),
                            discount: (_current_product.screen_price_old > 0 ? _current_product.screen_price_old - _current_product.screen_price : 0),
                            item_category: _current_product.menu_name,
                            currency: 'UAH',
                            quantity: _current_product.total,
                        }],
                        value: _current_product.screen_price
                    });

                    mini_cart(response);

                    // ().removeClass('to_cart')
                    // .addClass('in_cart')
                    // .addClass('show_cart_form')
                    // .text(get_lang('В кошику'));
                    $cart.trigger('change_cart');
                },
                'json'
            );

        })
        .on('click', '.close-header_cart', function(e) {
            e.preventDefault();

            $cart.add($black).addClass('hidden');

            if (window.history.replaceState) {
                window.history.replaceState({}, null, window.location.href.replace('?cart-open', ''));
            } else {
                window.history.pushState('', '', window.location.href.replace('?cart-open', ''));
            }
        })
        .on('click', '.btn_order_click', function(e) {
            e.preventDefault();

            if (!$cart.find('[type="tel"]').inputmask('isComplete')) {
                $cart.find('[type="tel"]').addClass('error');
            } else {
                $cart.addClass('hidden');
                $black.off('click');
                $ajax_loader.removeClass('hidden');

                $.ajax({
                        url: full_url('cart/send_one_click_cart'),
                        method: 'post',
                        dataType: 'json',
                        data: {
                            phone: $cart.find('[type="tel"]').val(),
                            url: window.location.href
                        }
                    })
                    .done(function(response) {
                        if (response.hasOwnProperty('success') && response.success) {
                            mini_cart([0, 0]);

                            $('.in_cart').each(function() {
                                $(this).removeClass('in_cart').removeClass('show_cart_form').addClass('to_cart');

                                if ($(this).closest('.simple_box').length === 0) {
                                    $(this).text(get_lang('to_cart'));
                                }
                            });

                            $ajax_loader.addClass('hidden');
                            $('body').append(response.message);

                            var $one_click_popup = $(document).find('.wishes_popup');
                            $one_click_popup.css('top', $(document).scrollTop() + 50);

                            $one_click_popup.find('.popup_close').add($black).one('click', function(e) {
                                e.preventDefault();

                                $one_click_popup.remove();
                                $black.addClass('hidden');
                            });
                        } else {
                            $ajax_loader.addClass('hidden');
                            $(document).trigger('show_error_popup');
                        }
                    })
                    .fail(function(response) {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    });
            }
        });

    $('#mini_cart').on('click', '.mini_cart_delete', function(e) {
        e.preventDefault();

        var product_id = parseInt($(this).data('product-id')),
            size_id = parseInt($(this).data('size-id'));

        $ajax_loader.css('top', $(document).scrollTop() + 50).removeClass('hidden');

        $(this).closest('.mw_one').remove();

        $.post(
            full_url('cart/delete_item'), {
                product_id: product_id,
                size_id: size_id
            },
            function(response) {

                if (response[0] !== undefined && parseInt(response[0]) === 0) {
                    $ajax_loader.add($black).addClass('hidden');
                } else {
                    $ajax_loader.addClass('hidden');
                }

                $('.in_cart').each(function() {
                    if (parseInt($(this).data('product-id')) === product_id && (parseInt($(this).data('size-id')) === size_id || !$(this).data('size-id'))) {
                        $(this).removeClass('in_cart').removeClass('show_cart_form').addClass('to_cart');

                        if ($(this).closest('.simple_box').length === 0) {
                            $(this).text(get_lang('to_cart'));
                        }
                    }
                });

                mini_cart(response);
            },
            'json'
        );

        $cart.trigger('change_cart');
    });

    //--------------------------------------------------------------------------------------------------------------------------------------

    var $articles = $('.article_text').not('.article_wide'),
        read_more, read_less;

    if ($articles.length > 0) {
        if (LANG == 'ua') {
            read_more = 'Читати повністю';
            read_less = 'Згорнути';
        }

        if (LANG == 'ru') {
            read_more = 'Читать полностью';
            read_less = 'Свернуть';
        }

        if (LANG == 'en') {
            read_more = 'Read in full';
            read_less = 'Collapse';
        }

        var short = false;

        $(document).on('mousemove tap swipe', function() {
            if (!short) {
                $articles.map(function() {
                    var $self = $(this),
                        split = $self.data('split') - 1;

                    if (split >= 0) {
                        var $text = $('<div/>').append($(this).html()),
                            $header = $text.find('header').clone(true, true),
                            $ao = $('<div/>', {
                                'class': 'fm article_open'
                            }),
                            $ac = $('<div/>', {
                                'class': 'fm article_close'
                            });

                        for (var i = 0; i < $text.children().length; i++) {
                            if (i <= split) {
                                $ao.append($('<div/>').append($text.children().eq(i).clone()).html());
                            } else {
                                $ac.append($('<div/>').append($text.children().eq(i).clone()).html());
                            }
                        }

                        $(this)
                            .html($ao.clone())
                            .append($ac.clone())
                            .append('<div class="long_div article_btn"><a href="#" class="read_more">' + read_more + '</a></div>');

                        $(this).on('click', '.article_btn a', function(e) {
                            e.preventDefault();

                            if ($(this).hasClass('read_more')) {
                                $(this).text(read_less).removeClass('read_more').addClass('read_less');
                                $(this).closest('.article_text').find('.article_close').show();
                            } else {
                                $(this).text(read_more).removeClass('read_less').addClass('read_more');
                                $(this).closest('.article_text').find('.article_close').hide();
                            }
                        });
                    }
                });

                short = true;
            }
        });
    }

    //-------------------------------------------

    $('.sale_phone')
        .add('#order_phone')
        .add('.click_pay_phone')
        .add('.ask_price_phone')
        .inputmask("+38 (999) 999-99-99");
});

//-----------------------------------------------

$(function() {
    var s_timer;

    $(document).on('click', function(event) {
        if ($(event.target).hasClass('sq') || $(event.target).closest('.sq').length > 0) return false;
        $('.search_variants').removeClass('active').hide();
        return true;
    });

    $('.search_inner').find('[type="text"]').prop('autocomplete', 'off');

    $('.search_inner').on('keyup', '[type="text"]', function(e) {
        if (e.keyCode != 13 && e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40) {
            clearTimeout(s_timer);

            var v = $.trim($(this).val());

            if (v.length >= 1) {
                $('.search_variants').removeClass('active').hide().empty();

                s_timer = setTimeout(function() {
                    $.post(
                        full_url('search/autocomplete'), {
                            query: v
                        },
                        function(response) {
                            if (response.length > 0) {
                                var slist = '';
                                $.each(response, function(i, val) {
                                    slist += '<li><a href="' + val.url + '">' + (val.image !== '' ? '<img src="' + val.image + '" alt="">' : '') + '' + val.title + '</a></li>';
                                });
                                console.log(slist);
                                $('.search_variants').html(slist).show();
                                $('.search_variants').append('<li><a href="' + full_url('search') + '?query=' + v + '" class="all_results">' + get_lang('all_results') + '</a>');
                                $('.search_variants').addClass('active').show();
                            }
                        },
                        'json'
                    );
                }, 200);
            }
        }
    });

    $(document).keydown(function(e) {

        if (e.keyCode == 13) {
            if ($('.search_variants').hasClass('active') && $('.search_variants').find('li.active').length > 0) {
                e.preventDefault();
                window.location.href = $('.search_variants').find('li.active').find('a').attr('href');
            }
        }

        if (e.keyCode == 38) {

            var sv = $('.search_variants').find('li').length,
                si = $('.search_variants').find('li.active').length > 0 ? $('.search_variants').find('li.active').index() - 1 : sv - 1;

            if ($('.search_variants').hasClass('active')) {
                e.preventDefault();

                if (si >= 0) {
                    $('.sq').blur();
                    $('.search_variants').find('li').removeClass('active');
                    $('.search_variants').find('li').eq(si).addClass('active');
                } else {
                    $('.sq').focus();
                    $('.search_variants').find('li').removeClass('active');
                }
            }
        }

        if (e.keyCode == 40) {

            var sv = $('.search_variants').find('li').length,
                si = $('.search_variants').find('li.active').length > 0 ? $('.search_variants').find('li.active').index() + 1 : 0;

            if ($('.search_variants').hasClass('active')) {
                e.preventDefault();

                if (si < sv) {
                    $('.sq').blur();
                    $('.search_variants').find('li').removeClass('active');
                    $('.search_variants').find('li').eq(si).addClass('active');
                } else {
                    $('.sq').focus();
                    $('.search_variants').find('li').removeClass('active');
                }
            }
        }
    });
});

$(function() {
    if ($('#catalog_tabs').find('ul').length > 0) {
        $('#catalog_tabs').find('ul')
            .on('click', 'a', function(e) {
                e.preventDefault();

                $(this).closest('ul').find('a').map(function() {
                    $(this).removeClass('active');
                    $($(this).attr('href')).addClass('hidden');
                });

                $(this).addClass('active');
                $($(this).attr('href')).removeClass('hidden');

                if ($($(this).attr('href')).find('.one_good').length < 5) {
                    $(this).closest('div').find('.show_all').attr('href', full_url('catalog/showcase/' + $(this).attr('href').replace('#catalog_', ''))).removeClass('hidden');
                } else {
                    $(this).closest('div').find('.show_all').addClass('hidden');
                }
            })
            .find('a').eq(0).trigger('click');
    }
});

$(function() {
    var $wish_icon = $('.user_panel').find('.wishes');

    $(document)
        .on('click', '#wish_list_icon', function(e) {
            e.preventDefault();

            var total = parseInt($wish_icon.find('span').eq(0).text());

            if (total > 0) {
                document.location.href = full_url('catalog/wish_list');
            }
        })
        .on('counter', function() {
            var total = parseInt($wish_icon.find('span').eq(0).text());

            if (total > 0) {
                $wish_icon.find('span').eq(0).removeClass('hidden');
                $wish_icon.find('.mc_empty_box').addClass('hidden');
            } else {
                $wish_icon.find('span').eq(0).addClass('hidden');
                $wish_icon.find('.mc_empty_box').removeClass('hidden');
            }
        })
        .trigger('counter');

    $(document)
        .on('click', '.to_wish_list', function(e) {
            e.preventDefault();

            var $self = $(this);

            if ($self.hasClass('active')) {
                window.location.href = full_url('catalog/wish_list');
            } else {
                $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

                $.ajax({
                        url: full_url('catalog/wish_list_add'),
                        method: 'post',
                        dataType: 'json',
                        data: {
                            product_id: $self.data('product-id')
                        }
                    })
                    .done(function(response) {
                        if (response.hasOwnProperty('success') && response.success) {
                            pintrk('track', 'Custom', {
                                event_id: 'add_to_wishlist',
                                // property: ($self.siblings('.item_title').length >0? $self.siblings('.item_title').text():$self.siblings('.main_title').text())
                            });

                            $self.addClass('in_wish_list').attr('href', full_url('catalog/wish_list')).removeClass('to_wish_list').html(`<svg class="icon"><use xlink:href="${base_url('images/sprite.svg')}#heart"></use></svg>`);
                        } else {
                            $ajax_loader.addClass('hidden');
                            $(document).trigger('show_error_popup');
                        }
                    })
                    .fail(function(response) {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    });
            }
        })
        .on('click', '.remove_wish_list', function(e) {
            e.preventDefault();

            var $self = $(this);

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $.ajax({
                    url: full_url('catalog/wish_list_remove'),
                    method: 'post',
                    dataType: 'json',
                    data: {
                        product_id: $self.data('product-id')
                    }
                })
                .done(function(response) {
                    if (response.hasOwnProperty('success') && response.success) {
                        $self.closest('figure').remove();

                        if (response['total'] > 0) {
                            $wish_icon.find('span').eq(0).text(response['total']);
                            $wish_icon.trigger('counter');

                            $ajax_loader.add($black).addClass('hidden');
                        } else {
                            window.location.reload(true);
                        }
                    } else {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    }
                })
                .fail(function(response) {
                    $ajax_loader.addClass('hidden');
                    $(document).trigger('show_error_popup');
                });
        })
        .on('click', '.remove_selected_wishes', function(e) {
            e.preventDefault();

            if ($('.favorite_grid').find('[name="remove_wish"]:checked').length == 0) {
                return false;
            }

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $('.favorite_grid').find('[name="remove_wish"]:checked').each(function(index, el) {
                var $self = $(this);
                $.ajax({
                        url: full_url('catalog/wish_list_remove'),
                        method: 'post',
                        dataType: 'json',
                        data: {
                            product_id: $self.val()
                        }
                    })
                    .done(function(response) {
                        if (response.hasOwnProperty('success') && response.success) {
                            $('[data-id="' + $self.val() + '"]').remove();

                            if (response['total'] > 0) {
                                $wish_icon.find('span').eq(0).text(response['total']);
                                $wish_icon.trigger('counter');

                                $ajax_loader.add($black).addClass('hidden');
                            } else {
                                window.location.reload(true);
                            }
                        } else {
                            $ajax_loader.addClass('hidden');
                            $(document).trigger('show_error_popup');
                        }
                    })
                    .fail(function(response) {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    });
            });

        })
        .on('click', '.clear_wishlist', function(e) {
            e.preventDefault();

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $.ajax({
                    url: full_url('catalog/wish_list_clear'),
                    method: 'post',
                    dataType: 'json'
                })
                .done(function(response) {
                    if (response.hasOwnProperty('success') && response.success) {
                        window.location.reload(true);
                    } else {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    }
                })
                .fail(function(response) {
                    $ajax_loader.addClass('hidden');
                    $(document).trigger('show_error_popup');
                });
        });

    $('[name="delete_all"]').on('click', function(event) {
        if ($(this).prop('checked')) {
            console.log('checked');
            $('[name="remove_wish"]').prop('checked', true);
        } else {
            $('[name="remove_wish"]').prop('checked', false);
        }
    });
});

$(function() {

    if ((/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        $('body').addClass('mobile');
    }

    var $compare_icon = $('.user_panel').find('.compares');

    $(document)
        .on('click', '#compare_list_icon', function(e) {
            e.preventDefault();

            var total = parseInt($compare_icon.find('span').eq(0).text());

            if (total > 0) {
                window.location.href = full_url('catalog/compare_list');
            }
        })
        .on('counter', function() {
            var total = parseInt($compare_icon.find('span').eq(0).text());

            if (total > 0) {
                $compare_icon.find('span').eq(0).removeClass('hidden');
                $compare_icon.find('.mc_empty_box').addClass('hidden');
                $compare_icon.find('.header_icon_drop').removeClass('hidden');
            } else {
                $compare_icon.find('span').eq(0).addClass('hidden');
                $compare_icon.find('.header_icon_drop').addClass('hidden');
                $compare_icon.find('.mc_empty_box').removeClass('hidden');
            }
        })
        .trigger('counter');

    $(document)
        .on('click', '.to_compare_list', function(e) {
            e.preventDefault();

            var $self = $(this);

            if ($self.hasClass('active')) {
                window.location.href = full_url('catalog/compare_list');
            } else {
                $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

                $.ajax({
                        url: full_url('catalog/compare_list_add'),
                        method: 'post',
                        dataType: 'json',
                        data: {
                            product_id: $self.data('product-id')
                        }
                    })
                    .done(function(response) {
                        if (response.hasOwnProperty('success') && response.success) {
                            if ($self.closest('.one_good').length > 0) {
                                $self.addClass('active');
                            } else {
                                $self.addClass('active');
                            }

                            var categories = '';

                            $.each(response.compare_categories, function(i, v) {
                                categories += '<li><a href="' + full_url('catalog/compare_list') + '?category=' + i + '">' + v.name + ' (' + v.products + ')</a><i class="remove_compare_category" data-category="' + i + '"></i></li>';
                            });

                            $compare_icon.find('.header_icon_drop').html(categories);

                            $compare_icon.find('span').eq(0).text(response['total']);
                            $compare_icon.trigger('counter');

                            $ajax_loader.addClass('hidden');
                            $('body').append(response.message);

                            var $compare_popup = $(document).find('.wishes_popup');
                            $compare_popup.css('top', $(document).scrollTop() + 50);

                            $compare_popup.find('.popup_close').add($black).one('click', function(e) {
                                e.preventDefault();

                                $compare_popup.remove();
                                $black.addClass('hidden');
                            });
                            $('.user_dropdown').find('#compare_list_icon').find('.header_icon_count').text(response.total);
                        } else {
                            $ajax_loader.addClass('hidden');
                            $(document).trigger('show_error_popup');
                        }
                    })
                    .fail(function(response) {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    });
            }
        })
        .on('click', '.remove_selected_compare', function(e) {
            e.preventDefault();

            if ($('.favorite_grid').find('[name="remove_wish"]:checked').length == 0) {
                return false;
            }

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $('.favorite_grid').find('[name="remove_wish"]:checked').each(function(index, el) {
                var $self = $(this);
                $.ajax({
                        url: full_url('catalog/compare_remove_list'),
                        method: 'post',
                        dataType: 'json',
                        data: {
                            product_id: $self.val()
                        }
                    })
                    .done(function(response) {
                        if (response.hasOwnProperty('success') && response.success) {
                            $('[data-id="' + $self.val() + '"]').remove();

                            if (response['total'] > 0) {
                                $compare_icon.find('span').eq(0).text(response['total']);
                                $compare_icon.trigger('counter');

                                $ajax_loader.add($black).addClass('hidden');
                            } else {
                                window.location.reload(true);
                            }
                        } else {
                            $ajax_loader.addClass('hidden');
                            $(document).trigger('show_error_popup');
                        }
                    })
                    .fail(function(response) {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    });
            });

        })
        .on('click', '.remove_compare_category', function(e) {
            e.preventDefault();

            var $self = $(this);

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $.ajax({
                    url: full_url('catalog/compare_remove_category'),
                    method: 'post',
                    dataType: 'json',
                    data: {
                        category: $self.data('category')
                    }
                })
                .done(function(response) {
                    if (response.hasOwnProperty('success') && response.success) {
                        if ($self.hasClass('clear_list_btn')) {
                            window.location.href = full_url('catalog/compare_list');
                        } else {
                            $self.closest('li').remove();

                            if (response['total'] > 0) {
                                $compare_icon.find('span').eq(0).text(response['total']);
                                $compare_icon.trigger('counter');

                                $ajax_loader.add($black).addClass('hidden');
                            } else {
                                window.location.reload(true);
                            }
                        }
                    } else {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    }
                })
                .fail(function(response) {
                    $ajax_loader.addClass('hidden');
                    $(document).trigger('show_error_popup');
                });
        })
        .on('click', '.remove_compare_list', function(e) {
            e.preventDefault();

            var $self = $(this);

            $ajax_loader.css('top', $(document).scrollTop() + 50).add($black).removeClass('hidden');

            $.ajax({
                    url: full_url('catalog/compare_remove_list'),
                    method: 'post',
                    dataType: 'json',
                    data: {
                        product_id: $self.data('product-id')
                    }
                })
                .done(function(response) {
                    if (response.hasOwnProperty('success') && response.success) {
                        if ($self.closest('.compares_box').find('.one_good').length === 1) {
                            window.location.reload(true);
                        } else {
                            $self.closest('.one_good').remove();

                            var categories = '';

                            $.each(response.compare_categories, function(i, v) {
                                categories += '<li><a href="' + full_url('catalog/compare_list') + '?category=' + i + '">' + v.name + ' [' + v.products + ']</a><i class="remove_compare_category" data-category="' + i + '"></i></li>';
                            });

                            $compare_icon.find('.header_icon_drop').html(categories);

                            $compare_icon.find('span').eq(0).text(response['total']);
                            $compare_icon.trigger('counter');

                            $ajax_loader.add($black).addClass('hidden');
                        }
                        $('.user_dropdown').find('#compare_list_icon').find('.header_icon_count').text(response.total);
                        window.location.reload(true);
                    } else {
                        $ajax_loader.addClass('hidden');
                        $(document).trigger('show_error_popup');
                    }
                })
                .fail(function(response) {
                    $ajax_loader.addClass('hidden');
                    $(document).trigger('show_error_popup');
                });
        });
});

$(function() {
    $('.one_good').map(function() {
        if ($(this).find('.og_small_photos').length > 0) {
            var $self = $(this);

            $self.find('.og_small_photos').on('click mouseenter', 'a', function(e) {
                e.preventDefault();

                $self.find('.og_photo').find('img').attr('src', $(this).find('img').attr('src'));
            });
        }
    });

    $(window)
        .on('resize', function() {
            if ($(window).width() <= 479) {
                $('.bottom_menu').find('.foo_col').find('ul').addClass('hidden');
                $('.bottom_menu').find('.foo_payment').find('ul').addClass('hidden');
            } else {
                $('.bottom_menu').find('.foo_col').find('ul').removeClass('hidden');
                $('.bottom_menu').find('.foo_payment').find('ul').removeClass('hidden');
            }
        })
        .trigger('resize');

    $('.bottom_menu').find('.fc_title').on('click', function() {
        if ($(window).width() <= 479) {
            $(this).closest('.foo_col').find('ul').toggleClass('hidden');
            $(this).closest('.foo_payment').find('ul').toggleClass('hidden');
        }
    });

    var dst = $(document).scrollTop(),
        pdst = dst;

    $(document)
        .on('scroll', function(e) {
            dst = $(document).scrollTop();

            if (dst > 75) {
                $('.main_part_wrap').addClass('fixed');

                if (dst > pdst) {
                    $('.main_part_wrap').find('.mob-controls').addClass('hidden');
                } else {
                    $('.main_part_wrap').find('.mob-controls').removeClass('hidden');
                }
            } else {
                $('.main_part_wrap').removeClass('fixed').find('.mob-controls').removeClass('hidden');
            }

            pdst = dst;
        })
        .on('replace_txt', function() {
            $('.wish_txt').map(function() {
                if ($(this).closest('button').hasClass('active')) {
                    $(this).replaceWith('<i></i>' + get_lang('in_wishes'));
                } else {
                    $(this).replaceWith('<i></i>' + get_lang('to_wishes'));
                }

                $(this).removeClass('.wish_txt');
            });

            $('.compare_txt').map(function() {
                if ($(this).closest('button').hasClass('active')) {
                    $(this).replaceWith('<i></i>' + get_lang('in_compare'));
                } else {
                    $(this).replaceWith('<i></i>' + get_lang('to_compare'));
                }

                $(this).removeClass('.compare_txt');
            });

            $('.in_stock_txt').text(get_lang('in_stock')).removeClass('in_stock_txt');
            $('.uah_txt').replaceWith(get_lang('uah'));
            $('.to_cart_txt').text(get_lang('to_cart')).removeClass('to_cart_txt');
            $('.in_cart_txt').text(get_lang('in_cart')).removeClass('in_cart_txt');
            $('.gift_txt').text(get_lang('gift')).removeClass('gift_txt');
            $('.free_txt').text(get_lang('free')).removeClass('free_txt');
            $('.promo_txt').text(get_lang('status_promo')).removeClass('promo_txt');
            $('.new_txt').text(get_lang('status_new')).removeClass('new_txt');
            $('.discount_txt').text(get_lang('status_discount')).removeClass('discount_txt');
            $('.hit_txt').text(get_lang('status_hit')).removeClass('hit_txt');
            $('.recommended_txt').text(get_lang('status_recommended')).removeClass('recommended_txt');

            var ww = $(window).width();

            $('.reviews_txt').map(function() {
                if (ww > 480) {
                    $(this).text(get_lang('reviews') + ': ' + $(this).data('comments')).removeClass('.reviews_txt');
                } else {
                    $(this).text('(' + $(this).data('comments') + ')').removeClass('.reviews_txt').addClass('og_reviews_mob');
                    $(this).closest('div').find('.og_stars').addClass('og_stars_mob');
                }
            });

            $('.no_reviews_txt').map(function() {
                if (ww > 480) {
                    $(this).text(get_lang('no_reviews')).removeClass('no_reviews_txt');
                } else {
                    $(this).text('(0)').removeClass('.reviews_txt').addClass('og_reviews_mob');
                    $(this).closest('div').find('.og_stars').addClass('og_stars_mob');
                }
            });

            var products = [];

            $('.hover_product').map(function() {
                products.push($(this).data('product-id'));
                $(this).removeClass('.hover_product');
            });

            $.post(
                full_url('catalog/get_hover_info'), {
                    products: products
                },
                function(response) {
                    if (response.products) {

                        $.each(response.products, function(product_id, data) {
                            var filters = '',
                                images = '';

                            $.each(data['filters'], function(filter_id, filter_data) {
                                filters += '<b>' + filter_data['filter_name'] + ':</b> ' + filter_data.childs.join(', ') + ' ';
                            });

                            if (data['images'].length > 1) {
                                $.each(data['images'], function(i, image_data) {
                                    images += '<a href="#"><img src="' + data.dir + '/' + image_data.image + '" class="' + (i === 0 ? ' active' : '') + '" alt=""></a>';
                                });
                            }

                            $('.product_' + product_id)
                                .find('.og_desc').html(filters)
                                .end()
                                .find('.og_small_photos').html(images);

                            if (filters !== '') {
                                $('.product_' + product_id).addClass('has_filters');
                            }

                            if (images !== '') {
                                $('.product_' + product_id).addClass('has_images');
                            }
                        });

                        $('.lazy').Lazy();
                    }
                },
                'json'
            );
        })
        .one('mousemove tap swipe', function() {
            $(document).trigger('replace_txt');
        })
        .trigger('scroll');
});

$(function() {
    var yplayers = {};

    $('[data-video]').on('click', function() {
        var video_id = $(this).data('video'),
            id = Math.random();

        if (!yplayers[id]) {
            $(this).replaceWith('<div id="video_iframe_' + id + '" class="product_video"></div>');

            if (Object.keys(yplayers).length === 0) {
                $.getScript(
                    'https://www.youtube.com/iframe_api',
                    function() {
                        window.onYouTubeIframeAPIReady = function() {
                            yplayers[id] = new window.YT.Player('video_iframe_' + id, {
                                videoId: video_id,
                                playerVars: {
                                    autoplay: 1,
                                    modestbranding: 1,
                                    rel: 0
                                }
                            });

                            $('#product_tabs').on('click', 'a', function(e) {
                                e.preventDefault();

                                yplayers[id].stopVideo();
                            });
                        }
                    }
                );
            } else {
                yplayers[id] = new window.YT.Player('video_iframe_' + id, {
                    videoId: video_id,
                    playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0
                    }
                });

                $('#product_tabs').on('click', 'a', function(e) {
                    e.preventDefault();

                    yplayers[id].stopVideo();
                });
            }
        }
    });
});

$(function() {
    var wh = $(window).height(),
        ds = $(document).scrollTop();

    $('[data-component-load]').map(function() {
        var $component = $(this);

        $component.on('load_component', function() {
            $component.off('load_component');

            $.post(
                full_url('components/load_component'), {
                    component_id: $component.data('component-load')
                },
                function(response) {
                    if (response.hasOwnProperty('component')) {
                        $component.replaceWith(response.component);

                        $(document).trigger('products_slider_component');

                        $('.raty').raty({
                            readOnly: true,
                            path: 'js/raty/images',
                            score: function() {
                                return $(this).attr('data-score');
                            },
                            number: function() {
                                return $(this).attr('data-number');
                            }
                        });

                        $('[type="tel"]').inputmask('+38 (999) 999-99-99');
                    } else {
                        $component.remove();
                    }
                },
                'json'
            );
        });

        if (wh + ds - 100 >= $component.offset()['top']) {
            $component.trigger('load_component');
        } else {
            $(window).on('scroll resize', function() {
                wh = $(window).height(),
                    ds = $(document).scrollTop();

                if (wh + ds - 100 >= $component.offset()['top']) {
                    $component.trigger('load_component');
                }
            });
        }
    });

    $(".btn_feedback").on("click", function(e) {
        e.stopPropagation(),

            $(".feedback_dropdown").toggleClass("hidden"),
            $(".btn_feedback").toggleClass("active")
    });

});

// $(".general_menu").on("click", function(e) {
// 	e.stopPropagation();
// 	e.preventDefault();

// 	var $btn = $(this), $mob = $('.mob-mmenu');
// 	$btn.add($mob).addClass('active');

// 	$black.removeClass('hidden').one('click', function () {
// 		$btn.add($mob).removeClass('active');
// 		$black.addClass('hidden');
// 	});
// });

$(".btn_menu").click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    $("body").addClass("body_overflow");
    $(".menu_header").addClass("active")
    $black.removeClass('hidden').one('click', function() {
        $(".menu_header").removeClass('active');
        $black.addClass('hidden');
        $("body").removeClass("body_overflow");
    });
})


$(".mob-main-menu-contacts").on("click", function(e) {
    // e.stopPropagation();
    e.preventDefault();

    $(this).siblings('.popup_contacts').addClass('popup_contacts_active');
    $(this).closest('.mob_mmenu').removeClass('active');

});

$(".menu_header .close_menu").click(function(e) {
    e.preventDefault();

    $("body").removeClass("body_overflow");
    $black.addClass("hidden");
    $(".menu_header").removeClass("active")
})

$('#search_form').on('submit', function(event) {
    if ($(this).find('input').val() == '') {
        event.preventDefault();
        return false;
    }
});

$('.search_btn').on('click', function(event) {
    event.preventDefault();

    if ($(this).siblings('input').val() != '') $('#search_form').submit();
});

$(document).on("click", '.toggle_menu, .mob-menu-close', function(e) {
    $(this).closest('#user_menu').find('.user_dropdown').toggleClass('user_dropdown_active');
    $('.black').removeClass('hidden');
});


$(function() {
    $(".product_inner").slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: true,
        infinite: false,
        mobileFirst: true,
        responsive: [{
            breakpoint: 640,
            settings: {
                slidesToShow: 3,
            }
        }, {
            breakpoint: 992,
            settings: {
                slidesToShow: 4,
            }
        }, {
            breakpoint: 1200,
            settings: {
                slidesToShow: 5,
            }
        }, {
            breakpoint: 1550,
            settings: {
                slidesToShow: 6,
            }
        }]
    })
})

$(function() {
    if (window.innerWidth < 992) {
        $('.footer_menu-titile').on('click', function(e) {
            e.preventDefault();
            $(this).next('.whap_hidden').toggleClass('active')
        })
    }

    $('.btn_user-menu').on('click', function(e) {
        e.preventDefault();

        $('.profile_menu').toggleClass('active');
    });
})

$(function() {

    $('.open_lang').on('click', function() {
        $(this).parent('.toggle_lang').toggleClass('active');
    })

    $('.filters_list').find('.toggle_btn').on('click', function(e) {
        e.preventDefault();

        if ($(this).parent().hasClass('active')) {
            $(this).parent().removeClass('active');
        } else {
            $('.filter_item').removeClass('active');
            $(this).parent().addClass('active');
        }

        // if ($('#' + $(this).attr('data-name')).hasClass('opened')){
        //     $('.filters_list').children('.toggle_btn').removeClass('active');
        //     $('#' + $(this).attr('data-name')).removeClass('opened')
        // } else {
        //     $('.toggle_inner').removeClass('opened');
        //     $('.filters_list').children('.toggle_btn').removeClass('active');
        //     $(this).addClass('active');
        //     $('#' + $(this).attr('data-name')).addClass('opened');
        // }
    })

    $dark = $('.shadow');
    // $dark.on('click', function() {
    //     $(this).addClass('hidden')
    // })

    $('.open_menu').on('click', function(e) {
        e.preventDefault();
        $('.site_header ').toggleClass('opened');
        let $toggleName = $('.open_menu').children('span').text();
        $('.open_menu').children('span').text($('.open_menu').attr('data-close'));
        $('.open_menu').attr('data-close', $toggleName);
        $('body').toggleClass('body_overflow');
    })

    let $moveDown = 0;
    let $prevPosiiton = 0;

    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 75 && $prevPosiiton < $(window).scrollTop()) {
            $('.site_header').addClass('header_hidden');
            $('.details_info').addClass('header_show');
        } else {
            $('.site_header').removeClass('header_hidden');
            $('.details_info').removeClass('header_show');
        }

        $prevPosiiton = $(window).scrollTop()

    })

    $dark.on('click', function() {
        $('.site_header ').toggleClass('opened');
        let $toggleName = $('.open_menu').children('span').text();
        $('.open_menu').children('span').text($('.open_menu').attr('data-close'));
        $('.open_menu').attr('data-close', $toggleName);
        $(this).addClass('hidden')
    })

    $('.open_info').on('click', function(e) {
        e.preventDefault();

        $(this).closest('.privacy_item').toggleClass('active')
    })

    $('.details_slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        mobileFirst: true,
        responsive: [{
                breakpoint: 767,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 1279,
                settings: "unslick"
            }
        ]
    });

    $('.main_banner').each(function(index, element) {
        if ($(element).find('picture').length > 1) {
            $(element).find('.big_slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                fade: true,
                autoplay: true,
                autoplaySpeed: 6000,
                asNavFor: $(element).find('.mini_slider'),
            });
            $(element).find('.mini_slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                adaptiveHeight: true,
                arrows: true,
                nextArrow: $(element).find('.arrow_right'),
                prevArrow: $(element).find('.arrow_left'),
                asNavFor: $(element).find('.big_slider'),
            })
            $(element).find('.mini_slider').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                event.preventDefault();

                currentSlide = currentSlide + 1;
                nextSlide = nextSlide + 1;

                let total = $(this).closest('.mini_slider-wrap').data('total'),
                    next = ((nextSlide + 1) > total ? 1 : nextSlide + 1),
                    prev = ((nextSlide - 1) == 0 ? total : nextSlide - 1);

                if (total >= next) {
                    $(this).siblings('.mini_slider-arrows').find('.arrow_right').find('span').text((next > 9 ? '' : '0') + next);
                } else {
                    console.log('val');
                    $(this).siblings('.mini_slider-arrows').find('.arrow_right').find('span').text('01');
                }
                if (prev >= 1) {
                    $(this).siblings('.mini_slider-arrows').find('.arrow_left').find('span').text((prev > 9 ? '' : '0') + prev);
                } else {
                    $(this).siblings('.mini_slider-arrows').find('.arrow_left').find('span').text((total > 9 ? '' : '0') + total);
                }

            });
        }
    })

    $('.blog_slider').each(function(index, element) {
        if ($(element).find('.text_blog').length > 1) {
            $(element).find('.text_blog-wrap').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                nextArrow: $(element).find('.arrow_right'),
                prevArrow: $(element).find('.arrow_left'),
                asNavFor: $(element).find('.photo_blog-wrap'),
            })
            $(element).find('.photo_blog-wrap').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                fade: true,
                asNavFor: $(element).find('.text_blog-wrap')
            });
            $(element).find('.text_blog-wrap').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                event.preventDefault();

                currentSlide = currentSlide + 1;
                nextSlide = nextSlide + 1;

                let total = $(this).closest('.blog_slider').data('total'),
                    next = ((nextSlide + 1) > total ? 1 : nextSlide + 1),
                    prev = ((nextSlide - 1) == 0 ? total : nextSlide - 1);

                if (total >= next) {
                    $(this).siblings('.blog_slider-arrows').find('.arrow_right').find('span').text((next > 9 ? '' : '0') + next);
                } else {
                    console.log('val');
                    $(this).siblings('.blog_slider-arrows').find('.arrow_right').find('span').text('01');
                }
                if (prev >= 1) {
                    $(this).siblings('.blog_slider-arrows').find('.arrow_left').find('span').text((prev > 9 ? '' : '0') + prev);
                } else {
                    $(this).siblings('.blog_slider-arrows').find('.arrow_left').find('span').text((total > 9 ? '' : '0') + total);
                }

            });
        }
    })

    $('.goods_slider').each(function(index, element) {
        $($(element).find('.goods_inner')).slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            nextArrow: $(element).find('.arrow_right'),
            prevArrow: $(element).find('.arrow_left'),
            mobileFirst: true,
            responsive: [{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 1279,
                    settings: {
                        slidesToShow: 3,
                    }
                }
            ]
        })
        $(element).find('.goods_inner').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            event.preventDefault();

            currentSlide = currentSlide + 1;
            nextSlide = nextSlide + 1;

            let total = $(this).data('total'),
                next = ((nextSlide + 1) > total ? 1 : nextSlide + 1),
                prev = ((nextSlide - 1) == 0 ? total : nextSlide - 1);
            console.log(total);
            if (total >= next) {
                $(this).siblings('.goods_control').find('.arrow_right').find('span').text((next > 9 ? '' : '0') + next);
            } else {
                console.log('val');
                $(this).siblings('.goods_control').find('.arrow_right').find('span').text('01');
            }
            if (prev >= 1) {
                $(this).siblings('.goods_control').find('.arrow_left').find('span').text((prev > 9 ? '' : '0') + prev);
            } else {
                $(this).siblings('.goods_control').find('.arrow_left').find('span').text((total > 9 ? '' : '0') + total);
            }

        });
        console.log($(element).find('.arrow_right'))
    })

    $('.big_slider img').addClass('slider_anim');

    $('.order_delivery').dropdown()

    // АНІМАЦІЯ
    if (!IS_ADMIN) {

        gsap.registerPlugin(ScrollTrigger);

        $('.photo_anim').each(function(index, element) {
            gsap.to(element, {
                scale: 1,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 100%',
                    end: 'center 50%',
                    scrub: true,
                },
            })
        });

        $('.show_top').each(function(index, element) {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 75%',
                    onEnter: () => $(element).addClass('anim_finish'),
                },
            })
        });

        $('.blog_slider').each(function(index, element) {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 50%',
                    onEnter: () => $(element).addClass('blog_slider-anim'),
                },
            })
        });

        $('.three_photo').each(function(index, element) {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element,
                    onEnter: () => $(element).addClass('three_photo-anim'),
                },
            })
        });

        // $('.element').each(function(index, element) {
        //     gsap.to(element, {
        //         // x: 200,
        //         // duration: 1,
        //         scrollTrigger: {
        //             toggleActions: "restart none none none",
        //             trigger: element,
        //             start: 'top 100%',
        //             end: 'bottom 80%',
        //             scrub: true,
        //             toggleClass: 'show',
        //             onEnter: () => $(element).addClass('tester'),
        //             markers: false,
        //         },
        //     })
        // });
    }

    // $('.link_item').on('mouseover', function () {
    //     let $this = $(this);
    //     if (!$(this).hasClass('anim_item')) {
    //         $(this).addClass('anim_item')
    //         setTimeout(function() {
    //             $this.removeClass('anim_item')
    //         },1000)
    //     }
    // });


    $('.header_search').on('click', function(event) {
        event.preventDefault();
        $('.search').toggleClass('active');
        $('body').toggleClass('body_overflow');
    });

    $('.footer_subscribe').find('form')
        .on('keypress', 'input', function(event) {
            console.log('val');
            $(this).removeClass('error');
            $(this).siblings('.error_text').remove();
        })
        .on('click', '[type="submit"]', function(event) {
            event.preventDefault();

            let $self = $(this),
                validate = true,
                $email = $(this).siblings('input');

            $(this).closest('.footer_subscribe').find('.error_text').remove();

            if ($email.length > 0 && ($.trim($email.val()) === '' || !emailRegex.test($email.val()))) {
                validate = false;
                $email.addClass('error');
                $('<span class="error_text">' + get_lang('email_error_text') + '</span>').insertAfter($email);
            }

            if (validate) {
                $self.html(get_lang('sending') + '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#btn_arrow"></use></svg>');

                $.post('ajax/save_subscribe/', {
                    email: $email.val()
                }, function(xhr) {
                    if (xhr.success) {
                        $email.val('');
                        setTimeout(function() {
                            $self.html(get_lang('sent') + '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#btn_arrow"></use></svg>');
                        }, 1500)
                        setTimeout(function() {
                            $self.html(get_lang('submit') + '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#btn_arrow"></use></svg>');
                        }, 2500)
                    } else {
                        if (xhr.error == 'email_exists') {
                            $('<span class="error_text">' + get_lang('email_exists_error_text') + '</span>').insertAfter($email);
                            $self.html(get_lang('submit') + '<svg class="icon"><use xlink:href="' + base_url('images/sprite.svg') + '#btn_arrow"></use></svg>');
                        }
                    }
                }, 'json');
            }
        });

    // let imageColumn = 0,
    // 	imageRow = 1,
    // 	$start_row = 0,
    // 	$end_row = 0;
    // $('.catalog_list figure').each(function (index, element) {
    // 	if (imageColumn == 2) {

    // 	}
    // 	console.log(imageColumn);
    // 	if($(element).hasClass('large_image')) {

    // 		$start_row =($(element).prevAll('.large_image').length > 0 && $end_row > imageRow? imageRow + $(element).prevAll('.large_image').length + imageColumn: imageRow);
    // 		if ($start_row <= $end_row) $start_row = $end_row;
    // 		$end_row = $start_row + 2;

    // 		console.log(imageRow, imageColumn);
    // 		if(imageColumn == 2) {
    // 			$(element).css('grid-column', 2 + '/' + 4).css('grid-row', $start_row + '/' + $end_row)
    // 		} else  {
    // 			$(element).css('grid-column', (imageColumn+1) + '/' + (imageColumn + 3)).css('grid-row', $start_row + '/' + $end_row)
    // 		}
    // 	}
    // 	if (imageColumn == 2) {
    // 		imageRow ++;
    // 	}
    // 	imageColumn++;
    // 	if (imageColumn == 3) {
    // 		imageColumn = 0;
    // 	}

    // })
    // 

    setTimeout(function() {
        $('.cookie').slideDown(400);
    }, 3000)

    $('.cookie').on('click', '.cookie_agree', function(event) {
        event.preventDefault();

        setcookie('cookie_approval', '1', (60000 * 60 * 24 * 356), '/');

        $(this).closest('.cookie').slideUp(400);
    }).on('click', '.cookie_close', function(event) {
        event.preventDefault();

        $(this).closest('.cookie').slideUp(400);
    });

    $('.details_slider').on('click', 'a', function(event) {
        event.preventDefault();

        let href = $(this).attr('href');

        window.open(href, '_blank', 'Pin photo');
    });


})
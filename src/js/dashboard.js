'use strict';
// Check libs
if (typeof jQuery === 'undefined') {
    throw new Error('JavaScript requires jQuery')
}

(function ($) {
    var updateDelay = 20000,
        dashboardurl = 'api/dashboard.json',
        proxyurl = '/cors-proxy/';

    // Load templates
    $.get('template/categories.html', null, function (categories) {
        $.template('categories', categories);
    });
    $.get('template/groups.html', null, function (groups) {
        $.template('groups', groups);
    });

    // Denormalization data
    var denormalization = function (data) {
        var groups = {};
        data.categories.forEach(function (category) {
            if (category.visible == undefined) {
                category.visible = true;
            }
            category.items.forEach(function (item) {
                item.category = category.name;
                if (!Array.isArray(item.group)) {
                    item.group = [item.group == undefined ? 'Undefined' : item.group];
                }
                item.group.forEach(function (group) {
                    var groupObject = groups[group];
                    if (groupObject == undefined) {
                        groupObject = {
                            name: group,
                            items: []
                        };
                        groups[group] = groupObject;
                    }
                    groupObject.items.push(item);
                });
            });
        });
        data.groups = [];
        for (var id in groups) {
            data.groups.push(groups[id]);
        }
        return data;
    };

    // Build views
    var buildCategories = function (data) {
        $.tmpl('categories', data).appendTo('#categories');
    };

    var buildGroups = function (data) {
        $.tmpl('groups', data).appendTo('#categories');
    };

    // Local cache
    var data;

    var onRedrow = function () {
        $('#categories').empty();

        if (location.hash == '#group') {
            buildGroups(data);
        } else {
            buildCategories(data);
        }

        $('.bloc').each(function () {
            var top = $(this);
            top.find('.panel-title').each(function () {
                var isVisible = $.parseJSON(top.attr('visible'));
                if (!isVisible) {
                    top.children('.panel-body').toggle('slow');
                } else {
                    top.find('.panel-title-continue').toggle(0);
                }
            }).on('click', function () {
                top.children('.panel-body').toggle('slow');
                top.find('.panel-title-continue').toggle(0);
            });
        });
        $('span.glyphicon').tooltip();

        setTimeout(checkStatus, 100);
    };

    var checkItemStatus = function (top) {
        var url = top.getAttribute('url');
        $(top).addClass('glyphicon-repeat icon-refresh-animate');
        $(top).attr('data-original-title', 'Loading...');
        $.ajax({
            url: proxyurl + url,
            type: 'HEAD',
            cache: false
        }).done(function () {
            $(top).removeClass('icon-refresh-animate');
            $(top).removeClass('glyphicon-repeat');
            $(top).addClass('glyphicon-ok');
            $(top).attr('data-original-title', 'Status is OK.');
        }).fail(function (response) {
            $(top).removeClass('icon-refresh-animate');
            $(top).removeClass('glyphicon-repeat');
            if (response.status == 401) {
                $(top).addClass('glyphicon-user');
                $(top).attr('data-original-title', 'Authentication is needed');
            } else {
                $(top).addClass('glyphicon-off');
                $(top).attr('data-original-title', 'Status is OFF.');
            }
        });
    };

    var checkStatus = function () {
        $('.status').each(function () {
            checkItemStatus(this)
        })
    };

    var onLoad = function () {
        $.ajax({
            url: dashboardurl, success: function (result) {
                data = denormalization(result);
                onRedrow();
            }
        });
    };

    $(window).bind('hashchange', onRedrow);
    $(window).on('load', onLoad);

    setInterval(checkStatus, updateDelay);
})(jQuery);

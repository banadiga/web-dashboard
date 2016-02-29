'use strict';
// Check libs
if (typeof jQuery === 'undefined') {
    throw new Error('JavaScript requires jQuery')
}

(function ($) {
    // Load templates
    $.get("template/categories.html", null, function (categories) {
        $.template("categories", categories);
    });
    $.get("template/groups.html", null, function (groups) {
        $.template("groups", groups);
    });

    // Denormalization data
    var denormalization = function (data) {
        var groups = {};
        data.categories.forEach(function (category) {
            category.items.forEach(function (item) {
                item.category = category.name;
                if (!Array.isArray(item.group)) {
                    item.group = [item.group == undefined ? "undefined" : item.group];
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
        $.tmpl("categories", data).appendTo("#categories");
    };

    var buildGroups = function (data) {
        $.tmpl("groups", data).appendTo("#categories");
    };

    // Local cache
    var data;

    var onRedrow = function () {
        $("#categories").empty();

        if (location.hash == '#group') {
            buildGroups(data);
        } else {
            buildCategories(data);
        }

        setTimeout(checkStatus, 100);
    };

    var checkItemStatus = function (top) {
        var url = top.getAttribute("url");
        $(top).addClass("glyphicon-repeat icon-refresh-animate");
        $.ajax({
            url: '/cors-proxy/' + url,
            type: "HEAD"
        }).done(function () {
            $(top).removeClass("icon-refresh-animate");
            $(top).removeClass("glyphicon-repeat");
            $(top).addClass("glyphicon-ok");
        }).fail(function (response) {
            $(top).removeClass("icon-refresh-animate");
            $(top).removeClass("glyphicon-repeat");
            if (response.status == 401) {
                $(top).addClass("glyphicon-user");
            } else {
                $(top).addClass("glyphicon-off");
            }
        });
    };

    var checkStatus = function () {
        $(".status").each(function () {
            checkItemStatus(this)
        })
    };

    var onLoad = function () {
        $.ajax({
            url: "api/dashboard.json", success: function (result) {
                data = denormalization(result);
                onRedrow();
            }
        });
    };
    $(window).bind('hashchange', onRedrow);
    $(window).on('load', onLoad);

    setInterval(checkStatus, 20000);
})(jQuery);

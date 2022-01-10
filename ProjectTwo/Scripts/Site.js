$(document).ready(function () {
    var chat = $.connection.chatHub;
    $.connection.hub.start().done(function () {
        [...document.querySelectorAll('.link')].forEach((item, i) => {
            chat.server.joinGroup(item.children[0].value);
            getConversation(item.children[0].value, new Date().toISOString());
        })
    });
    const container = document.querySelector('.page-container');
    var pages = [...document.querySelectorAll('.page')];
    const toggleBtn = document.querySelector('.toggle-btn');
    const ul = document.querySelector('.nav-list');
    const overlay = document.querySelector('.overlay');
    var links = [...document.querySelectorAll('.link')];

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        container.classList.toggle('active');
        ul.classList.toggle('show');
        $('.cover').remove();
    })

    const changePage = (i) => {
        overlay.style.animation = `slide 1s linear 1`;
        setTimeout(() => {
            $('.page').each(function () {
                $(this).removeClass("active");
            });
            pages[i].classList.add('active');
        }, 500);
        setTimeout(() => {
            overlay.style.animation = null;
        }, 1000);
    }

    links.forEach((item, i) => {
        item.addEventListener('click', () => {
            actionLink(item, i);
        })
    })

    //fucntion 
    function getInfoUser(userId) {
        var user = {
            id: "",
            userName: "",
            avatar: ""
        };
        $.ajax({
            type: "GET",
            url: "/Message/GetInfoUser",
            async: false,
            data: jQuery.param({ userId: userId }),
            success: function (res) {
                if (res.status = "ok") {
                    user.id = res.userId;
                    user.userName = res.userName;
                    user.avatar = res.avatar;
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        return user;
    }

    function checkDay(day1, day2) {
        var first = new Date(day1);
        var second = new Date(day2);
        if (first.getDate() != second.getDate()) {
            return false;
        }
        if (first.getMonth() != second.getMonth()) {
            return false;
        }
        if (first.getFullYear() != second.getFullYear()) {
            return false;
        }
        return true;
    }

    function convertTimeString(time) {
        var dateObj = new Date(time);
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        return newdate = day + "/" + month + "/" + year;
    }

    function scrollToBottom(selector) {
        $(selector)[0].scrollTop = $(selector)[0].scrollHeight;
    }

    function actionLink(item, i) {
        $('.link').each(function () {
            $(this).removeClass("active");
        });
        changePage(i);
        links[i].classList.add("active");        
    }

    function getPageLinks() {
        pages = [...document.querySelectorAll('.page')];
        links = [...document.querySelectorAll('.link')];
        links.forEach((item, i) => {
            item.addEventListener('click', () => {
                actionLink(item, i);
            })
        })
    }

    function searchFriend(keyword) {
        $.ajax({
            type: "GET",
            url: "/Message/SearchFriend",
            data: jQuery.param({ keyword: keyword }),
            success: function (res) {
                $('.search-result').empty().addClass('active').append(res);
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function createGroup(userid) {
        var groupId = "";
        $.ajax({
            type: "POST",
            url: "/Message/CreateGroup",
            async: false,
            data: jQuery.param({ userId: userid }),
            success: function (res1) {
                if (res1.status == "ok") {
                    chat.server.sendRequest(res1.userId, res1.groupId);
                    chat.server.joinGroup(res1.groupId);
                    groupId = res1.groupId;
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        return groupId;
    }

    function renderListGroup(id) {
        $.ajax({
            type: "GET",
            url: "/Message/RenderPage",
            async: false,
            data: jQuery.param({ groupId: id, active: ($('.page').length == 0) ? "active" : "" }),
            success: function (res) {
                $('.page-container').prepend(res);
                getConversation(id, new Date().toISOString());
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        $.ajax({
            type: "GET",
            url: "/Message/RenderNavItem",
            async: false,
            data: jQuery.param({ groupId: id }),
            success: function (res) {
                $('.nav-list').prepend(res);
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        getPageLinks();
    }

    function renderMessage(groupId, senderId, message, when) {
        var time = $(`.${groupId} .content-chat .message-item`).first().children('input').val();
        //console.log("compare :" + when + " vs " + time);
        //console.log(checkDay(when, time));
        //console.log(!checkDay(when, time));
        //console.log(checkDay(when, new Date()));

        var id = '<input type="hidden" name="personId" value="' + senderId + '"/>';
        var user = getInfoUser(senderId);
        var timeSend = '<input type="hidden" name="timeSend" value="' + when + '"/>';
        var userName = '<li class="user-name"><small>' + user.userName + '</small></li>';
        var avatar = '';
        if (user.avatar != null) {
            avatar = '<div class="image"><img src="' + user.avatar + '"/></div>';
        } else {
            avatar = '<div class="image">' + user.userName.substring(0, 2) + '</div>';
        }

        var partMessage = (new RegExp('^data:image').test(message)) ? '<li class="message-item picture">' + timeSend + '<div class="image"><img src="' + message + '"/></div>' + '</li>' : '<li class="message-item">' + timeSend + message + '</li>';
        var contentMessage = '<ul class="content-message">' + userName + partMessage + '</ul>';

        if ($(`.${groupId} .content-chat section`).length > 0) {
            if ($(`.${groupId} .content-chat section`).first().hasClass(senderId) && checkDay(when, time)) {
                $(`.${groupId} .content-chat section`).first().children('ul').children('.message-item').first().before(partMessage);
            } else {                
                if (!checkDay(when, time) && checkDay(time,new Date())) {
                    $(`.${groupId} .content-chat`).prepend('<p class="time">Today</p>');
                } else if (!checkDay(when, time)) {
                    $(`.${groupId} .content-chat`).prepend('<p class="time">' + convertTimeString(time) + '</p>');
                }
                if (senderId != $('.type-bar #userId').val()) {
                    var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';                                       
                    $(`.${groupId} .content-chat`).prepend(person);
                } else {
                    var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).prepend(person);
                }
            }
        }

        if ($(`.${groupId} .content-chat section`).length == 0) {
            if (senderId != $('.type-bar #userId').val()) {
                var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).prepend(person);
            } else {
                var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).prepend(person);
            }
        }
    }

    function getConversation(groupId, lastTimeSend, loadOlder = false) {
        $.ajax({
            type: "GET",
            url: "/Message/GetConversation",
            async: false,
            data: jQuery.param({ groupId: groupId, lastTimeSend: lastTimeSend }),
            success: function (res) {
                if (res.length > 0) {
                    //console.log(res);
                    if (!loadOlder) {
                        $(`.${res[0].GroupId} .content-chat`).empty();
                    }                    
                    res.forEach(function (item) {
                        renderMessage(item.GroupId, item.SenderId, item.Content, item.When);
                    })
                    if (!loadOlder) {
                        scrollToBottom(`.${res[0].GroupId} .content-chat`);
                    }                    
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function addAlert(type,style,from,message) {
        var alertContent = '<div class="alert-content"><p class="from">' + from + '</p><p class="alert-details">' + message + "</p></div>";
        var icon = `<i class="uil uil-${style} ${type}"></i>`;
        $('<div class="alert-item"></div>').append(icon + alertContent).appendTo('.box-alert').addClass("active").on('animationend', function () {
            $(this).remove();
        })
    }

    // -------

    chat.client.receiveRequest = function (toPerson, groupId) {
        if (toPerson == $('.type-bar #userId').val()) {
            chat.server.joinGroup(groupId);
            renderListGroup(groupId);
        }
    }

    $('#searchBar').on("keyup click", function () {
        searchFriend(($(this).val().trim() == "") ? "ktl16602" : $(this).val().trim());
    })

    $('.search-result').on('click', '.result-item', function () {
        var id = $(this).children('input').val();
        var groupId = createGroup(id);
        if (groupId != "") {
            renderListGroup(groupId);
        }
        getPageLinks();
        $('.search-result').removeClass('active');
        $('.type-bar #message').focus();
        $('.type-bar label,button').removeClass('active');
    })

    $('.page-container').on('click', '.uil-sign-out-alt', function () {
        var groupId = $(this).parent().prevAll().last().val();
        var groupName = $(this).parent().prevAll().last().next().children(".tooltip").text();
        $('.box-confirm-leave input[name="groupId"]').val(groupId);
        $('.box-confirm-leave .name-group').text(groupName);
        $('.box-confirm-leave').addClass("active");
    })
    // actions box-confirm-leave
    $('.box-confirm-leave .cancel').on('click', function () {
        $('.box-confirm-leave').removeClass("active");
    })
    $('.box-confirm-leave .accept').on('click', function () {
        console.log($(this).parent().prevAll().last().val())
        var groupId = $(this).parent().prevAll().last().val();
        $.ajax({
            type: "POST",
            url: "/Message/LeaveGroup",
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res == "True") {
                    $(`.page-container .${groupId}`).remove();
                    $(`.nav-list .${groupId}`).remove();
                    getPageLinks();
                    $('.box-confirm-leave').removeClass("active")
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })        
    })

    $('.type-bar #message').on('click', function () {
        $('.type-bar label,button').addClass('active');
    })

    $('body').click(function (evt) {
        if (evt.target.id == "type-bar") {
            $('.search-result').removeClass('active');
            return;
        }

        if ($(evt.target).closest('#type-bar').length) {
            $('.search-result').removeClass('active');
            return;
        }


        if (evt.target.classList.contains("search-box")) {
            $('.type-bar label,button').removeClass('active');
            return;
        }

        if ($(evt.target).closest('.search-result').length) {
            $('.type-bar label,button').addClass('active');
            return;
        }


        $('.search-result').removeClass('active');
        $('.type-bar label,button').removeClass('active');
    });

    function convertToBase64(el) {
        if (el[0].files[0].size < 2097152) {
            if (el.prop('files') && el.prop('files')[0]) {
                var FR = new FileReader();
                FR.onload = function (e) {
                    el.prev().prev().empty().append('<img src="' + e.target.result + '"/>');
                    el.prev().val(e.target.result);
                };
                FR.readAsDataURL(el.prop('files')[0]);
            }
        } else {
            addAlert("warning", "info-circle", "System", "Image size <= 2MB");
        }


    }
    //edit group
    $('.page-container').on('click', '.uil-pen', function () {
        $(this).next().toggleClass('active');
        $(this).next().children().last().empty();        
    })
    $(".img-group").change(function () {
        convertToBase64($(this));
    });
    $('.form-edit .btn-update').on('click', function () {
        $(this).removeClass('uil-check').addClass('uil-spinner').empty();
        var group = {
            GroupId: $(this).parents('.options').prevAll().last().val(),
            GroupName: $(this).prevAll().last().val() == "" ? $(this).parents('.options').prevAll().last().children('.tooltip').text() : $(this).prevAll().last().val(),
            GroupImg: $(this).prev().prev().val()
        }
        //console.log(group);
        var el = $(this);
        $.ajax({
            type: "POST",
            url: "/Message/UpdateGroup",
            data: jQuery.param({ group: group }),
            success: function (res) {
                if (res.status == "ok") {
                    el.removeClass('uil-spinner').addClass('uil-check').append('<small>Done</small>');
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        //console.log(group);
    })

    //change theme
    $('.list-theme').on('click', '.circle', function () {
        var theme = $(this).attr('class').split(/\s+/)[0];
        if (theme == "default") {
            $('body').removeClass();
            $(this).parent().prev().removeClass().addClass("default circle selected-theme");
        } else {
            $('body').removeClass().addClass(theme);
            $(this).parent().prev().removeClass().addClass(`${theme} circle selected-theme `);
        }
    })
    //change dark-light
    $('.navbar').on('click', '.mode-view', function () {
        if ($(this).hasClass('uil-sun')) {
            $(this).removeClass('uil-sun').addClass('uil-moon');
            $('body').attr('id', 'light');
        } else {
            $(this).removeClass('uil-moon').addClass('uil-sun');
            $('body').attr('id', '');
        }
    })

    var loading = 0;
    $('.page .content-chat').on('scroll', function () {
        //console.log("calc:", ($(this).height() + $(this)[0].scrollTop) - ($(this)[0].scrollHeight - 20));
        //console.log(new Date('2013-08-02T10:09:08Z'));
        //var sh = ($(this)[0].scrollHeight - 20);
        //var hst = ($(this).height() + $(this)[0].scrollTop);
        //if (sh - hst >= sh - 450) {
        //    var groupId = $(this).parent().children('#groupId').val();
        //    var time = $(`.${groupId} .content-chat .message-item`).first().children('input').val();
        //    getConversation(groupId, time, true);            
        //}
        //if ($(this)[0].scrollTop) {
        //    var groupId = $(this).parent().children('#groupId').val();
        //    var time = $(`.${groupId} .content-chat .message-item`).first().children('input').val();
        //    getConversation(groupId, time, true);
        //};
    })
})


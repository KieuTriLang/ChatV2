
$(document).ready(function () {
    var chat = $.connection.chatHub;
    $.connection.hub.disconnected(function () {
        setTimeout(function () {
            $.connection.hub.start();
        }, 5000); // Restart connection after 5 seconds.
    });
    $.connection.hub.start().done(function () {
        [...document.querySelectorAll('.link')].forEach((item, i) => {
            if (!item.classList.contains("waiting-accept")) {
                chat.server.joinGroup(item.children[0].value);
                getConversation(item.children[0].value, new Date().toISOString());
                getUnread(item.children[0].value);
            }
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
        overlay.style.animation = `slide 0.75s linear 1`;
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

    checkOnline();
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
        var hour = (dateObj.getHours() < 10) ? 0 + dateObj.getHours() : dateObj.getHours();
        var minute = (dateObj.getMinutes() < 10) ? 0 + dateObj.getMinutes() : dateObj.getMinutes();

        return newdate = (new Date().getUTCDate() - dateObj.getUTCDate() == 1) ? `${hour}:${minute} Yesterday` : `${hour}:${minute} ${day}/${month}/${year}`;
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

    function searchFriend(target, keyword) {
        $.ajax({
            type: "GET",
            url: "/Message/SearchFriend",
            data: jQuery.param({ keyword: keyword }),
            success: function (res) {
                $(`.${target} .search-result`).empty().addClass('active').append(res);
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
                    addAlert("success", "check", "System", "Create group successfully")
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        return groupId;
    }

    function getInfoGroup(groupId) {
        var group = {
            GroupId: "",
            GroupName: "",
            GroupImg: ""
        }
        $.ajax({
            type: "GET",
            url: "/Message/GetInfoGroup",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                group.GroupId = res.GroupId;
                group.GroupName = res.GroupName;
                group.GroupImg = res.GroupImg;
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        return group;
    }

    function renderListGroup(id, active) {
        $.ajax({
            type: "GET",
            url: "/Message/RenderPage",
            async: false,
            data: jQuery.param({ groupId: id, active: active }),
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
            data: jQuery.param({ groupId: id, active: active }),
            success: function (res) {
                $('.nav-list').prepend(res);
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        getPageLinks();
    }

    function convertLink(input) {

        let text = input;
        const linksFound = text.match(/(?:www|https?)[^\s]+/g);
        const aLink = [];

        if (linksFound != null) {

            for (let i = 0; i < linksFound.length; i++) {
                let replace = linksFound[i];
                if (!(linksFound[i].match(/(http(s?)):\/\//))) { replace = 'http://' + linksFound[i] }
                let linkText = replace.split('/')[2];
                if (linkText.substring(0, 3) == 'www') { linkText = linkText.replace('www.', '') }
                if (linkText.match(/youtu/)) {

                    let youtubeID = replace.split('/').slice(-1)[0];
                    aLink.push('<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/' + youtubeID + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>')
                }
                else if (linkText.match(/vimeo/)) {
                    let vimeoID = replace.split('/').slice(-1)[0];
                    aLink.push('<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/' + vimeoID + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')
                }
                else {
                    aLink.push('<a href="' + replace + '" target="_blank">' + replace + '</a>');
                }
                text = text.split(linksFound[i]).map(item => { return aLink[i].includes('iframe') ? item.trim() : item }).join(aLink[i]);
            }
            return text;
        }
        else {
            return input;
        }
    }

    function renderMessage(groupId, senderId, message, when) {
        var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        message = message.match(regex) != null ? convertLink(message) : message;
        var time = $(`.${groupId} .content-chat .message-item`).first().children('input').val();
        var timeSend = '<input type="hidden" name="timeSend" value="' + when + '"/>';
        if (checkDay(when, time) || checkDay(time, new Date().toISOString())) {
            $(`.${groupId} .content-chat .time`).first().remove();
        }
        var id = '<input type="hidden" name="personId" value="' + senderId + '"/>';
        var user = getInfoUser(senderId);
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
                if (!checkDay(when, time) && checkDay(time, new Date().toISOString())) {
                    $(`.${groupId} .content-chat`).prepend('<p class="time">Today</p>');
                }
                if (senderId == "PchatSystem") {
                    $(`.${groupId} .content-chat`).prepend('<p class="message-item system">' + timeSend + message + '</p>');
                } else {
                    if (senderId != $('.type-bar #userId').val()) {
                        var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
                        $(`.${groupId} .content-chat`).prepend(person);
                    } else {
                        var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                        $(`.${groupId} .content-chat`).prepend(person);
                    }
                }
            }
        }

        if ($(`.${groupId} .content-chat section`).length == 0) {
            if (senderId == "PchatSystem") {
                $(`.${groupId} .content-chat`).prepend('<p class="message-item system">' + timeSend + message + '</p>');
            } else {
                if (senderId != $('.type-bar #userId').val()) {
                    var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).prepend(person);
                } else {
                    var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).prepend(person);
                }
            }
        }

        if (checkDay(when, new Date().toISOString())) {
            $(`.${groupId} .content-chat`).prepend('<p class="time">Today</p>');
        } else {
            $(`.${groupId} .content-chat`).prepend('<p class="time">' + convertTimeString(when) + '</p>');
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
                    res.forEach(function (item) {
                        renderMessage(item.GroupId, item.SenderId, item.Content, item.When);
                    })
                    getSeen(groupId);
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

    function addAlert(type, style, from, message) {
        var alertContent = '<div class="alert-content"><p class="from">' + from + '</p><p class="alert-details">' + message + "</p></div>";
        var icon = `<i class="uil uil-${style} ${type}"></i>`;
        $('<div class="alert-item"></div>').append(icon + alertContent).appendTo('.box-alert').addClass("active").on('animationend', function () {
            $(this).remove();
        })
    }

    function addMember(groupId, memberId) {
        $.ajax({
            type: "POST",
            url: "/Message/AddToGroup",
            async: false,
            data: jQuery.param({ groupId: groupId, memberId: memberId }),
            success: function (res) {
                if (res == "True") {
                    chat.server.sendRequest(memberId, groupId);
                    chat.server.sendUpdate(groupId);
                    addAlert("success", "check", "System", "Invite successfully");
                } else {
                    addAlert("warning", "info-circle", "System", "This member has joined");
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function acceptInvite(groupId) {
        $.ajax({
            type: "POST",
            url: "/Message/AcceptInvite",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res == "True") {
                    $(`.page-container`).children(`.page.${groupId}`).remove();
                    $(`.nav-list`).children(`.link.${groupId}`).remove();
                    chat.server.joinGroup(groupId);
                    chat.server.sendMessage("PchatSystem", groupId, $('.navbar .nav-log .user-name').text() + " joined group", new Date().toISOString());
                    renderListGroup(groupId, "active");
                    $(`.page.${groupId} .message-item.system`).last().remove();
                    chat.server.sendUpdate(groupId);
                    var group = getInfoGroup(groupId)
                    addAlert("success", "info-circle", group.GroupName, `Welcome to ${group.GroupName}`);                    
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function declineInvite(groupId) {
        $.ajax({
            type: "POST",
            url: "/Message/DeclineInvite",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res == "True") {
                    $(`.page.${groupId}`).remove();
                    $(`.link.${groupId}`).remove();
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function checkOnline() {
        $.ajax({
            type: "GET",
            url: "/Message/CheckOnline",
            success: function (res) {
                res.forEach(function (item) {
                    renderOnline(item);
                })
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function renderOnline(group) {
        $(`.nav-list .link.${group.GroupId}`).removeClass("online").addClass(group.IsOnline ? "online" : "");
        $(`.page-container .page.${group.GroupId}`).removeClass("online").addClass(group.IsOnline ? "online" : "");
        group.UserOnlines.forEach(function (item) {
            $(`.page-container .page.${group.GroupId} .options .group .members .member-item.${item.UserId}`).removeClass("online").addClass(item.IsOnline ? "online" : "");
            $(`.content-chat section.${item.UserId}`).removeClass("online").addClass(item.IsOnline ? "online" : "");
        })
    }

    function updateGroup(groupId) {
        $.ajax({
            type: "GET",
            url: "/Message/RenderHeaderPage",
            data: jQuery.param({ groupId: groupId }),
            async: false,
            success: function (res) {
                $(`.page.${groupId}`).children(".header-chat").before(res).remove();
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })

        $.ajax({
            type: "GET",
            url: "/Message/RenderMembers",
            data: jQuery.param({ groupId: groupId }),
            async: false,
            success: function (res) {
                $(`.page.${groupId} .options .group`).children(".members").before(res).remove();
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })

        var group = getInfoGroup(groupId);
        var gImg = group.GroupImg == null ? group.GroupName.substring(0, 2) : `<img src="${group.GroupImg}">`;
        $(`.link.${groupId}`).children('.image').empty().append(gImg);
        $(`.link.${groupId}`).children('.tooltip').text(group.GroupName);
    }

    function kickMember(groupId, personId) {
        $.ajax({
            type: "POST",
            url: "/Message/KickPerson",
            async: false,
            data: jQuery.param({ groupId: groupId, personId: personId }),
            success: function (res) {
                if (res == "True") {
                    addAlert("success", "info-circle", "System", `Kick successfully`);
                    $('.box-confirm-kick').removeClass("active");
                    chat.server.sendKick(groupId, personId);
                    chat.server.sendUpdate(groupId);
                } else {
                    addAlert("danger", "info-circle", "System", `You can't kick member`);
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function changeHost(groupId, personId) {
        $.ajax({
            type: "POST",
            url: "/Message/ChangeHost",
            async: false,
            data: jQuery.param({ groupId: groupId, toPerson: personId }),
            success: function (res) {
                if (res == "True") {
                    addAlert("success", "info-circle", "System", `Change host successfully`);
                    $('.box-confirm-host').removeClass("active");
                    chat.server.sendUpdate(groupId);
                } else {
                    addAlert("danger", "info-circle", "System", `You can't change host`);
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function resetBoxConfirm() {
        $('.box-confirm').removeClass("active");
    }

    function renderSeen(groupId, message, userId) {
        var readNum = 0;
        var item = $(`.${groupId} .content-chat .message-item`);
        item.each(function (index) {            
            var smallerTime = new Date($(this).children('input').val()).getTime() < new Date(message.When).getTime();
            var equalTime = new Date($(this).children('input').val()).getTime() == new Date(message.When).getTime();
            if (smallerTime) {
                $(this).next().children(`.${userId}`).remove();
            }
            //console.log(new Date($(this).children('input').val()).getTime()- new Date(message.When).getTime())
            if (($(this).text() == message.Content || $(this).children().hasClass("image")) && equalTime) {
                //console.log(!compareDate)
                readNum = index;
                var user = getInfoUser(userId);
                var avatar = '';
                if (user.avatar != null) {
                    avatar = `<div class="image ${userId}"><img src="${user.avatar}"/></div>`;
                } else {
                    avatar = '<div class="image">' + user.userName.substring(0, 2) + '</div>';
                }
                
                //console.log($(this).next().children().hasClass(userId));
                if (!$(this).next().children().hasClass(userId)) {
                    $(this).next().append(avatar);
                }
            }            
        })
        var unreadNum = item.length - (readNum + 1)
        if ( unreadNum > 0) {

        }
    }

    function getSeen(groupId) {
        $.ajax({
            type: "GET",
            url: "/Message/GetSeen",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                var item = $(`.${groupId} .content-chat .message-item`);
                item.each(function () {
                    if (!$(this).next().hasClass("seen-user")) {
                        $(this).after('<li class="seen-user"></li>')
                    }
                })
                res.forEach(function (item) {
                    renderSeen(item.GroupId, item.MessageSeen, item.UserId);
                })
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function getUnread(groupId) {
        $.ajax({
            type: "GET",
            url: "/Message/GetUnRead",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res.URNum > 0) {
                    $(`.link.${groupId}`).addClass("unread");
                    $(`.link.${groupId} .unread-item`).text(res.URNum);
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function updateSeen(groupId) {
        var success = false;
        $.ajax({
            type: "POST",
            url: "/Message/UpdateSeen",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res == "True") {
                    success = true;
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        return success;
    }
    // -------

    chat.client.receiveRequest = function (toPerson, groupId) {
        var isActive = "";
        $('.page').each(function () {
            if (!$(this).hasClass("active") || $(this).hasClass(groupId)) {
                isActive = "active";
            }
        })
        if ($('.page').length == 0) {
            isActive = "active";
        }
        if (toPerson == $('.type-bar #userId').val()) {
            renderListGroup(groupId, isActive);
            var group = getInfoGroup(groupId);
            addAlert("success", "info-circle", group.GroupName, `Can you join with us?`);
        }
    }
    chat.client.receiveUpdate = function (toGroup) {
        updateGroup(toGroup);
    }
    chat.client.receiveKick = function (toGroup, toPerson) {
        if (toPerson == $('.type-bar #userId').val()) {
            $(`.page.${toGroup}`).remove();
            $(`.link.${toGroup}`).remove();
            var group = getInfoGroup(toGroup);
            addAlert("warning", "info-circle", group.GroupName, `you were kicked out of the group`);
        }
    }
    chat.client.receiveSeen = function (toGroup) {
        getSeen(toGroup);
    }
    //search navbar
    $('.navbar #searchBar').on("keyup click", function () {
        searchFriend('navbar', ($(this).val().trim() == "") ? "ktl16602" : $(this).val().trim());
    })
    $('.box-add-friend #searchFriend').on("keyup click", function () {
        searchFriend('box-add-friend', ($(this).val().trim() == "") ? "ktl16602" : $(this).val().trim());
    })

    $('.navbar .search-result').on('click', '.result-item', function () {
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


    //search add friend
    $('.page-container').on('click', '.add-member', function () {
        var groupId = $(this).parents('.options').prevAll().last().val();
        var groupName = $(this).parents('.options').prevAll().last().next().children(".tooltip").text();
        $('.box-add-friend input[name="groupId"]').val(groupId);
        $('.box-add-friend .name-group').text(groupName + " - Invite friend");
        $('.box-add-friend').addClass('active');
        $('.box-add-friend input').focus();
    })
    $('.box-add-friend').on('click', '.uil-times', function () {
        $('.box-add-friend').removeClass('active');
    })
    $('.box-add-friend').on('click', '.result-item', function () {
        var groupId = $(this).parents(".search-bar").prevAll().last().val();
        var memberId = $(this).children('input').val();
        addMember(groupId, memberId);
    })


    //LEAVE GROUP
    $('.page-container').on('click', '.uil-sign-out-alt', function () {
        resetBoxConfirm();
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
        var groupId = $(this).parent().prevAll().last().val();
        $.ajax({
            type: "POST",
            url: "/Message/LeaveGroup",
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                if (res == "True") {
                    chat.server.sendMessage("PchatSystem", groupId, $('.navbar .nav-log .user-name').text() + " left group", new Date().toISOString());
                    chat.server.sendUpdate(groupId);
                    $(`.page-container .${groupId}`).remove();
                    $(`.nav-list .${groupId}`).remove();
                    getPageLinks();
                    $('.box-confirm-leave').removeClass("active");
                    chat.server.leaveGroup(groupId);
                } else {
                    addAlert("danger", "info-circle", "System", `You need give host to other people`);
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    })

    //KICK MEMBER
    $('.page-container').on('click', '.options .group .uil-minus-circle', function () {
        resetBoxConfirm();
        var groupId = $(this).parents(".page").children('input[name="groupId"]').val();
        var personId = $(this).parent().prevAll().last().val();
        var namePerson = $(this).parent().prev().text();
        var groupName = $(this).parents().parents(".page").children('.header-chat').children(".tooltip").text();
        $('.box-confirm-kick input[name="groupId"]').val(groupId);
        $('.box-confirm-kick input[name="personId"]').val(personId);
        $('.box-confirm-kick .name-group').text(groupName);
        $('.box-confirm-kick .confirm-sentence').text(`Do you wanna kick ${namePerson}?`);
        $('.box-confirm-kick').addClass("active");
    })
    // actions box-confirm-kick
    $('.box-confirm-kick .cancel').on('click', function () {
        $('.box-confirm-kick').removeClass("active");
    })
    $('.box-confirm-kick .accept').on('click', function () {
        var groupId = $(this).parents('.box-confirm-kick').children('input[name="groupId"]').val();
        var personId = $(this).parents('.box-confirm-kick').children('input[name="personId"]').val();
        kickMember(groupId, personId);
        var person = getInfoUser(personId);
        chat.server.sendMessage("PchatSystem", groupId, $('.navbar .nav-log .user-name').text() + " kicked out " + person.userName, new Date().toISOString());
    })

    //CHANGE HOST
    $('.page-container').on('click', '.options .group .uil-award', function () {
        resetBoxConfirm();
        var groupId = $(this).parents(".page").children('input[name="groupId"]').val();
        var personId = $(this).parent().prevAll().last().val();
        var namePerson = $(this).parent().prev().text();
        var groupName = $(this).parents().parents(".page").children('.header-chat').children(".tooltip").text();
        $('.box-confirm-host input[name="groupId"]').val(groupId);
        $('.box-confirm-host input[name="personId"]').val(personId);
        $('.box-confirm-host .name-group').text(groupName);
        $('.box-confirm-host .confirm-sentence').text(`Do you wanna give host to ${namePerson}?`);
        $('.box-confirm-host').addClass("active");
    })
    // actions box-confirm-host
    $('.box-confirm-host .cancel').on('click', function () {
        $('.box-confirm-host').removeClass("active");
    })
    $('.box-confirm-host .accept').on('click', function () {
        var groupId = $(this).parents('.box-confirm-host').children('input[name="groupId"]').val();
        var personId = $(this).parents('.box-confirm-host').children('input[name="personId"]').val();
        changeHost(groupId, personId);
        var person = getInfoUser(personId);
        chat.server.sendMessage("PchatSystem", groupId, $('.navbar .nav-log .user-name').text() + " gave host to " + person.userName, new Date().toISOString());
    })

    //
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
            el[0].value = "";
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
                    chat.server.sendUpdate(group.GroupId);
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

    $('.page .content-chat').on('scroll', function () {
        if ($(this)[0].scrollTop == 0) {
            var oldScroll = $(this)[0].scrollHeight;
            var groupId = $(this).parent().children('#groupId').val();
            var time = $(`.${groupId} .content-chat .message-item`).first().children('input').val();
            getConversation(groupId, time, true);
            $(this)[0].scrollTop = $(this)[0].scrollHeight - oldScroll;
        };
    })

    //accept invite
    $(document).on('click', '.page-invite .accept-options .uil-check', function () {
        var groupId = $(this).parents('.page').children('input').val();
        //console.log(groupId)
        acceptInvite(groupId);
    })
    //decline invite
    $(document).on('click', '.page-invite .accept-options .uil-times', function () {
        var groupId = $(this).parents('.page').children('input').val();
        declineInvite(groupId);
    })

    //click group
    $(document).on('click', '.nav-list .link', function () {
        var groupId = $(this).children('input[name="groupId"]').val();
        if (updateSeen(groupId)) {
            chat.server.sendSeen(groupId);
            $(`.link.${groupId}`).removeClass("unread");
        }
    })
    $(document).on('click', '.type-bar #message', function () {
        var groupId = "";
        $('.page').each(function () {
            if ($(this).hasClass('active')) {
                groupId = $(this).children('#groupId').val();
            }
        })
        if (groupId != "") {
            if (updateSeen(groupId)) {
                chat.server.sendSeen(groupId);
                $(`.link.${groupId}`).removeClass("unread");
            }
        }
    })

    setInterval(checkOnline, 3000);
})


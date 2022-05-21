
function renderSeen(groupId, message, userId) {
    let item = $(`.${groupId} .content-chat .message-item`);
    message.When = new Date(message.When).toLocaleString('en-US', { hour12: true });
    item.each(function () {
        var smallerTime = new Date($(this).children('input').val()).getTime() < new Date(message.When).getTime();
        var equalTime = new Date($(this).children('input').val()).getTime() == new Date(message.When).getTime();
        if (smallerTime) {
            $(this).next().children(`.${userId}`).remove();
        }
        if (($(this).text() == message.Content || $(this).children().hasClass("image"))  && equalTime) {
            //console.log(!compareDate)
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

function getImage(groupId, imageCode) {
    var image = "";
    $.ajax({
        type: "GET",
        url: "/Message/GetImage",
        async: false,
        data: jQuery.param({ groupId: groupId, imageCode: imageCode }),
        success: function (res) {
            image = res;
        },
        error: function (err) {
            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }
    })
    return image;
}

function renderMessageRealTime(groupId, senderId, message, when) {
    when = new Date(when).toLocaleString('en-US', { hour12: true });
    var image = getImage(groupId, message);
    var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    message = message.match(regex) != null ? convertLink(message) : message;
    var time = $(`.${groupId} .content-chat .message-item`).last().children('input').val();
    var timeSend = '<input type="hidden" name="timeSend" value="' + when + '"/>';
    if (senderId == "PchatSystem") {
        if (!checkDay(when,time)) {
            $(`.${groupId} .content-chat`).append('<p class="time">Today</p>');
        }
        $(`.${groupId} .content-chat`).append('<p class="message-item system">' + timeSend + message + '</p>' + '<li class="seen-user"></li>');
    } else {        
        var id = '<input type="hidden" name="personId" value="' + senderId + '"/>';
        var user = getInfoUser(senderId);        
        var userName = '<li class="user-name"><small>' + user.userName + '</small></li>';
        var avatar = '';
        if (user.avatar != null) {
            avatar = '<div class="image"><img src="' + user.avatar + '"/></div>';
        } else {
            avatar = '<div class="image">' + user.userName.substring(0, 2) + '</div>';
        }        
        var partMessage = (image != "Pchat-image") ? '<li class="message-item picture">' + timeSend + '<div class="image"><img src="' + image + '"/></div></li>' : '<li class="message-item">' + timeSend + message + '</li>';
        //console.log(user.avatar);
        //console.log(avatar);
        var contentMessage = '<ul class="content-message">' + userName + partMessage + '<li class="seen-user"></li></ul>';
        //console.log($(`.${groupId} .content-chat section`));
        if ($(`.${groupId} .content-chat section`).length > 0) {
            if ($(`.${groupId} .content-chat section`).last().hasClass(senderId) && checkDay(when, time)) {
                $(`.${groupId} .content-chat section`).last().children('ul').append(partMessage + '<li class="seen-user"></li>');
            } else {
                if (!checkDay(when, time)) {
                    $(`.${groupId} .content-chat`).append('<p class="time">Today</p>');
                }
                if (senderId != $('.type-bar #userId').val()) {
                    var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).append(person);
                } else {
                    var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).append(person);
                }
            }
        }

        if ($(`.${groupId} .content-chat section`).length == 0) {
            if (!checkDay(when, time)) {
                $(`.${groupId} .content-chat`).append('<p class="time">Today</p>');
            }
            if (senderId != $('.type-bar #userId').val()) {
                var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).append(person);
            } else {
                var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).append(person);
            }
        }
        return true;
    }

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

function addAlert(type, style, from, message) {
    var alertContent = '<div class="alert-content"><p class="from">' + from + '</p><p class="alert-details">' + message + "</p></div>";
    var icon = `<i class="uil uil-${style} ${type}"></i>`;
    $('<div class="alert-item"></div>').append(icon + alertContent).appendTo('.box-alert').addClass("active").on('animationend', function () {
        $(this).remove();
    })
}

$(document).ready(function () {
    var sender = $('.type-bar #userId').val();
    var receiver = "";
    var chat = $.connection.chatHub;
    $.connection.hub.disconnected(function () {
        setTimeout(function () {
            $.connection.hub.start();
        }, 5000); // Restart connection after 5 seconds.
    });
    // Create a function that the hub can call back to display messages.
    chat.client.receiveMessage = function (toGroup, fromPerson, message, when) {
        if (renderMessageRealTime(toGroup, fromPerson, message, when)) {
            var messObj = {
                Content: message,
                When: when
            }
            if (fromPerson != sender) {
                renderSeen(toGroup, messObj, fromPerson);
                if ($(`.link.${toGroup}`).hasClass("unread")) {
                    var num = parseInt($(`.link.${toGroup} .unread-item`).text());
                    $(`.link.${toGroup} .unread-item`).text(num + 1);
                } else {
                    $(`.link.${toGroup}`).addClass("unread");
                }
            }
        };
        var contentChat = $(`.${toGroup} .content-chat`);
        if (((contentChat[0].scrollHeight - 20) - (contentChat.height() + contentChat[0].scrollTop) <= 350) && fromPerson != "PchatSystem") {
            $(`.${toGroup} .content-chat`).animate({ scrollTop: $(`.${toGroup} .content-chat`)[0].scrollHeight }, 700);
        }
    };
    // Start the connection.
    $.connection.hub.start().done(function () {
        $('#type-bar').submit(function (e) {
            e.preventDefault();
            if ($('#message').val() != "") {
                $('.page').each(function () {
                    if ($(this).hasClass('active')) {
                        receiver = $(this).children('#groupId').val();
                    }
                })

                var message = {
                    Content: $('#message').val(),
                    When: new Date().toISOString(),
                    GroupId: receiver,
                    SenderId: sender
                };
                if (receiver != "") {
                    $.ajax({
                        type: "POST",
                        url: "/Message/SaveMessage",
                        async: false,
                        data: jQuery.param({ info: message }),
                        success: function (res) {
                            if (res.status != "not ok") {
                                // Call the Send method on the hub. 
                                chat.server.sendMessage(res.SenderId, res.GroupId, res.Content, res.When);
                                var contentChat = $(`.${receiver} .content-chat`);
                                if ((contentChat[0].scrollHeight - 20) - (contentChat.height() + contentChat[0].scrollTop) <= 300) {
                                    $(`.${receiver} .content-chat`).animate({ scrollTop: $(`.${receiver} .content-chat`)[0].scrollHeight }, 700);
                                }
                            }
                        },
                        error: function (err) {
                            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                        }
                    })
                }
            }
            $('#message').val('');
        });
        document.querySelector("#sendImage").addEventListener("change", function () {
            if (this.files[0].size < 2097152) {
                if (this.files && this.files[0]) {
                    var FR = new FileReader();
                    FR.onload = function (e) {
                        e.preventDefault();
                        $('.page').each(function () {
                            if ($(this).hasClass('active')) {
                                receiver = $(this).children('#groupId').val();
                            }
                        })
                        var message = {
                            Content: e.target.result,
                            When: new Date().toISOString(),
                            GroupId: receiver,
                            SenderId: sender
                        };
                        if (receiver != "") {
                            $.ajax({
                                type: "POST",
                                url: "/Message/SaveImage",
                                async: false,
                                data: jQuery.param({ info: message }),
                                success: function (res) {
                                    if (res.status != "not ok") {
                                        chat.server.sendMessage(sender, receiver, res.ImageCode, res.When);
                                        $("#sendImage").val("");
                                        var contentChat = $(`.${receiver} .content-chat`);
                                        if ((contentChat[0].scrollHeight - 20) - (contentChat.height() + contentChat[0].scrollTop) <= 500) {
                                            $(`.${receiver} .content-chat`).animate({ scrollTop: $(`.${receiver} .content-chat`)[0].scrollHeight }, 700);
                                        }
                                    }
                                },
                                error: function (err) {
                                    console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                                }
                            })
                        }
                    };
                    FR.readAsDataURL(this.files[0]);
                }
            } else {
                $("#sendImage").val("");
                addAlert("warning", "info-circle", "System", "Image size <= 2MB");
            }
        }, false);
    });
})
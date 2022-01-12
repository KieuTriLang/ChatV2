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
        async:false,
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
    var time = $(`.${groupId} .content-chat .message-item`).last().children('input').val();
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
    var image = getImage(groupId, message);
    var partMessage = (image != "Pchat-image") ? '<li class="message-item picture">' + timeSend + '<div class="image"><img src="' + image + '"/></div></li>' : '<li class="message-item">' + timeSend + message + '</li>';
    //console.log(user.avatar);
    //console.log(avatar);
    var contentMessage = '<ul class="content-message">' + userName + partMessage + '</ul>';
    //console.log($(`.${groupId} .content-chat section`));
    if ($(`.${groupId} .content-chat section`).length > 0) {
        if ($(`.${groupId} .content-chat section`).last().hasClass(senderId) && checkDay(when, time)) {
            $(`.${groupId} .content-chat section`).last().children('ul').append(partMessage);
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
    // Create a function that the hub can call back to display messages.
    chat.client.receiveMessage = function (toGroup, fromPerson, message, when) {
        renderMessageRealTime(toGroup, fromPerson, message, when);        
        var contentChat = $(`.${toGroup} .content-chat`);
        if ((contentChat[0].scrollHeight - 20) - (contentChat.height() + contentChat[0].scrollTop) <= 300) {
            $(`.${toGroup} .content-chat`).animate({ scrollTop: $(`.${toGroup} .content-chat`)[0].scrollHeight }, 700);
        }
    };
    $.connection.hub.disconnected(function () {
        setTimeout(function () {
            $.connection.hub.start();
        }, 5000); // Restart connection after 5 seconds.
    });
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
                            if (res == "True") {
                                // Call the Send method on the hub. 
                                chat.server.sendMessage(sender, receiver, $('#message').val(), message.When);
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
                                    if (res != "wrong") {
                                        chat.server.sendMessage(sender, receiver, res, message.When);
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
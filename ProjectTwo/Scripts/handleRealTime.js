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

function renderMessage(groupId,senderId, message, when) {
    var id = '<input type="hidden" name="personId" value="' + senderId + '"/>';
    var user = getInfoUser(senderId);
    var timeSend = '<input type="hidden" name="timeSend" value="' + when + '"/>';
    var userName = '<li class="user-name"><small>' + user.userName + '</small></li>';
    var avatar = '';
    if (user.avatar != null) {
        avatar = '<div class="image"><img src="'+user.avatar+'"/></div>';
    } else {
        avatar = '<div class="image">'+user.userName.substring(0,2)+'</div>';
    }
    //console.log(user.avatar);
    //console.log(avatar);
    var partMessage =(new RegExp('^data:image').test(message)) ? '<li class="message-item picture">' + timeSend + '<div class="image"><img src="'+message+'"/></div>'+'</li>' : '<li class="message-item">'+timeSend+message + '</li>';
    var contentMessage = '<ul class="content-message">' + userName + partMessage + '</ul>';
    //console.log($(`.${groupId} .content-chat section`));
    if($(`.${groupId} .content-chat section`).length > 0) {
        if ($(`.${groupId} .content-chat section`).last().hasClass(senderId)) {
            $(`.${groupId} .content-chat section`).last().children('ul').append(partMessage);
        } else {
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
        if (senderId != $('.type-bar #userId').val()) {
            var person = '<section class="person ' + senderId + '">' + id + avatar + contentMessage + '</section>';
            $(`.${groupId} .content-chat`).append(person);
        } else {
            var person = '<section class="me ' + senderId + '">' + contentMessage + '</section>';
            $(`.${groupId} .content-chat`).append(person);
        }
    }
}


$(document).ready(function () {
    var sender = $('.type-bar #userId').val();
    var receiver = "";
    var chat = $.connection.chatHub;
    // Create a function that the hub can call back to display messages.
    chat.client.receiveMessage = function (toGroup, fromPerson, message, when) {
        renderMessage(toGroup, fromPerson, message, when);
    };
    
    // Start the connection.
    $.connection.hub.start().done(function () {
        $('#type-bar').submit(function (e) {
            e.preventDefault();
            $('.page').each(function () {
                if ($(this).hasClass('active')) {
                    receiver = $(this).children('.header-chat').children('#groupId').val();
                }
            })
            
            var message = {
                Content: $('#message').val(),
                When: new Date().toISOString(),
                GroupId: receiver,
                SenderId: sender
            };
            $.ajax({
                type: "POST",
                url: "/Message/SaveMessage",
                async: false,
                data: jQuery.param({ info: message }),
                success: function (res) {
                    if (res) {
                        // Call the Send method on the hub. 
                        if (receiver != "") {
                            chat.server.sendMessage(sender, receiver, $('#message').val(), message.When);
                            $(`.${receiver} .content-chat`).animate({ scrollTop: $(`.${receiver} .content-chat`).height() }, 700);
                        }
                    }
                },
                error: function (err) {
                    console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                }
            })
            $('#message').val('');
        });
        //document.querySelector("#sendImage").addEventListener("change", function () {
        //    if (this.files && this.files[0]) {
        //        var FR = new FileReader();
        //        FR.onload = function (e) {
        //            e.preventDefault();
        //            $('.page').each(function () {
        //                if ($(this).hasClass('active')) {
        //                    receiver = $(this).children('.header-chat').children('#groupId').val();
        //                }
        //            })

        //            var message = {
        //                Content: e.target.result,
        //                When: new Date(),
        //                GroupId: receiver,
        //                SenderId: sender
        //            };
        //            console.log(message);
        //            $.ajax({
        //                type: "POST",
        //                url: "/Message/SaveMessage",
        //                async: false,
        //                data: jQuery.param({ info: message }),
        //                success: function (res) {
        //                    if (res.status = "ok") {
        //                        // Call the Send method on the hub. 
        //                        if (receiver != "") {
        //                            chat.server.sendMessage(sender, receiver, e.target.result, message.When);
        //                            $("#sendImage").val("");
        //                        }
        //                    }
        //                },
        //                error: function (err) {
        //                    console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        //                }
        //            })
        //        };
        //        FR.readAsDataURL(this.files[0]);
        //    }
        //}, false);
    });
})
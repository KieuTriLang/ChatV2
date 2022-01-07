$(document).ready(function () {
    var chat = $.connection.chatHub;
    $.connection.hub.start().done(function () {

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
            actionLink(item,i);
        })
    })

    //fucntion 
    function scrollToBottom(selector) {
        $(selector).animate({ scrollTop: $(selector).height() }, 700);
    }

    function actionLink(item,i) {
        $('.link').each(function () {
            $(this).removeClass("active");
        });
        changePage(i);
        links[i].classList.add("active");
        chat.server.joinGroup(item.children[0].value);
        getConversation(item.children[0].value, new Date().toISOString());
    }

    function getPageLinks() {
        pages = [...document.querySelectorAll('.page')];
        links = [...document.querySelectorAll('.link')];
        console.log(pages);
        console.log(links);
        links.forEach((item, i) => {
            item.addEventListener('click', () => {
                actionLink(item,i);
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
            data: jQuery.param({ groupId: id, active: ($('.page').length == 0)?"active":"" }),
            success: function (res) {
                $('.page-container').prepend(res);
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        $.ajax({
            type: "GET",
            url: "/Message/RenderNavItem",
            async: false,
            data: jQuery.param({ groupId: id}),
            success: function (res) {
                $('.nav-list').prepend(res);                
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
        getPageLinks();
    }

    function getInfoGroup(groupId) {
        $.ajax({
            type: "GET",
            url: "/Message/GetInfoGroup",
            async: false,
            data: jQuery.param({ groupId: groupId }),
            success: function (res) {
                console.log(res);
                renderListGroup(res.groupId, res.groupName, res.groupImg);
                getPageLinks();
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    }

    function renderMessage(groupId, sender, message, when) {
        var id = '<input type="hidden" name="personId" value="' + sender.Id + '"/>';
        var user = sender;
        var timeSend = '<input type="hidden" name="timeSend" value="' + when + '"/>';
        var userName = '<li class="user-name"><small>' + user.UserName + '</small></li>';
        var avatar = '';
        if (user.avatar != null) {
            avatar = '<div class="image"><img src="' + user.Avatar + '"/></div>';
        } else {
            avatar = '<div class="image">' + user.UserName.substring(0, 2) + '</div>';
        }
        
        var partMessage = (new RegExp('^data:image').test(message)) ? '<li class="message-item picture">' + timeSend + '<div class="image"><img src="' + message + '"/></div>' + '</li>' : '<li class="message-item">' + timeSend + message + '</li>';
        var contentMessage = '<ul class="content-message">' + userName + partMessage + '</ul>';
        
        if ($(`.${groupId} .content-chat section`).length > 0) {
            if ($(`.${groupId} .content-chat section`).first().hasClass(sender.Id)) {
                $(`.${groupId} .content-chat section`).first().children('ul').children('.message-item').first().after(partMessage);
            } else {
                if (sender.Id != $('.type-bar #userId').val()) {
                    var person = '<section class="person ' + user.Id + '">' + id + avatar + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).prepend(person);
                } else {
                    var person = '<section class="me ' + user.Id + '">' + contentMessage + '</section>';
                    $(`.${groupId} .content-chat`).prepend(person);
                }
            }
        }

        if ($(`.${groupId} .content-chat section`).length == 0) {
            if (sender.Id != $('.type-bar #userId').val()) {
                var person = '<section class="person ' + sender.Id + '">' + id + avatar + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).prepend(person);
            } else {
                var person = '<section class="me ' + sender.Id + '">' + contentMessage + '</section>';
                $(`.${groupId} .content-chat`).prepend(person);
            }
        }
    }

    function getConversation(groupId, lastTimeSend) {
        $.ajax({
            type: "GET",
            url: "/Message/GetConversation",
            data: jQuery.param({ groupId: groupId, lastTimeSend: lastTimeSend }),
            success: function (res) {
                if (res.length > 0) {
                    console.log(res);
                    $(`.${res[0].Group.GroupId} .content-chat`).empty();
                    res.forEach(function (item) {
                        renderMessage(item.Group.GroupId, item.Sender, item.Content, item.When);
                    })
                    scrollToBottom(`.${res[0].Group.GroupId} .content-chat`);
                }                
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
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
                    el.prev().prev().empty().append('<img src="' +e.target.result+'"/>');
                    el.prev().val(e.target.result);
                };
                FR.readAsDataURL(el.prop('files')[0]);
            }
        }

        
    }
    //edit group
    $('.page-container').on('click', '.uil-pen', function () {
        $(this).next().toggleClass('active');
        $(this).next().children().last().empty();
    })
    $(".img-group").change(function () {
        console.log($(this));
        convertToBase64($(this));
    });
    $('.form-edit .btn-update').on('click', function () {
        $(this).removeClass('uil-check').addClass('uil-spinner').empty();
        var group = {
            GroupId: $(this).parents('.options').prevAll().last().children('#groupId').val(),
            GroupName: $(this).prevAll().last().val() == "" ? $(this).parents('.options').prevAll().last().children('.tooltip').text() : $(this).prevAll().last().val(),
            GroupImg: $(this).prev().prev().val()
        }
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
            $(this).parent().prev().removeClass().addClass("circle selected-theme");
        } else {
            $('body').removeClass().addClass(theme);
            $(this).parent().prev().removeClass().addClass(`circle selected-theme ${theme}`);
        }
    })
    //change dark-light
    $('.navbar').on('click','.mode-view', function () {
        if ($(this).hasClass('uil-sun')) {
            $(this).removeClass('uil-sun').addClass('uil-moon');
            $('body').attr('id', 'light');
        }else{
            $(this).removeClass('uil-moon').addClass('uil-sun');
            $('body').attr('id', '');
        }
    })
})


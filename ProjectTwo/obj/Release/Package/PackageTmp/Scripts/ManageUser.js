
function addAlert(type, style, from, message) {
    var alertContent = '<div class="alert-content"><p class="from">' + from + '</p><p class="alert-details">' + message + "</p></div>";
    var icon = `<i class="uil uil-${style} ${type}"></i>`;
    $('<div class="alert-item"></div>').append(icon + alertContent).appendTo('.box-alert').addClass("active").on('animationend', function () {
        $(this).remove();
    })
}
function updateUserName(userName) {
    var success = false;
    if (userName != "") {
        $.ajax({
            type: "POST",
            url: "/Manage/UpdateUserName",
            async: false,
            data: jQuery.param({ userName: userName }),
            success: function (res) {
                if (res == "True") {
                    success = true;
                }
            },
            error: function (err) {
                console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
            }
        })
    } else {
        addAlert("danger", "info-circle", "System", "Update username successfully")
    }
    return success;
}
$(document).ready(function () {
    $('li.user-name').on('click', '.uil-pen', function () {
        $(this).removeClass("uil-pen").addClass("uil-check");
        $(this).parent().prev().prop('disabled', false).focus();
    })
    $('li.user-name').on('click', '.uil-check', function () {
        if (updateUserName($(this).parent().prev().val())) {
            $(this).removeClass("uil-check").addClass("uil-pen");
            $(this).parent().prev().prop('disabled', true);
            addAlert("success", "check", "System", "Update username successfully")
        }        
    })
    document.querySelector("#avatar").addEventListener("change", function () {
        if (this.files[0].size < 2097152) {
            if (this.files && this.files[0]) {
                var FR = new FileReader();
                FR.onload = function (e) {
                    e.preventDefault();
                    $.ajax({
                        type: "POST",
                        url: "/Manage/UpdateAvatar",
                        async: false,
                        data: jQuery.param({avatar: e.target.result}),
                        success: function (res) {
                            if (res == "True") {
                                $('.avatar-user .image').empty().append('<img src="' + e.target.result + '"/>');
                                addAlert("success","check","System","Update avatar successfully")
                            }
                        },
                        error: function (err) {
                            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                        }
                    })
                }
                FR.readAsDataURL(this.files[0]);
            }                    
        } else {
            $("#avatar").val("");
            addAlert("warning", "info-circle", "System", "Image size <= 2MB");
        }
    }, false);
})
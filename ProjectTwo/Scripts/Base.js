$(document).ready(function () {
    var PchatMode = JSON.parse(localStorage.getItem("Pchat"));
    //console.log(PchatMode);
    if (PchatMode == null) {
        saveModeTheme();
    } else {
        if (PchatMode.mode == 'uil-sun') {
            $('body').prop('id', 'light');
            $('.mode-view').removeClass('uil-sun').addClass('uil-moon');
        }
        $('body').addClass(PchatMode.theme);
        $('.selected-theme').removeClass().addClass(`${PchatMode.theme} circle selected-theme`)
    }
    function saveModeTheme() {
        var modeTheme = {
            mode: $('.mode-view').hasClass('uil-moon') ? "uil-sun" : "uil-moon",
            theme: $('.selected-theme')[0].classList[0]
        };
        localStorage.setItem("Pchat", JSON.stringify(modeTheme));
    }
    $('.navbar').on('click', '.mode-view,.circle', function () {
        setTimeout(saveModeTheme, 300);
    })
})
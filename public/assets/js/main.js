/* Listeners*/
$(window).on('resize', function () {
    resizeText();
})

const question = {
    select: (index = 0) => {
        $($(".answers .answer")[index]).addClass("selected");
        $(".answers").addClass("selected");
    },
    result: () => {

    },
    set: (data) => {
        $(".answers").removeClass("selected");
        let listHTML;
        data.forEach(e => {
            listHTML += `<div class="answer"><span>${e}</span></div>`;
        });
        $(".answers").html(listHTML);
    }
}
function progress(val1, val2 = false) {
    let percentage;
    if (!val2)
        percentage = val1;

    else
        percentage = (val1 / val2) * 100;

    /* Set Values */
    $("body").get(0).style.setProperty("--progress-val", `${percentage}%`);
    $("body").get(0).style.setProperty("--progress-text", `"${val1} / ${val2 || 100}"`);
}


/* Extras */
function resizeText() {
    var text = $(".question h1");
    var initial = 50;

    text.css("font-size", initial);
    while (text.height() > 61)
        text.css("font-size", initial -= 0.5);
}
const delay = ms => new Promise(res => setTimeout(res, ms));

/* Listeners*/
let api
$(document).ready(async () => {
    api = await new seguramente();
    let res = await api.start(_c.get("nonce") || false);
    if (res.error)
        ehandler(res);
    else
        actions.get();
})

$(window).on('resize', function () {
    resizeText();
})

/* API Class Handlers */
const actions = {
    submit: async (index) => {
        question.select(index);
        let res = await api.question.send(index);
        if (!ehandler(res)) {
            if (!res.data.isFinished) {
                question.result(res.data.isValid);
                setTimeout(() => {
                    actions.get()
                }, 5000)
            } else {
                // !TODO fininshed page
                question.finish([])
            }
        }
    },
    get: async () => {
        let res = await api.question.get();
        if (!ehandler(res)) {
            // Set progress
            progress(res.data.current, res.data.max)
            // Set question and options
            question.set.question(res.data.question);
            question.set.options(res.data.options);
        } else {
            // !TODO fininshed page
        }
    }
}

/* UI Handlers */
const question = {
    select: (index = 0) => {
        $($(".answers .answer")[index]).addClass("selected");
        $(".answers").addClass("selected");
    },
    result: () => {

    },
    set: {
        options: (data) => {
            $(".answers").removeClass("selected");
            let listHTML = '';
            data.forEach(e => {
                listHTML += `<div class="answer"><span>${e}</span></div>`;
            });
            $(".answers").html(listHTML);
            $(".answer").click((e) => {
                actions.submit($(e.currentTarget).index())
            })
        },
        question: (quest) => {
            $(".question").html(`<h1>${quest}</h1>`);
            resizeText();
        }
    },
    finish: (data) => { // Show finished screen
        alert("Quiz terminado!")
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

/* ERROR handler */
function ehandler(robj) {
    if (robj.error === false)
        return false;

    let error = 'Erro desconhecido';
    if (robj.msg)
        error = robj.msg;

    // !TODO show err
    alert(error);

    return true;
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

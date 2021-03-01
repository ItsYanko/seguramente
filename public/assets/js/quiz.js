let isMobile = false;

/* Listeners*/
let api
$(document).ready(async () => {
    /* Mobile Detection */
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
        $("html").addClass("mobile");
        $(".cursor").hide();
    }

    api = await new seguramente();
    let res = await api.start(_c.get("nonce") || false);
    if (res.error)
        ehandler(res);
    else
        actions.get();

})

$(window).on('contextmenu', e => {
    e.preventDefault()
})

$(window).on('resize', () => {
    resizeText();
})

/* Custom Cursor */
$(window).on('mousemove', (e) => {
    if (!isMobile) {
        if ($(e.target).hasClass("answer") || $(e.target).parent().hasClass("answer") || $(e.target).is("a"))
            $(".cursor").addClass("hover");
        else
            $(".cursor").removeClass("hover");

        if ($(window).width() >= e.pageX + $(".cursor").width())
            $(".cursor").css('left', e.pageX);

        if ($(window).height() >= e.pageY + $(".cursor").height())
            $(".cursor").css('top', e.pageY);
    }
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
                }, 2500)
            } else {
                question.result(res.data.isValid);
                setTimeout(() => {
                    question.finish()
                }, 2500)
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
    result: (valid) => {
        if (valid)
            $(".answer.selected").addClass("correct");
        else
            $(".answer.selected").addClass("incorrect");
    },
    set: {
        options: (data) => {
            $(".answers").removeClass("selected");
            let listHTML = '';
            data.forEach(e => {
                listHTML += `<div class="answer" tabindex="0"><span>${e}</span></div>`;
            });
            $(".answers").html(listHTML);
            $(".answer").click((e) => {
                if (!$(e.currentTarget).hasClass("selected")) {
                    actions.submit($(e.currentTarget).index())
                }
            })
        },
        question: (quest) => {
            $(".question").html(`<h1>${quest}</h1>`);
            resizeText();
        }
    },
    finish: (data) => { // Show finished screen
        window.location.href = `/resposta/${api.data.nonce}`
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

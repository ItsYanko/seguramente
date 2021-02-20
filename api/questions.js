const questions = require("../questions.json");
let sessionAPI;

module.exports = {
    getCurrent: async (nonce) => {
        if (!await checkNonce(nonce))
            return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

        let res = await sessionAPI.get(nonce);
        if (res.data.finished)
            return { error: true, msg: "Não foi possível obter a pergunta: este quiz já foi terminado" }

        let question = questions.find(q => { return q.index == res.data.order[res.data.current] });
        return {
            error: false,
            data: {
                index: res.data.order[res.data.current],
                question: question.question,
                options: question.options
            }
        };
    },
    submitAnswer: async (nonce, answerIndex = -1) => {
        if (!await checkNonce(nonce))
            return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

        let res = await sessionAPI.get(nonce);
        if (res.data.finished)
            return { error: true, msg: "Não foi possível submeter a resposta: este quiz já foi terminado" }
        const question = questions.find(q => { return q.index == res.data.order[res.data.current] });

        if (answerIndex < 0 || answerIndex >= question.options.length)
            return { error: true, msg: "Opção inválida!" };

        const valid = question.correct == answerIndex;

        if (res.data.current + 1 < questions.length) {
            res.data.current = res.data.current + 1;
        } else {
            res.data.finished = true;
        }

        console.log(`${res.data.current} < ${questions.length} = ${res.data.current < questions.length}`)
        res.data.results[question.index] = valid;
        await sessionAPI.update(nonce, res.data);

        console.log(res.data);

        return { error: false, isValid: valid, isFinished: res.data.finished };
    },
    info: {
        global: async () => {
            return {
                error: false, data: {
                    questions: questions.length
                }
            }
        },
        nonce: async (nonce) => {
            if (!await checkNonce(nonce))
                return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

            let res = await sessionAPI.get(nonce);
            const data = {
                name: res.data.name,
                nonce: res.data.nonce,
                created: res.data.created,
                current: res.data.current,
                results: res.data.results,
                finished: res.data.finished
            }
            return { error: false, data: data }
        }
    },
    load: async (_sapi) => {
        sessionAPI = _sapi;
        return true;
    }
}

async function checkNonce(nonce) {
    let res = await sessionAPI.get(nonce);
    if (res.error)
        return false;
    else
        return true;
}
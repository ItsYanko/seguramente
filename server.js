const fs = require('fs')
const express = require("express");
const cookieParser = require('cookie-parser')
let app = express();

/* APIs internos */
const sessions = require("./api/sessions");
const questions = require("./api/questions");
const questionsJSON = require("./questions.json");
const { json } = require("body-parser");

/* Ficheiros Estáticos */
app.use(cookieParser());
app.use(express.static("public"));

/* API */
app.get("/api/*", async (req, res) => {
    const action = req.path.replace("/api/", "");

    switch (action) {
        case "": {
            res.json({ error: false, status: "OK" });
            break;
        }

        case "session/get": {
            let _res = await sessions.get(req.query.nonce || req.cookies.nonce);
            if (_res.error) {
                res.cookie('nonce', '');
                res.json({ error: true, msg: _res.msg || "Sessão inválida", valid: false });
            } else {
                const sendData = {
                    nonce: _res.data.nonce,
                    name: _res.data.name,
                    created: _res.created,
                    results: _res.data.results,
                    finished: _res.data.finished,
                }
                res.json({ error: false, data: sendData, valid: true });
            }
            break;
        }

        case "session/create": {
            let _res = await sessions.create(req.query.name);
            if (_res.error) {
                res.json({ error: true, msg: _res.msg || "Erro ao inicializar o jogo. Tente limpar os cookies." });
            } else {
                res.cookie('nonce', _res.nonce);
                res.json({ error: false, nonce: _res.nonce });
            }
            break;
        }

        case "question/get": {
            let _res = await questions.getCurrent(req.cookies.nonce);
            if (_res.error) {
                res.json({ error: true, msg: _res.msg || "Erro ao obter pergunta" });
            } else {
                res.json({ error: false, data: _res.data });
            }
            break;
        }

        case "question/submit": {
            let _res = await questions.submitAnswer(req.cookies.nonce, req.query.option);
            if (_res.error) {
                res.json({ error: true, msg: _res.msg || "Erro a submeter resposta" });
            } else {
                res.json(_res);
            }
            break;
        }

        default:
            res.json({ error: true, msg: "Endpoint Inválido" });
            break;
    }
});

app.get("/resposta/*", async (req, res) => {
    const nonce = req.path.replace('/resposta/', '');
    let data = await sessions.get(nonce);
    if (data.error || !data.data.finished) {
        res.sendFile(__dirname + "/pages/unknown.html");
    } else {
        fs.readFile(__dirname + '/pages/response.html', 'utf8', function (err, _doc) {
            if (err)
                res.json(err)

            let results = data.data.results;
            let resultsData = { correct: 0, total: 0 };
            let ansHTML = ''
            Object.keys(results).forEach(k => {
                resultsData.total++
                if (results[k])
                    resultsData.correct++

                ansHTML += `<span class="${(results[k]) ? "correct" : "incorrect"}">${questionsJSON.find(e => { return e.index == k }).question}</span>`
            })

            let edited = _doc.replace('~nome~', data.data.name);
            edited = edited.replace('~rank~', "");
            edited = edited.replace(`"~c_perc~"`, resultsData.correct / resultsData.total * 100 + '%');
            edited = edited.replace('~c/t~', `${resultsData.correct} / ${resultsData.total}`);
            edited = edited.replace('~answers~', ansHTML);
            res.send(edited);
        });
    }
});

/* 404 */
app.all("*", (req, res) => {
    res.sendFile(__dirname + "/pages/404.html")
});

/* Inicialização */

(async () => {
    await sessions.load();
    await questions.load(sessions);
    app.listen(3005);
})();
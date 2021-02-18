const express = require("express");
const cookieParser = require('cookie-parser')
let app = express();

/* APIs internos */
const sessions = require("./api/sessions");
const questions = require("./api/questions");
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
            let _res = await sessions.get(req.cookies.nonce);
            if (_res.error) {
                res.cookie('nonce', '');
                res.json({ error: true, msg: _res.msg || "Sessão inválida", valid: false });
            } else {
                const sendData = {
                    nonce: _res.data,
                    name: _res.name,
                    created: _res.created
                }
                res.json({ error: false, data: _res.data, valid: true });
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

        case "question/info/global": {
            let _res = await questions.info.global();
            if (_res.error) {
                res.json({ error: true, msg: _res.msg || "Erro ao obter informação." })
            } else {
                res.json({ error: false, data: _res.data });
            }
            break;
        }

        case "question/info/nonce": {
            let _res = await questions.info.nonce(req.cookies.nonce);
            if (_res.error) {
                res.json({ error: true, msg: _res.msg || "Erro ao obter informação." })
            } else {
                res.json({ error: false, data: _res.data });
            }
            break;
        }
        default:
            res.json({ error: true, msg: "Endpoint Inválido" });
            break;
    }
});

/* Inicialização */
(async () => {
    await sessions.load();
    await questions.load(sessions);
    app.listen(3005);
})();
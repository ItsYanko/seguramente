const storage = require('node-persist');
const ms = require("ms");
const questions = require("../questions.json");

/* Configurações */
let timeout = ms("15m");

/* Variáveis */
let keycache = []; // Guarda os NONCES existentes

module.exports = {
    create: async () => {
        let nonce = false;
        do {
            let _nonce = crypto.randomBytes(16).toString('hex')
            if (!keycache.includes(_nonce))
                nonce = _nonce;
        } while (!nonce)

        let shuffled = shuffleArray(questions);

        await storage.setItem(`session-${nonce}`, {
            nonce: nonce,
            created: Date.now(),
            order: shuffled.map(q => q.index)
        })
    },
    get: async (nonce) => {
        if (!keycache.includes(nonce))
            return { error: true, msg: "Sessão inválida" }
    },
    remove: async (nonce) => {
        let cacheIndex = keycache.indexOf(nonce);
        if (cacheIndex >= 0)
            keycache.splice(cacheIndex, 1);

        await storage.removeItem(`session-${nonce}`);
        return { error: false }
    },
    load: async () => {
        await storage.init();
        await storage.forEach(e => {
            if (e.key.startsWith("session-")) {
                keycache.push(e.value.nonce);
                setDeleteTimeout(e.value.nonce, e.value.created + timeout);
            }
        })
        return true;
    }
}

/* Funções Extra */
function shuffleArray(array) {
    let _new = JSON.parse(JSON.stringify(array)); // Unlink
    for (var i = _new.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = _new[i];
        _new[i] = _new[j];
        _new[j] = temp;
    }
    return _new;
}

function setDeleteTimeout(nonce, endtime) {
    let time = endtime - Date.now();
    if (time <= 0)
        time = 0;

    setTimeout(() => {
        (function () {
            let _nc = nonce;
            module.exports.remove(_nc)
        })
    }, time);
}
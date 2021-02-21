const storage = require('node-persist');
const crypto = require('crypto');
const ms = require("ms");
const questions = require("../questions.json");

/* Configurações */
let timeout = ms("15m");

/* Variáveis */
let keycache = []; // Guarda os NONCES existentes
let deletecache = {}; // Guarda os IDs dos timeouts das sessões || ESTRUTURA {nonce: id, nonce2: id2, ...}

module.exports = {
    create: async (name) => {
        let now = Date.now();
        let nonce = false;
        do {
            let _nonce = crypto.randomBytes(16).toString('hex')
            if (!keycache.includes(_nonce))
                nonce = _nonce;
        } while (!nonce)

        let shuffled = shuffleArray(questions);

        await storage.setItem(`session-${nonce}`, {
            name: name || "Sem Nome",
            nonce: nonce,
            created: now,
            order: shuffled.map(q => q.index),
            current: 0,
            results: {},
            finished: false
        })
        keycache.push(nonce);

        setDeleteTimeout(nonce, now + timeout);

        return { error: false, nonce: nonce }
    },
    get: async (nonce) => {
        if (!keycache.includes(nonce))
            return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

        let res = await storage.getItem(`session-${nonce}`);

        if (!res)
            return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

        return { error: false, data: res }
    },
    update: async (nonce, newData) => {
        if (!keycache.includes(nonce))
            return { error: true, msg: "Sessão inválida. Experimente atualizar a página" };

        await storage.updateItem(`session-${nonce}`, newData);

        return { error: false }
    },
    remove: async (nonce) => {
        let cacheIndex = keycache.indexOf(nonce);
        if (cacheIndex >= 0)
            keycache.splice(cacheIndex, 1);

        await storage.removeItem(`session-${nonce}`);
        return { error: false }
    },
    /* Carregar da storage */
    load: async () => {
        await storage.init();
        await storage.forEach(e => {
            if (e.key.startsWith("session-")) {
                keycache.push(e.value.nonce);
                if (!e.value.finished) {
                    setDeleteTimeout(e.value.nonce, e.value.created + timeout);
                }
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
        time = 1;

    deletecache[nonce] = setTimeout(() => {
        (async function () {
            let _nc = nonce;
            delete deletecache[_nc];

            const info = await module.exports.get(_nc);
            let del = false;
            if (info.error || !info.data) {
                del = true
            } else if (!info.data.finished) {
                del = true;
            }

            if (del)
                await module.exports.remove(_nc);
        })();
    }, time);
}
class seguramente {
    data = {
        api: "/api/",
        active: false,
        nonce: false
    }
    constructor() {
        return (async () => {
            try {
                let res = await $.get(`${this.data.api}`).promise();
                if (res.error || res.status != "OK") {
                    return { error: true, msg: res.msg || "Erro no servidor!" }
                } else {
                    this.data.active = true
                    return this;
                }
            } catch (e) {
                return { error: true, msg: "Erro ao ligar ao servidor!" }
            }
        })();
    }

    async start(nonce = false, force = false, name = false) {
        if (this.data.nonce && !force)
            return { error: true, msg: "Já existe uma sessão ativa" }

        if (!nonce) {
            try {
                let res = await $.get(`${this.data.api}session/create`, {name: name || false}).promise();
                if (res.error) {
                    return { error: true, msg: res.msg || "Erro ao criar sessão" }
                } else {
                    this.data.nonce = res.nonce || false;
                    return { error: false }
                }
            } catch (e) {
                console.error(e);
                return { error: true, msg: "Erro ao criar sessão" }
            }
        } else {
            try {
                let res = await $.get(`${this.data.api}session/get`, { nonce: nonce }).promise();
                if (res.error || !res.valid) {
                    return await this.start()
                } else {
                    if (res.data.finished) {
                        return await this.start(false, true)
                    } else {
                        _c.set("nonce", nonce)
                        this.data.nonce = nonce;
                        return { error: false }
                    }
                }
            } catch (e) {
                return await this.start()
            }
        }
    }

    question = {
        get: async () => {
            if (!this.data.nonce)
                return { error: true, msg: "Sessão inativa" }
            try {
                let res = await $.get(`${this.data.api}question/get`).promise();
                if (res.error) {
                    return { error: true, msg: res.msg || "Erro ao obter pergunta" }
                } else {
                    return {
                        error: false,
                        data: {
                            current: res.data.index + 1,
                            max: res.data.of,
                            question: res.data.question,
                            options: res.data.options
                        }
                    }
                }
            } catch (e) {
                return { error: true, msg: "Erro ao obter pergunta" }
            }
        },

        send: async (choice) => {
            if (!this.data.nonce)
                return { error: true, msg: "Sessão inativa" }

            try {
                let res = await $.get(`${this.data.api}question/submit`, { option: choice }).promise();
                if (res.error) {
                    return { error: true, msg: res.msg || "Erro ao sumbeter pergunta" }
                } else {
                    return { error: false, data: res.data }
                }
            } catch (e) {
                return { error: true, msg: "Erro ao submeter pergunta" }
            }
        }
    }
}

/* HELPER (cookie) */
const _c = {
    set(key, value, expiry) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    },
    get(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    },
    erase(key) {
        var keyValue = getCookie(key);
        setCookie(key, keyValue, '-1');
    }
}

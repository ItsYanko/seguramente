const express = require("express");
const crypto = require('crypto');
let app = express();

app.use(express.static("public"))

/* API */
app.get("/api/*", (req, res) => {
    const action = req.path.replace("/api/", "");

    switch (action) {
        case "": {
            res.json({ error: false, status: "OK" });
            break;
        }

        case "session/check": {
            break;
        }

        default:
            res.json({ error: true, msg: "Endpoint Inválido" });
            break;
    }
})

app.listen(3005);
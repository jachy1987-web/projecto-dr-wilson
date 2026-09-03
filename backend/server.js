const express = require("express");

const app = express();

const PORT = 3001;

app.get("/", function(req, res) {
    res.send("Servidor de Doctor Wilson funcionando correctamente");
});

app.listen(PORT, function() {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
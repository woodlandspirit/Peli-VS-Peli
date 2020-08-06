const con = require('../lib/conexionbd');

function cargarActores (req, res) {
    let sql = 'SELECT * FROM actor;';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        res.send(JSON.stringify(result));
    });
}

module.exports = {
    cargarActores: cargarActores
}
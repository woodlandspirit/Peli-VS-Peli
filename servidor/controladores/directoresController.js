const con = require('../lib/conexionbd');

function cargarDirectores (req, res) {
    let sql = 'SELECT * FROM director;';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        res.send(JSON.stringify(result));
    });
}

module.exports = {
    cargarDirectores: cargarDirectores
}
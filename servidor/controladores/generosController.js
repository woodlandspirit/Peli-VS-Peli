const con = require('../lib/conexionbd');

function cargarGeneros (req, res) {
    let sql = 'SELECT * FROM genero;';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        res.send(JSON.stringify(result));
    });
}

module.exports = {
    cargarGeneros: cargarGeneros
}
const con = require('../lib/conexionbd');

function mostrarCompetencias (req, res) {
    let sql = 'SELECT * FROM competencia;'
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Ocurrió un error recuperando la lista de competencias.', error.message);
            return res.status(500).send('Ocurrió un error recuperando la lista de competencias.')
        }
        res.send(JSON.stringify(result));
    });
}

function elegirCandidatas (req, res) {
    // Primero obtengo la competencia desde la base de datos.
    const idCompetencia = req.params.id;

    let consulta_competencia = 'SELECT * FROM competencia WHERE id = ' + idCompetencia; + ';';
    con.query(consulta_competencia, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor ', error.message);
            return res.status(500).send('Error de servidor.');
        }
        if (result.length === 0) {
            console.log('No se encontró ninguna competencia con ese id.');
            return res.status(404).send('No se encontró ninguna competencia con ese id.')
        }
        // Armo la consulta eligiendo dos películas al azar.
        const competencia = result[0]
        let sql = 'SELECT pelicula.id, pelicula.poster, pelicula.titulo FROM pelicula', join = '', where = '';
        if (competencia.genero_id) {
            where += ' WHERE pelicula.genero_id  = ' + competencia.genero_id;
        }
        if (competencia.director_id) {
            join += ' LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id';
            if (where.length > 0) {
                where += ' AND ';
            } else {
                where += ' WHERE ';
            }
            where += 'director_pelicula.director_id  = ' + competencia.director_id;
        }
        if (competencia.actor_id) {
            join += ' LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id';
            if (where.length > 0) {
                where += ' AND ';
            } else {
                where += ' WHERE ';
            }
            where += 'actor_pelicula.actor_id  = ' + competencia.actor_id;
        }

        sql += join + where + ' ORDER BY RAND() LIMIT 2;';
        // Envío la consulta y devuelvo las películas candidatas.
        con.query(sql, function (error, result, fields) {
            if (error) {
                console.log('Ocurrió un error recuperando las películas candidatas.', error.message);
                return res.status(500).send('Ocurrió un error recuperando las películas candidatas.');
            }
        const response = {
            'competencia': competencia.nombre,
            'peliculas': result
        };
        res.send(JSON.stringify(response));
        });
    })
}

function agregarVoto (req, res) {
    // Primero obtengo la competencia desde la base de datos.
    const idCompetencia = req.params.id;
    const idPelicula = req.body.idPelicula;

    let sql = 'SELECT * FROM competencia WHERE id =' + idCompetencia + ';';
    con.query(sql, function (error, result, fields) {
            if (error) {
                console.log('Error de servidor.', error.message);
                return res.status(500).send('Error de servidor.');
            }
            if (result.length === 0) {
                console.log('No se encontró ninguna competencia con el id = ' + idCompetencia);
                return res.status(404).send('No se encontró ninguna competencia con ese id.');
            }

            // Se elige la película.
            sql = 'SELECT * FROM pelicula WHERE id = ' + idPelicula + ';';
            con.query (sql, function (error, result, fields) {
                if (error) {
                    console.log('Ocurrió un error al seleccionar la película.', error.message);
                    return res.status(500).send('Ocurrió un error al seleccionar la película.');
                }
                if (result.length === 0) {
                    console.log('No se encontró ninguna película con el id = ' + idPelicula);
                    return res.status(404).send('No se encontró ninguna película con ese id.');
                }
                // Se envía el voto de la película elegida.
                sql = 'INSERT INTO votos (competencia_id, pelicula_id) VALUES (' + idCompetencia + ',' + idPelicula +');';
                con.query(sql, function (error, result, fields){
                    if (error) {
                        console.log('Error en la inserción del voto.', error.message);
                        return res.status(500).send('Tu voto no pudo enviarse. Inténtalo nuevamente.');
                    }
                    res.status(200).send('Voto agregado correctamente.');
                });
            });
    });
}

function lasTresMasVotadas (req, res) {
    // Primero obtengo la competencia desde la base de datos.
    const idCompetencia = req.params.id;

    let sql = 'SELECT * FROM competencia WHERE id = ' + idCompetencia + ';';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        if (result.length === 0) {
            console.log('No se encontró ninguna competencia con el id = ' + idCompetencia);
            return res.status(404).send('No se encontró ninguna competencia con ese id.');
        }
        // Consulto las tres películas más votadas de la competencia y las envío al front-end.
        let competencia = result[0];
        let sql = 'SELECT pelicula.poster, pelicula.titulo, votos.pelicula_id, COUNT(pelicula_id) AS votos FROM votos\
        LEFT JOIN pelicula ON votos.pelicula_id = pelicula.id WHERE votos.competencia_id = ' + idCompetencia + ' GROUP\
        BY votos.pelicula_id ORDER BY votos DESC LIMIT 3';
        con.query(sql, function( error, result, fields){
            if (error) {
                console.log('Ocurrió un error al recuperar las películas más votadas.', error.message);
                res.status(500).send('Ocurrió un error al recuperar las películas más votadas.');
            }
            const response = {
                'competencia': competencia.nombre,
                'resultados': result
            }
            res.send(JSON.stringify(response));
        });
    });
}

module.exports = {
    mostrarCompetencias: mostrarCompetencias,
    elegirCandidatas: elegirCandidatas,
    agregarVoto: agregarVoto,
    lasTresMasVotadas: lasTresMasVotadas
};
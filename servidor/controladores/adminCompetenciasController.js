const con = require('../lib/conexionbd');

function crearCompetencia (req, res) {
    const nombreCompetencia = req.body.nombre;
    const generoCompetencia = req.body.genero;
    const directorCompetencia = req.body.director;
    const actorCompetencia = req.body.actor;

    // Verifico que el administrador haya ingresado un nombre en la competencia.
    if(!nombreCompetencia) {
        console.log('No se ha ingresado un nombre para la competencia.');
        return res.status(422).send('Debes ingresar un nombre para la competencia.');
    }

    let sql = 'SELECT * FROM competencia WHERE nombre = "' + nombreCompetencia + '";';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Ocurrió un error recuperando la competencia creada.', error.message);
            return res.status(500).send('Ocurrió un error recuperando la competencia creada.');
        }
        // Verifico que la competencia no exista.
        if (result.length === 1) {
            console.log('Ya existe una competencia con este nombre.');
            return res.status(422).send('Ya existe una competencia con este nombre. Por favor, ingresa un nombre\
            diferente.');
        }
        // Reviso la información de las columnas 'género', 'director', y 'actor' para buscar películas que apliquen.
        let sql = 'SELECT COUNT(info_peliculas.id) AS cantidad FROM info_peliculas', where = '', columnas = 'nombre', valores = ' VALUES ("' + nombreCompetencia + '"';
        if (generoCompetencia > 0) {
            if (where.length > 0) {
                where += ' AND ';
            } else {
                where += ' WHERE ';
            }
            where += 'info_peliculas.genero_id = ' + generoCompetencia;
            columnas += ', genero_id';
            valores += ', ' + generoCompetencia;
        }
        if (directorCompetencia > 0) {
            if (where.length > 0) {
                where += ' AND ';
            } else {
                where += ' WHERE ';
            }
            where += 'info_peliculas.id_director = ' + directorCompetencia;
            columnas += ', director_id';
            valores += ', ' + directorCompetencia;
        }
        if (actorCompetencia > 0) {
            if (where.length > 0) {
                where += ' AND ';
            } else {
                where += ' WHERE ';
            }
            where += 'info_peliculas.id_actor = ' + actorCompetencia;
            columnas += ', actor_id';
            valores += ', ' + actorCompetencia;
        }

        // Construyo la consulta y verifico que haya suficientes candidatas para la competencia.
        sql += where + ';';
        con.query (sql, function (error, result, fields) {
            if (error) {
                console.log('Ocurrió un error creando la competencia.', error.message);
                return res.status(500).send('Ocurrió un error creando la competencia.');
            }
            if (result[0].cantidad === 0) {
                console.log('No existe ninguna película con los criterios seleccionados.');
                return res.status(422).send('No existe ninguna película con los criterios seleccionados.');
            }
            if (result[0].cantidad < 2) {
                console.log('No existen suficientes películas para crear la competencia.');
                return res.status(422).send('Deben existir al menos dos películas con los criterios seleccionados\
                para poder crear la competencia.');
            }
            
            sql = 'INSERT INTO competencia (' + columnas + ')' + valores + ');';
            con.query(sql, function (error, result, fields) {
                if (error) {
                    console.log('Ocurrió un error creando la competencia.', error.message);
                    return res.status(500).send('Ocurrió un error creando la competencia.');
                }
                res.status(200).send('La competencia se ha creado correctamente.');
            });
        });
    });
}

function recuperarCompetencia (req, res) {
    const idCompetencia = req.params.id; 

    let sql = 'SELECT competencia.nombre, genero.nombre AS genero_nombre, actor.nombre AS actor_nombre, director.nombre\
     AS director_nombre FROM competencia LEFT JOIN genero ON competencia.genero_id = genero.id LEFT JOIN actor ON\
      competencia.actor_id = actor.id LEFT JOIN director ON competencia.director_id = director.id WHERE\
       competencia.id = ' + idCompetencia;
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor', error.message);
            return res.status(500).send('Error de servidor.');
        }
        if (result.length === 0) {
            console.log('No se encontró ninguna competencia con el id = ' + idCompetencia);
            return res.status(404).send('No se encontró ninguna competencia con ese id.');
        }
        res.send(JSON.stringify(result[0]));    
    });
}

function reinicioVotos (req, res) {
    const idCompetencia = req.params.id;
    
    let sql = 'SELECT * FROM competencia WHERE id = ' + idCompetencia + ';';
    // Verifico que la competencia a reiniciar exista.
    con.query(sql, function(error, result, fields){
        if (error) {
            console.log('Error de servidor', error.message);
            return res.status(500).send('Error de servidor.');
        }
        if (result.length === 0) {
            console.log('No existe ninguna competencia con el id = ' + idCompetencia);
            return res.status(404).send('No se encontró ninguna competencia con ese id.');
        }

        let sql = 'DELETE FROM votos WHERE votos.competencia_id = ' + idCompetencia;
        con.query(sql, function(error, result, fields) {
            if (error) {
                console.log('Ocurrió un error al intentar eliminar los votos', error.message);
                return res.status(500).send('Ocurrió un error al intentar eliminar los votos.');
            }
            res.status(200).send('El conteo de votos se ha reseteado correctamente.');
        });
    });
}

function eliminarCompetencia (req, res) {
    const idCompetencia = req.params.id;

    let sql = 'SELECT * FROM competencia WHERE id = ' + idCompetencia;
    // Verifico que la competencia a eliminar exista.
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        if (result.length === 0) {
            console.log('No existe ninguna competencia con el id = ' + idCompetencia);
            return res.status(404).send('No se encontró ninguna competencia con ese id.');
        }

        // Elimino primero los votos asociados a la competencia para no dejar registros huérfanos.
        let sql = 'DELETE FROM votos WHERE votos.competencia_id = ' + idCompetencia + ';';
        con.query(sql, function (error, result, fields) {
            if (error) {
                console.log('Error de servidor.', error.message);
                return res.status(500).send("Error de servidor.");
            }

            // Elimino la competencia.
            let sql = 'DELETE FROM competencia WHERE competencia.id = ' + idCompetencia + ';';
            con.query(sql, function (error, result, fields) {
                if (error) {
                    console.log('Ocurrió un error al intentar eliminar la competencia.', error.message);
                    return res.status(500).send('Ocurrió un error al intentar eliminar la competencia.');
                }
                res.status(200).send('La competencia se ha eliminado correctamente.');
            });
        });
    });
}

function editarCompetencia (req, res) {
    const idCompetencia = req.params.id;
    const nombreCompetencia = req.body.nombre;
    // Controlo que el administrador haya ingresado un nombre.
    if(!nombreCompetencia) {
        console.log('Debe ingresar un nombre para la competencia.');
        return res.status(422).send('Debes ingresar un nombre para la competencia.');
    }

    let sql = 'SELECT * FROM competencia WHERE id = ' + idCompetencia + ' AND nombre = "' + nombreCompetencia + '";';
    con.query(sql, function (error, result, fields) {
        if (error) {
            console.log('Error de servidor.', error.message);
            return res.status(500).send('Error de servidor.');
        }
        // Verifico que la competencia no exista.
        if (result.length === 1) {
            console.log('Ya existe una competencia con este nombre.');
            return res.status(422).send('Ya existe una competencia con este nombre. Por favor, ingresa un nombre\
            diferente.');
        }

        let sql = 'UPDATE competencia SET nombre = "' + nombreCompetencia + '" WHERE id = ' + idCompetencia;
        con.query(sql, function (error, result, fields) {
            if (error) {
                console.log('Ocurrió un error al intentar editar la competencia.', error.message);
                return res.status(500).send('Ocurrió un error al intentar editar la competencia.');
            }
            res.status(200).send('Los cambios se han guardado correctamente.');
        });
    });
}


module.exports = {
    crearCompetencia: crearCompetencia,
    recuperarCompetencia: recuperarCompetencia,
    reinicioVotos: reinicioVotos,
    eliminarCompetencia: eliminarCompetencia,
    editarCompetencia: editarCompetencia
}
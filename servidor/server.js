// Dependencias y controladores necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var competenciasController = require('./controladores/competenciasController');
var adminCompetenciasController = require('./controladores/adminCompetenciasController');
var generosController = require('./controladores/generosController');
var actoresController = require('./controladores/actoresController');
var directoresController = require('./controladores/directoresController');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Endpoints de la aplicación con sus controladores
app.get('/competencias', competenciasController.mostrarCompetencias);
app.get('/competencias/:id/peliculas', competenciasController.elegirCandidatas);
app.get('/competencias/:id/resultados', competenciasController.lasTresMasVotadas);
app.get('/competencias/:id', adminCompetenciasController.recuperarCompetencia);
app.get('/generos', generosController.cargarGeneros);
app.get('/directores', directoresController.cargarDirectores);
app.get('/actores', actoresController.cargarActores);

app.delete('/competencias/:id/votos', adminCompetenciasController.reinicioVotos);
app.delete('/competencias/:id', adminCompetenciasController.eliminarCompetencia);

app.post('/competencias', adminCompetenciasController.crearCompetencia);
app.post('/competencias/:id/voto', competenciasController.agregarVoto);

app.put('/competencias/:id', adminCompetenciasController.editarCompetencia);

// Configuraci´ón del puerto que escuchará los pedidos de la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( 'Escuchando pedidos en el puerto ' + puerto );
});
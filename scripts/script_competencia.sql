USE competencias;

DROP TABLE IF EXISTS competencia;

CREATE TABLE competencia  (
    `id` INT NOT NULL auto_increment,
    `nombre` VARCHAR(360) NOT NULL,
    `genero_id` INT(20) unsigned,
    `director_id` INT(20) unsigned,
    `actor_id` INT(20) unsigned,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`genero_id`) REFERENCES genero(`id`),
    FOREIGN KEY (`director_id`) REFERENCES director(`id`),
    FOREIGN KEY (`actor_id`) REFERENCES actor(`id`)
);

INSERT INTO competencia VALUES (1, '¿Cuál es la mejor película animada?', 3, null, null);
INSERT INTO competencia VALUES (2, '¿Cuál es la mejor película de Christopher Nolan?', null, 3514, null);
INSERT INTO competencia VALUES (3, '¿En qué papel te parece que se destacó mejor Robin Williams?', null, null, 1712);

DROP TABLE IF EXISTS votos;

CREATE TABLE votos (
    `id` INT NOT NULL auto_increment,
    `competencia_id` INT,
    `pelicula_id` INT unsigned,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`competencia_id`) REFERENCES competencia(`id`), 
    FOREIGN KEY (`pelicula_id`) REFERENCES pelicula(`id`)
);

DROP VIEW IF EXISTS info_peliculas;

CREATE VIEW info_peliculas AS
SELECT pelicula.id, pelicula.titulo, pelicula.anio, pelicula.duracion, pelicula.director, pelicula.fecha_lanzamiento,
pelicula.puntuacion, pelicula.poster, pelicula.trama, pelicula.genero_id, pelicula.genero_string, actor.id AS id_actor, actor.nombre AS nombre_actor, director.id AS id_director, director.nombre AS nombre_director
FROM pelicula 
LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id
LEFT JOIN actor ON actor_pelicula.actor_id = actor.id
LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id
LEFT JOIN director ON director_pelicula.director_id = director.id;
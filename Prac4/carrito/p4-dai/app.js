'use strict';

const express = require('express');
const app = express();
const config = require('./config.js');


var knex = null;

function conectaBD() {
  if (knex === null) {
    var options;
    if (process.env.CUESTIONARIO_ENV === 'gae') {
      options = config.gae;
      console.log('Usando Cloud SQL (MySQL) como base de datos en Google App Engine');
    } else if (process.env.CUESTIONARIO_ENV === 'gaesqlite3') {
      options = config.gaesqlite3;
      console.log('Usando SQLite como base de datos en Google App Engine');
    } else {
      options = config.localbd;
      console.log('Usando SQLite como base de datos local');
    }
    knex = require('knex')(options);
  }
}

async function creaEsquema(res) {
  try {
    let existeTabla = await knex.schema.hasTable('cuestionarios');
    if (!existeTabla) {
      await knex.schema.createTable('cuestionarios', (tabla) => {
        tabla.increments('cuestionarioId').primary();
        tabla.string('tema', 100).notNullable();
      });
      console.log("Se ha creado la tabla cuestionarios");
    }

    if (!existeTabla) {
      await knex.schema.createTable('preguntas', (tabla) => {
        tabla.increments('preguntaId').primary();
        tabla.integer('cuestionario').unsigned().notNullable();
        tabla.foreign('cuestionario').references('cuestionarios.cuestionarioId');
        tabla.string('pregunta', 100).notNullable();
        tabla.boolean('respuesta').notNullable();
      });
      console.log("Se ha creado la tabla preguntas");
    }
    
  } catch (error) {
    console.log(`Error al crear las tablas: ${error}`);
    res.status(404).send({ result: null, error: 'error al crear la tabla; contacta con el administrador' });
  }
}

// Conectar a la base de datos y ejecutar creaEsquema antes de que el servidor comience a escuchar
async function iniciarServidor() {
  try {
    
    app.use(express.json());

    // middleware para descodificar caracteres UTF-8 en la URL:
    app.use( (req, res, next) => {
      req.url = decodeURI(req.url);
      next();
    });
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
      res.header("Access-Control-Allow-Headers", "content-type");
      next();
    });

    app.use( async (req, res, next) => {
       conectaBD();
       await creaEsquema(res);
        next();
    });
    
    const path = require('path');
    const publico = path.join(__dirname, 'public');
    app.get(config.app.base + '/', (req, res) => res.sendFile(path.join(publico, 'index.html')));
    app.use('/', express.static(publico));

    // Iniciar el servidor
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1); // Detener la aplicación si hay un error al crear el esquema
  }
}

// Llamar a iniciarServidor para arrancar la aplicación
iniciarServidor();

//OK
// Crear cuestionario
app.post(config.app.base+'/creacuestionario', async (req, res) => {
  console.log("Ruta accedida:", req.path);
  try {
    let nuevoCuestionario = req.body.tema;
    if (!nuevoCuestionario) {
      res.status(400).send({ result: null, error: 'Nombre de cuestionario no proporcionado' });
      return;
    }

    // Verificar si ya existe un cuestionario con el mismo tema
    const exists = await knex('cuestionarios').where({ tema: nuevoCuestionario }).first();
    if (exists) {
      const errorMessage = `Ya existe un cuestionario con este tema: ${exists.tema}`;
      res.status(409).send({ result: null, error: errorMessage });
      return;
    }

    const insertedRows = await knex('cuestionarios').insert({ tema: nuevoCuestionario });
    // Con SQLite y MySQL, insertedRows debería ser un array con el primer elemento siendo el ID.
    // Con PostgreSQL, necesitarías usar .returning('cuestionarioId') y configurar el entorno apropiadamente.
    const cuestionarioId = insertedRows[0]; 
    res.status(200).send({ result: { tema: nuevoCuestionario, cuestionarioId: cuestionarioId }, error: null });
  } catch (error) {
    console.log(`Error al crear el cuestionario: ${error}`);
    res.status(500).send({ result: null, error: 'Error al crear el cuestionario' });
  }
});

//OK
// Agregar pregunta a un cuestionario
// En el servidor, actualiza la ruta para incluir el parámetro `:cuestionarioId`
app.post(config.app.base+'/cuestionario/:cuestionarioId/preguntas', async (req, res) => {
  console.log("Ruta accedida:", req.path);
  try {
    let cuestionario = req.params.cuestionarioId; // Obtenemos el cuestionarioId de la URL
    let { pregunta, respuesta } = req.body;

    if (!pregunta || respuesta == null) {
      res.status(400).send({ result: null, error: 'Datos de pregunta incompletos' });
      return;
    }

    // Verificar si la pregunta ya existe
    const preguntaExistente = await knex('preguntas')
      .where({ cuestionario: cuestionario, pregunta: pregunta })
      .first();

    if (preguntaExistente) {
      return res.status(409).send({ result: null, error: 'Ese enunciado ya existe en este cuestionario' });
    }

    // Insertar y obtener el ID de la fila insertada
    const ids = await knex('preguntas').insert({
      cuestionario, // Aquí usamos el cuestionarioId en la inserción
      pregunta,
      respuesta
    });

     // Obtener el nombre del cuestionario basado en cuestionarioId
     const cuestionarioTema = await knex('cuestionarios')
     .where('cuestionarioId', cuestionario) .first(); // Usamos first() para obtener solo el primer resultado

    // Si cuestionario es undefined, no se encontró el cuestionario con ese ID
    if (!cuestionarioTema) {
    res.status(404).send({ result: null, error: 'Cuestionario no encontrado' });
    return;
    }
    console.log("Pregunta agregada con éxito para el cuestionario", cuestionarioTema.tema);

    // El ID de la nueva entrada; el método exacto dependerá de la base de datos
    const idPregunta = ids[0];
    res.status(200).send({ result: { id: idPregunta, mensaje: 'Pregunta agregada con éxito' }, error: null });
  } catch (error) {
    console.log(`Error al agregar pregunta: ${error}`);
    res.status(500).send({ result: null, error: 'Error al agregar pregunta' });
  }
});


//Ok
// Listar preguntas de un cuestionario
app.get(config.app.base + '/:cuestionario/preguntas', async (req, res) => {
  try {
    let preguntas = await knex('preguntas').select(['preguntaId','pregunta', 'respuesta'])
                                           .where('cuestionario', req.params.cuestionario);
    if (preguntas.length === 0) {
      // No hay preguntas para el cuestionario, enviamos un 204 No Content
      res.status(204).send();
    } else {
      // Hay preguntas, enviamos la lista con un 200 OK
      res.status(200).send({ result: preguntas, error: null });
    }
  } catch (error) {
    console.log(`Error al obtener preguntas: ${error}`);
    res.status(500).send({ result: null, error: 'Error al obtener preguntas' });
  }
});



//OK
//Eliminar pregunta
app.delete(config.app.base + '/cuestionario/:cuestionarioId/preguntas/:preguntaId', async (req, res)=> {
  try {
    const pregunta = await knex('preguntas').where('cuestionario', req.params.cuestionarioId) // Asegúrate de que el nombre de la columna sea cuestionarioId
    .andWhere('preguntaId', req.params.preguntaId).first();

    await knex('preguntas').where('cuestionario', req.params.cuestionarioId) // Asegúrate de que el nombre de la columna sea cuestionarioId
                           .andWhere('preguntaId', req.params.preguntaId) // Asegúrate de que el nombre de la columna sea preguntaId
                           .del();

    let cuestionario = await knex('cuestionarios').where("cuestionarioId",req.params.cuestionarioId).first();
    console.log("Borrado pregunta:", pregunta.pregunta, "del cuestionario:", cuestionario.tema );
    
    
    res.status(200).send({ result: 'ok', error: null });
  } catch (error) {
    console.log(`Error al eliminar la pregunta: ${error}`);
    res.status(404).send({ result: null, error: 'Error al eliminar la pregunta' });
  }
});

//OK
// Eliminar cuestionario
app.delete(config.app.base + '/cuestionario/:cuestionarioId', async (req, res) => {
  try {

    let cuestionario = await knex('cuestionarios').where('cuestionarioId',req.params.cuestionarioId).first();


    await knex('preguntas').where('cuestionario', req.params.cuestionarioId).del();
    await knex('cuestionarios').where('cuestionarioId', req.params.cuestionarioId).del();

    console.log("Eliminado el cuestionario", cuestionario.tema, "y sus preguntas");

    res.status(200).send({ result: 'ok', error: null });

  } catch (error) {
    console.log(`Error al eliminar el cuestionario: ${error}`);
    res.status(404).send({ result: null, error: 'Error al eliminar el cuestionario' });
  }
});

//Temas Cuestionarios
app.get(config.app.base + '/cuestionario', async (req, res) => {
  try {
    const temas = await knex('cuestionarios').select('cuestionarioId','tema');

    if (temas.length === 0) {
      // No hay cuestionarios, por lo tanto, se envía un 204 No Content.
      res.status(204).send();
    } else {
      // Hay cuestionarios, se envía la lista con un 200 OK.
      res.status(200).send({ result: temas, error: null });
    }
  } catch (error) {
    console.log(`Error al obtener los cuestionarios: ${error}`);
    res.status(500).send({ result: null, error: 'Error al obtener los cuestionarios' });
  }
});



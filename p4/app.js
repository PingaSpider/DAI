'use strict';

const express = require('express');
const app = express();

// carga y ejecuta config.js
const config = require('./config.js');

// objeto global que referencia a la librería Knex.js
var knex= null;

// inicializa Knex.js para usar diferentes bases de datos según el entorno:
function conectaBD () {
  if (knex===null) {
    var options;
    if (process.env.CARRITO_ENV === 'gae') {
      options= config.gae;
      console.log('Usando Cloud SQL (MySQL) como base de datos en Google App Engine');
    } else if (process.env.CARRITO_ENV === 'gaesqlite3') {
      options= config.gaesqlite3;
      console.log('Usando SQLite como base de datos en Google App Engine');
    } else {
      options= config.localbd;
      console.log('Usando SQLite como base de datos local');
    }
    // La siguiente opción muestra la conversión a SQL de cada consulta:
    // options.debug= true;
    knex= require('knex')(options);
  }
}


// Primero, la función creaEsquema modificada que no envía respuestas
async function creaEsquema() {
  try {
      let existeTabla = await knex.schema.hasTable('cuestionarios');
      if (!existeTabla) {
          await knex.schema.createTable('cuestionarios', (tabla) => {
              tabla.increments('cuestionarioID').primary();
              tabla.string('tema', 100).notNullable();
              tabla.string('tema_normalizado', 100).notNullable();
              tabla.unique('tema_normalizado');
          });
          console.log("Se ha creado la tabla cuestionarios");
      }

      existeTabla = await knex.schema.hasTable('preguntas');
      if (!existeTabla) {
          await knex.schema.createTable('preguntas', (tabla) => {
              tabla.increments('preguntaID').primary();
              tabla.integer('cuestionario').unsigned().notNullable();
              tabla.foreign('cuestionario').references('cuestionarioID').inTable('cuestionarios').onDelete('CASCADE');
              tabla.string('pregunta', 1000).notNullable();
              tabla.boolean('respuesta').notNullable();
              tabla.string('pregunta_normalizada', 1000).notNullable();
          });
          console.log("Se ha creado la tabla preguntas");
      }
      return { success: true, error: null };
  } catch (error) {
      console.error(`Error al crear las tablas: ${error}`);
      return { success: false, error: error };
  }
}

// Middleware modificado
app.use(async (req, res, next) => {
  try {
      conectaBD();
      const resultado = await creaEsquema();
      if (!resultado.success) {
          return res.status(500).json({
              result: null,
              error: 'Error al crear las tablas; contacta con el administrador'
          });
      }
      next();
  } catch (error) {
      console.error('Error en middleware:', error);
      return res.status(500).json({
          result: null,
          error: 'Error en el servidor; contacta con el administrador'
      });
  }
});

// convierte el cuerpo del mensaje de la petición en JSON al objeto de JavaScript req.body:
app.use(express.json());

// middleware para descodificar caracteres UTF-8 en la URL:
app.use( (req, res, next) => {
  req.url = decodeURI(req.url);
  next();
});

// middleware para las cabeceras de CORS:
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
  res.header("Access-Control-Allow-Headers", "content-type");
  next();
});


// middleware que establece la conexión con la base de datos y crea las 
// tablas si no existen; en una aplicación más compleja se crearía el
// esquema fuera del código del servidor:

//Funcion para normalizar tema
function normalizaTexto(tema){
  //Convierte el texto a minúsculas y elimina los acentos y diéresis del texto
  return tema.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

}

async function existeCuestionario(cuestionario){
  try {
      const c = await knex('cuestionarios')
          .select('tema')
          .where('cuestionarioID', cuestionario);
      return c.length > 0;
  } catch (error) {
      console.error('Error al verificar existencia del cuestionario:', error);
      return false;
  }
}

async function existeTema(tema){
  try {
      const c = await knex('cuestionarios')
          .select('tema')
          .where('tema', tema);
      return c.length > 0;
  } catch (error) {
      console.error('Error al verificar existencia del tema:', error);
      return false;
  }
}
//Crea nuevo cuestionario
app.post(config.app.base+'/cuestionarios', async (req,res) => {
  try{
    //Verificar si el cuestionario ya existe
    let existe = await existeTema(req.body.tema);
    //Si el cuestionario ya existe
    if(existe){
      res.status(409).send({
        result: null,
        error: 'El tema ' + req.body.tema + ' ya existe'
      });
      return;
    }
    //Insertar el cuestionario en la base de datos
    const temaNormalizado = normalizaTexto(req.body.tema);
    var c = {
      tema: req.body.tema,
      tema_normalizado: temaNormalizado
    };
    await knex('cuestionarios').insert(c);
    const cuestionarioID = await knex('cuestionarios').select('cuestionarioID').orderBy('cuestionarioID','desc').limit(1);
    res.status(200).send({
      result: cuestionarioID[0],
      error: null
    });
    console.log('Cuestionario creado');
  }//Si no se puede crear el cuestionario
  catch(error){
    console.log('No se puede crear el cuestionario: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo crear el cuestionario'
    });
  }
});

//Eliminar un cuestionario de la base de datos
app.delete(config.app.base+'/cuestionarios/:cuestionario', async (req,res) => {
  try{
    //Si el cuestionario no existe
    let existe = await existeCuestionario(req.params.cuestionario);
    if(!existe){
      res.status(404).send({
        result: null,
        error: 'cuestionario no existente'
      });
      return;
    }
    //Eliminar el cuestionario de la base de datos
    await knex('cuestionarios').where('cuestionarioID',req.params.cuestionario).del();
    res.status(200).send({
      result: 'cuestionario eliminado',
      error: null
    });
    console.log('Cuestionario eliminado');
  }//Si no se puede eliminar el cuestionario
  catch(error){
    console.log('No se puede eliminar el cuestionario: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo eliminar el cuestionario'
    });
  }
});

//Listar los cuestionarios
app.get(config.app.base+'/cuestionarios', async (req,res) => {
  try{
    //Obtener los cuestionarios de la base de datos (tema y id)
    const c = await knex('cuestionarios').select('tema','cuestionarioID');
    res.status(200).send({
      result: c,
      error: null
    });
  }catch(error){
    console.log('No se puede obtener los cuestionarios: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener los cuestionarios'
    });
  }
});

//Funcion para verificar si existe una pregunta
async function existePregunta(pregunta,cuestionario){
  //Normaliza el texto de la pregunta y la busca en la base de datos
  const p = await knex('preguntas').select('pregunta')
                                  .where('preguntaID',pregunta)
                                  .andWhere('cuestionario',cuestionario);
  return p.length > 0;
}

async function existeEnunciadoPregunta(pregunta,cuestionario){
  const preguntaNormalizada = normalizaTexto(pregunta)

  const p = await knex('preguntas').select('pregunta')
                                  .where('pregunta_normalizada',preguntaNormalizada)
                                  .andWhere('cuestionario',cuestionario);

   return p.length > 0;
}


//Crea nueva pregunta OK
app.post (config.app.base+'/cuestionarios/:cuestionario/preguntas', async (req,res) => {
  try{
    //Si el cuestionario no existe
    let existe = await existeCuestionario(req.params.cuestionario);
    if(!existe){
      res.status(404).send({
        result: null,
        error: 'cuestionario no existente'
      });
      return;
    }
    existe = await existeEnunciadoPregunta(req.body.pregunta,req.params.cuestionario);
    //Si la pregunta ya existe
    if(existe){
      res.status(409).send({
        result: null,
        error: 'pregunta ya existente'
      });
      return;
    }
    //Insertar la pregunta en la base de datos
    const preguntaNormalizada = normalizaTexto(req.body.pregunta);
    var p = {
      cuestionario: req.params.cuestionario,
      pregunta: req.body.pregunta,
      respuesta: req.body.respuesta,
      pregunta_normalizada: preguntaNormalizada
    };
    await knex('preguntas').insert(p);
    //Seleccionar el ultimo id de la tabla preguntas
    const preguntaID = await knex('preguntas').select('preguntaID').orderBy('preguntaID','desc').limit(1);
    res.status(200).send({
      result: preguntaID[0],
      error: null
    });
    console.log('Pregunta creada');
  }//Si no se puede crear la pregunta
  catch(error){
    console.log('No se puede crear la pregunta: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo crear la pregunta'
    });
  }
});

//Funcion para listar las preguntas de un cuestionario OK
app.get(config.app.base+'/cuestionarios/:cuestionario/preguntas', async (req,res) => {
  try{
    //Si el cuestionario no existe
    let existe = await existeCuestionario(req.params.cuestionario);
    if(!existe){
      res.status(404).send({
        result: null,
        error: 'cuestionario no existente'
      });
      return;
    }
    //Obtener las preguntas del cuestionario
    const p = await knex('preguntas').select('pregunta','respuesta','preguntaID')
                                      .where('cuestionario',req.params.cuestionario);
    res.status(200).send({
      result: p,
      error: null
    });
  }catch(error){
    console.log('No se puede obtener las preguntas: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener las preguntas'
    });
  }
});

//Eliminar una pregunta de un cuestionario
app.delete(config.app.base+'/cuestionarios/:cuestionario/preguntas/:pregunta', async (req,res) => {
  try{
    //Si el cuestionario no existe
    let existe = await existeCuestionario(req.params.cuestionario);
    if(!existe){
      res.status(404).send({
        result: null,
        error: 'cuestionario no existente'
      });
      return;
    }
    //Si la pregunta no existe
    existe = await existePregunta(req.params.pregunta,req.params.cuestionario);
    if(!existe){
      res.status(404).send({
        result: null,
        error: 'pregunta no existente'
      });
      return;
    }
    //Eliminar la pregunta de la base de datos
    await knex('preguntas').where('preguntaID',req.params.pregunta)
                           .andWhere('cuestionario',req.params.cuestionario).del();
    res.status(200).send({
      result: 'pregunta eliminada',
      error: null
    });
    //Mensaje del servidor
    console.log('Pregunta eliminada');
  }//Si no se puede eliminar la pregunta
  catch(error){
    console.log('No se puede eliminar la pregunta: $(error)');
    res.status(404).send({
      result: null,
      error: 'no se pudo eliminar la pregunta'
    });
  }
});

const path = require('path');
const publico = path.join(__dirname, 'public');
// __dirname: directorio del fichero que se está ejecutando

app.get(config.app.base+'/', (req, res) => {
  res.status(200).send('API web para gestionar carritos de la compra');
});

app.get(config.app.base+'/ayuda', (req, res) => res.sendFile(path.join(publico, 'index.html')));

app.use('/', express.static(publico));

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Aplicación lanzada en el puerto ${ PORT }!`);
});

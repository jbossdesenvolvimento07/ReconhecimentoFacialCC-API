const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const sql = require('mssql');

async function getDadosSocio(codigo) {

  var config = {
    user: process.env.P_USER,
    password: process.env.P_PASSWORD,
    server: process.env.P_SERVER,
    port: Number(process.env.P_PORT),
    database: process.env.P_DATABASE,
    requestTimeout: Number(process.env.P_REQUEST_TIMEOUT),
    options: {
      encrypt: false,
      enableArithAbort: true
    }
  };

  try {

    await sql.connect(config)
    let qry = `SELECT * FROM associados WHERE CODIGO = '${codigo}' AND DESLIGAMENTO IS NULL`
    let result = await sql.query(qry)

    return result.recordset[0]

  } catch (err) {

    throw (err)

  }
}


module.exports = async (dados, faceMatcher) => {

  let image = new Image()
  image.src = dados[0];

  try {

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const results = await detections.map((d) => faceMatcher.findBestMatch(d.descriptor))
    console.log('> Reconhecimento <')
    console.log(results)

    const associados = []

    if (results.length > 0) {

      for (let i = 0; i < results.length; i++) {

        if (results[i]._label === 'unknown') {
          associados.push({
            'foto': '',
            'dados': 'unknown',
            'detectionData': detections[i]
          })
        }
        else {

          associados.push({
            'foto': fs.readFileSync(`../ReconhecimentoFacialCC-API-Fotos/${results[i]._label}/imagem0.txt`, 'utf-8'),
            'dados': await getDadosSocio(results[i]._label),
            'detectionData': detections[i]
          })


        }

      }

    }

    return associados



  } catch (err) {
    throw (err)

  }

}
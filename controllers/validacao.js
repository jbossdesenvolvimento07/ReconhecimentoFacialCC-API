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

    // Verifica se existe algum ingresso para o associado
    qry = ` SELECT 
              ew.nome nomeEvento, 
              st.descricao nomeIngresso,
              t.descricao nomeSubingresso
            FROM dbo.EventosEntradas ee
            INNER JOIN dbo.EventosWeb ew ON ee.idEvento = ew.id 
            INNER JOIN dbo.EventoSubTiposIngresso st ON ee.idSubTipoIngresso = st.id 
            INNER JOIN dbo.EventoTiposIngresso t ON st.idTipo  = t.id 
            WHERE ee.codigoAssociado = '${codigo}' AND ee.status = 'S' AND 
              MONTH(ee.data) = MONTH(GETDATE()) AND YEAR(ee.data) = YEAR(GETDATE()) AND DAY(ee.data) = DAY(GETDATE())`
    let result2 = await sql.query(qry)

    return { 
      dadosSocio: result.recordset[0], 
      dadosIngressos: result2.recordset.length > 0 ? result2.recordset : null 
    }

  } catch (err) {

    throw (err)

  }
}


module.exports = async (dados, faceMatcher) => {

  try {

    let image = new Image()
    image.src = dados[0];

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
            'ingressos': null
            // 'detectionData': detections[i]
          })
        }
        else {
          let dados = await getDadosSocio(results[i]._label)

          associados.push({
            'foto': fs.readFileSync(`../ReconhecimentoFacialCC-API-Fotos/${results[i]._label}/imagem0.txt`, 'utf-8'),
            'dados': dados.dadosSocio,
            'ingressos': dados.dadosIngressos
            // 'detectionData': detections[i]
          })


        }

      }

    }

    return associados

  } catch (err) {
    console.log(err)
  }

}
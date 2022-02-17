const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const sql = require('mssql');

async function getDadosSocio(codigo){

    var config = {
        user: 'jboss.consulta.06',
        password: 'consulta06@jboss',
        server: 'ccclube.no-ip.biz',
        port: 1433,
        database: 'CCONLINE_OLD',
        requestTimeout: 60000,
        options: {
            encrypt: false,
            enableArithAbort: true
        }
    };

    try{

        await sql.connect(config)
        let qry = `SELECT * FROM associados WHERE CODIGO = '${codigo}'`
        let result = await sql.query(qry)

        return result.recordset[0]

    }catch(err){

        throw(err)

    }
}

module.exports = async (req, res, dados, faceMatcher) => {
    
    let image = new Image()
    image.src = dados[0];

    console.log('Imagem convertida... ')

    try{

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        console.log('Face detectada...')
        const results = await detections.map( (d) => faceMatcher.findBestMatch(d.descriptor))
        console.log('> Reconhecimento <')
        console.log(results)

        res.set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
        });
    

        const images = []
        const dadosSocio = []
        if(results.length > 0 ){

            for (let i = 0; i < results.length; i++) {
                
                if(results[i]._label === 'unknown')
                    images.push('')
                else{
                    images.push(fs.readFileSync(`D:/ReconhecimentoFacialCC-API/fotos/${results[i]._label}/imagem0.txt`, 'utf-8'))
                    dadosSocio.push(await getDadosSocio(results[i]._label))

                }
                
            }

            res.send([images, dadosSocio, results])
        }
        else {
            res.send([images, dadosSocio, [{'_label': 'notFound', '_distance': '0.0'}]])
        }

    }catch (err){

        throw(err)

    }

}
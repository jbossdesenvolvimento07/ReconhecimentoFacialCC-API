const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const sql = require('mssql');

async function getDadosSocio() {

    var config = {
        user: 'jboss.consulta.06',
        password: 'consulta06@jboss',
        server: 'encopelx.no-ip.biz',
        port: 5023,
        database: 'JM2Online_OLD',
        requestTimeout: 60000,
        options: {
            encrypt: false,
            enableArithAbort: true
        }
    };



    try{

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `SELECT * FROM Entidades WHERE dbo.ExtractInteger(cnpjCPF) = cpf AND dataFinal IS NULL`
        let result = await sql.query(qry)

        console.log(result)

    }catch(err){

        throw(err)

    }

}

module.exports = async (req, res, dados, faceMatcher) => {

    let image = new Image()
    image.src = dados[0];

    console.log('Imagem convertida... ')

    try {

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        console.log('Face detectada...')
        const results = await detections.map((d) => faceMatcher.findBestMatch(d.descriptor))
        console.log('> Reconhecimento <')
        console.log(results)

        res.set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
        });


        const images = []
        if (results.length > 0) {

            for (let i = 0; i < results.length; i++) {

                images.push(fs.readFileSync(`D:/ReconhecimentoFacialCC-API/fotos/${results[i]._label}/imagem0.txt`, 'utf-8'))

            }

            res.send([images, results])
        }
        else {
            res.send([images, [{ '_label': 'notFound', '_distance': '0.0' }]])
        }

    } catch (err) {

        throw (err)

    }

}
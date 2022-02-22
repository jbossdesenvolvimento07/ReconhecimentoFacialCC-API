const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const sql = require('mssql')


async function cadastrarNoBanco(dados){
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

    //Status: A = Ativo
    await sql.connect(config)
    let qry = `INSERT INTO ReconhecimentoFacial(codigoAssociado, dataCadastro, status) VALUES('${dados[0]}', GETDATE(), 'A' );`
    sql.query(qry)

}

function salvarFotos(dados){
    if (!fs.existsSync(`./fotos/${dados[0]}`)){
        fs.mkdirSync(`./fotos/${dados[0]}`);
    }

    for (let i = 0; i < dados[1].length; i++) {
        fs.writeFile(`./fotos/${dados[0]}/imagem${i}.txt`, dados[1][i], (err) => {
            if(err) {
                return console.log(err);
            }
            console.log("Foto Salva");
        });
    }
}


module.exports = async (req, res, dados) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });


    const label = dados[0];
    const dataUrls = dados[1];


    const descriptions = [];
    let image = new Image()
    let detections = []

    try{

        for (let i = 0; i < dataUrls.length; i++) {
            
            image.src = dataUrls[i]

            detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor)
            
        }
        

        const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)

        res.send([dataUrls , {"Status": "Cadastrado"}])

        salvarFotos(dados)

        cadastrarNoBanco(dados)

        return newPerson

    }catch(err) {

        res.send([dataUrls , {"Status": "Falha"}])

        throw(err)
    }

    
    
}
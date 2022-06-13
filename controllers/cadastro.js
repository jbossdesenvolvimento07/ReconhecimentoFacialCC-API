const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const sql = require('mssql')


async function cadastrarNoBanco(dados){
    try{
        var config = {
            user: process.env.USER,
            password: process.env.PASSWORD,
            server: process.env.SERVER,
            port: Number(process.env.PORT),
            database: process.env.DATABASE,
            requestTimeout: Number(process.env.REQUEST_TIMEOUT),
            options: {
                encrypt: false,
                enableArithAbort: true
            }
        };        
    
        //Status: A = Ativo
        await sql.connect(config)
        let qry = `INSERT INTO ReconhecimentoFacial(codigoAssociado, dataCadastro, status) VALUES('${dados[0]}', GETDATE(), 'A' );`
        await sql.query(qry)
    }catch(err){
        throw (err)
    }
    

}

function salvarFotos(dados){
    if (!fs.existsSync(`../ReconhecimentoFacialCC-API-Fotos/${dados[0]}`)){
        fs.mkdirSync(`../ReconhecimentoFacialCC-API-Fotos/${dados[0]}`);
    }

    for (let i = 0; i < dados[1].length; i++) {
        fs.writeFile(`../ReconhecimentoFacialCC-API-Fotos/${dados[0]}/imagem${i}.txt`, dados[1][i], (err) => {
            if(err) {
                return console.log(err);
            }
            console.log("Foto Salva");
        });
    }
}


module.exports = async (dados) => {

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

        salvarFotos(dados)

        await cadastrarNoBanco(dados)

        return newPerson

    }catch(err) {

        throw(err)
    }

    
    
}
const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

        return newPerson

    }catch(err) {

        res.send([dataUrls , {"Status": "Falha"}])

        throw(err)
    }


    /*try{
       


        if (!fs.existsSync(`./fotos/${label}`)){
            fs.mkdirSync(`./fotos/${label}`);
        }

        for (let i = 0; i < dataUrls.length; i++) {
            fs.writeFile(`./fotos/${label}/imagem${i}.txt`, dataUrls[i], (err) => {
                if(err) {
                    return console.log(err);
                }
                console.log("Foto Salva");
            });
        }

        
    }*/

    
    
}
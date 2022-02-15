const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (req, res, dados) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });


    const label = dados[0];
    const dataUrls = dados[1];

    //const descriptions = [];



    let image1 = new Image()
    let image2 = new Image()
    let image3 = new Image()
    let image4 = new Image()
    let image5 = new Image()

    try{
        image1.src = dataUrls[0]
        image2.src = dataUrls[1]
        image3.src = dataUrls[2]
        image4.src = dataUrls[3]
        image5.src = dataUrls[4]

        console.log('esperando')
        await sleep(5000);
         console.log('esperado')

        const descriptions = [];

        const detections1 = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections1.descriptor)
        const detections2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections2.descriptor)
        const detections3 = await faceapi.detectSingleFace(image3).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections3.descriptor)
        const detections4 = await faceapi.detectSingleFace(image4).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections4.descriptor)
        const detections5 = await faceapi.detectSingleFace(image5).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections5.descriptor)

        const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)

        res.send([dataUrls , {"Status": "Cadastrado"}])

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
const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

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
    
        if(results.length > 0 )
            res.send([image, results])
        else
            res.send([image, [{'_label': 'notFound', '_distance': '0.0'}]])

    }catch (err){

        throw(err)

    }

}
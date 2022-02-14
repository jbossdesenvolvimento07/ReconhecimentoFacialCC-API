const faceapi = require('@vladmandic/face-api')
const canvas = require('canvas')
const fs = require('fs')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })


module.exports = async (req, res, dados) => {

    const label = dados[0];
    const dataUrls = dados[1];

    const descriptions = [];


    try{
        for (let i = 0; i < dataUrls.length; i++) {

            let image = new Image();
            image.src = dataUrls[i];

            /*let detection
            faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            .then((result) => {
                detection = result
                descriptions.push(detection.descriptor)
            })*/

            const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detection.descriptor)

            
        }

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

        
        const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)
        
        console.log(label + ' Cadastrado')



        res.set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
        });
    
        res.send([dataUrls , {"Status": "Cadastrado"}])
        

        return newPerson
        //resolve(newPerson)
    }catch (err){

        //reject()
        res.set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
        });
    
        res.send([dataUrls , {"Status": "Falha"}])

        throw(err)
    }

    
    
}
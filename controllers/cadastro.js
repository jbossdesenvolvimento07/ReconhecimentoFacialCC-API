const faceapi = require('@vladmandic/face-api')
//const { Canvas, Image, ImageData } = canvas
//faceapi.env.monkeyPatch({ Canvas, Image, ImageData })


module.exports = (req, res, dados) => {

    return new Promise((resolve, reject) => {

        const label = dados[0];
        const dataUrls = dados[1];

        const descriptions = [];

        for (let i = 0; i < dataUrls.length; i++) {

            let image = new Image();
            image.src = dataUrls[i];

            let detections
            //const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            .then((result) => detections = result)
            
            descriptions.push(detections.descriptor)
            
        }

        const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)


        resolve(newPerson)
    })

    
}
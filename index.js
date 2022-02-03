/*import express from 'express';
const app = express();

//import '@tensorflow/tfjs-node';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
const { Canvas, Image, ImageData, loadImage } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

import fs from 'fs';*/
//const tensorflow = require('@tensorflow/tfjs');
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const canvas = require('canvas')
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData, loadImage } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));



var faceMatcher;
var labeledFaceDescriptors1


app.get('/', (req, res) => {
    res.set({
        //"Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors1)
})


//
//----------------------------------------------
app.post('/adicionar', (req, res) => {

    const label = req.body.label
    const dataUrl = req.body.dataUrl

    adicionarPessoa(label, dataUrl, res)
})
async function adicionarPessoa(label, dataUrl, res){
    let image = new Image()
    image.src = dataUrl;
    
    const descriptions = []
    for (let i = 1; i <= 2; i++) {
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
    }

    const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)
    labeledFaceDescriptors1.push(newPerson)



    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });
    res.send({"Status": "Cadastrado"})

    
    // convert JSON object to string
    const data = JSON.stringify(labeledFaceDescriptors1);

    // write JSON string to a file
    fs.writeFile('C:/teste.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

}
//----------------------------------------------
//



app.post('/api/verify', (req, res) => {

    console.log('------------------------------------')
    console.log('Requisição recebida...')

    const dataUrl = req.body.dataUrl;

    detectFace(dataUrl, res)

})


const port = 3030;

app.listen(port, () => {
    console.log('Listening on port ' + port)

    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
        faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
        faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
    ]).then(start)
})



async function start() {
    console.log('Carregando....')
    //const labeledFaceDescriptors = await loadLabeledImages()

    loadFromJSON();
    //labeledFaceDescriptors1 = labeledFaceDescriptors

    console.log('Carregamento concluido....')

    //faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
   
}

async function detectFace( dataUrl, res ){

    let image = new Image()
    image.src = dataUrl;

    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors1, 0.6)
    
    console.log('Imagem convertida... ' + typeof(image))
    
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    console.log('Face detectada...')
    const results = await detections.map( (d) => faceMatcher.findBestMatch(d.descriptor))
    console.log('Reconhecimento feito...')
    console.log(results)

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });
    res.send(results)
}

function loadLabeledImages() {
    const labels = ['Vitor Bersani', 'Andre']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await canvas.loadImage(`./labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)

                console.log(`Imagem ${i} (${label}) carregada`)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

function loadFromJSON(){
    fs.readFile('C:/teste.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
    
        // parse JSON object
        labeledFaceDescriptors1 = JSON.parse(data.toString());
    
    });
}


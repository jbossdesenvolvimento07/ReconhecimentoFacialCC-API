
//const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const canvas = require('canvas')
const faceapi = require('face-api.js');

//
//Configurações do FaceApi
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })


app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));



var faceMatcher;
var labeledFaceDescriptors = [faceapi.LabeledFaceDescriptors];


//
//Endpoints

//Retorna os usuários cadastrados
app.get('/', (req, res) => {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors)
})

app.get('/salvar', (req, res) => {

    saveLabeledFaces()

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors)
})

//Adiciona Uma pessoa
app.post('/adicionar', (req, res) => {

    console.log('\nInício da requisição')
    console.log('------------------------------------')

    const label = req.body.label
    const dataUrl = req.body.dataUrl

    adicionarPessoa(label, dataUrl, res)
})

//Valida uma foto
app.post('/validar', (req, res) => {
    
    console.log('\nInício da requisição')
    console.log('------------------------------------')


    const dataUrl = req.body.dataUrl;
    detectFace(dataUrl, res);
})


//Configura o listener e carrega redes neurais
const port = 3030;
app.listen(port, () => {
    console.log('Listening on port ' + port)


    console.log('Carregando Redes Neurais...')
    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
        faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
        faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
    ]).then(start)
})

async function start() {
    console.log('Carregando Faces...')

    loadLabeledFaces();
    
    //labeledFaceDescriptors = await loadLabeledFacesFromLocalDir();

    console.log('> Carregamento concluído <')
}












async function saveLabeledFaces(){
    const data = JSON.stringify(labeledFaceDescriptors);
    fs.writeFile('C:/Projetos/ReconhecimentoFacialCC-API/labeledFaces.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("> LabeledFaces salvas em JSON <");
    });
}

function loadLabeledFaces(){
    fs.readFile('C:/Projetos/ReconhecimentoFacialCC-API/labeledFaces.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
    
        // parse JSON object

        //labeledFaceDescriptors = JSON.parse(data.toString());
        //labeledFaceDescriptors = data


        const teste = JSON.parse(data.toString());


        for (let i = 0; i < teste.length; i++) {
            const descriptions = teste[i].descriptors;
            const newPerson = new faceapi.LabeledFaceDescriptors(teste[i].label, descriptions)
            labeledFaceDescriptors.push(newPerson)

            console.log('CADASTRADO')
        }


    
    });
}










async function adicionarPessoa(label, dataUrl, res){
    let image = new Image()
    image.src = dataUrl;
    
    const descriptions = []
    for (let i = 1; i <= 2; i++) {
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
    }

    const newPerson = new faceapi.LabeledFaceDescriptors(label, descriptions)
    labeledFaceDescriptors.push(newPerson)

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });
    res.send({"Status": "Cadastrado"})


    saveLabeledFaces();
}

async function detectFace( dataUrl, res ){

    let image = new Image()
    image.src = dataUrl;

    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    
    console.log('Imagem convertida... ')
    
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
    res.send(results)
}























function loadLabeledFacesFromLocalDir() {
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

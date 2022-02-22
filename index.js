
const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const canvas = require('canvas')
//const faceapi = require('face-api.js');
const faceapi = require('@vladmandic/face-api');

//
//Configurações do FaceApi
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })


app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

//
//Controllers
const cadastro = require('./controllers/cadastro');
const validacao = require('./controllers/validacao');
const getDadosUser = require('./controllers/getDadosUser');

//
//Configs
let config = {
    'distanceThreshold': 0.5
}



var faceMatcher;
var labeledFaceDescriptors = [];


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

//Salva usuários carregados em json
app.get('/salvar', (req, res) => {

    saveLabeledFaces()

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors)
})

//-----------------------------------------
//APAGAR APAGAR APAGAR APAGAR APAGAR APAGAR
app.get('/zerar', (req, res) => {

    labeledFaceDescriptors = []

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors)
})
//APAGAR APAGAR APAGAR APAGAR APAGAR APAGAR
//-----------------------------------------

//Carrega faces salvas em json
app.get('/carregar', (req, res) => {

    loadLabeledFaces()

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(labeledFaceDescriptors)
})

//Seta a configuração
app.post('/setConfig', (req, res) => {

    config = req.body

    gerarFaceMatcher()

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(config)

})

//retorna a configuração atual
app.get('/getConfig', (req, res) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*"
    });
    res.send(config)
    
})


//Retorna os dados do usuário de acordo com o cpf
app.post('/getDadosUser', (req, res) => {

    console.log('\n> Requisição de dados recebida')
    console.log('----------------------------------')

    getDadosUser(req, res, req.body.cpf)
})

//Adiciona Uma pessoa
app.post('/cadastrar', (req, res) => {

    console.log('\n> Requisição de cadastro recebida')
    console.log('----------------------------------')

    const dados = [req.body.label, req.body.dataUrls]

    cadastro(req, res, dados)
    .then((newPerson) => {
        labeledFaceDescriptors.push(newPerson)
        console.log('> Cadastro efetuado <')

        gerarFaceMatcher()

        saveLabeledFaces()
    })
    .catch(()=>{
        console.log('> Erro no cadastro <')
    })

})

//Valida uma foto
app.post('/validar', (req, res) => {
    
    console.log('\n> Requisição de validação recebida')
    console.log('------------------------------------')

    const dataUrl = req.body.dataUrl;

    const dados = [dataUrl]
    
    validacao(req, res, dados, faceMatcher)
    .then()
    .catch((err)=>{
        console.log('> Erro na validação <')
        console.log(err)
    })
    //detectFace(dataUrl, res);
})

//Remove uma pessoa
app.post('/remover', (req, res) => {
    
    console.log('\n> Requisição de remoção recebida')
    console.log('------------------------------------')

    
})


//Configura o listener e carrega redes neurais
const port = 6061;
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
    
}




function gerarFaceMatcher(){
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, config.distanceThreshold)
    console.log(`> FaceMatcher atualizado com ${config.distanceThreshold} de Threshold <`)
}









async function saveLabeledFaces(){
    const data = JSON.stringify(labeledFaceDescriptors);
    fs.writeFile('D:/ReconhecimentoFacialCC-API/labeledFaces.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("> LabeledFaces salvas em JSON <");
    });
}

function loadLabeledFaces(){
    fs.readFile('D:/ReconhecimentoFacialCC-API/labeledFaces.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
    
        // parse JSON object

        //labeledFaceDescriptors = JSON.parse(data.toString());
        //labeledFaceDescriptors = data


        const teste = JSON.parse(data.toString());


        for (let i = 0; i < teste.length; i++) {
            const descriptions = []
            
            //Carrega as duas imagens
            descriptions.push(new Float32Array(teste[i].descriptors[0]));
            descriptions.push(new Float32Array(teste[i].descriptors[1]));

            //Cadastra como uma pessoa
            const newPerson = new faceapi.LabeledFaceDescriptors(teste[i].label, descriptions)
            labeledFaceDescriptors.push(newPerson)

            console.log(`Face carregada... (${teste[i].label})`)
        }

        gerarFaceMatcher()

        console.log('> Carregamento concluído <')
    });
}




function loadLabeledFacesFromLocalDir() {
    const labels = ['Waldir']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await canvas.loadImage(`./labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)

                
                console.log(`Imagem ${i} (${label}) carregada`)
            }
            //console.log(descriptions)
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
    
}



require('dotenv').config()
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
const remocao = require('./controllers/remocao');
const getDadosUser = require('./controllers/getDadosUser');
const getAssociados = require('./controllers/getAssociados');
const getDadosReconhecimento = require('./controllers/getDadosReconhecimento');

//
//Configs
let config = {
    'distanceThreshold': 0.47
}
function carregaConfig() {
    const data = fs.readFileSync(`./config.json`, 'utf-8')

    config = JSON.parse(data.toString());
    console.log("> Configs carregadas <")
    console.log(config)

}
function salvaConfig() {
    const data = JSON.stringify(config);
    fs.writeFile('./config.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("> Configs salvas em JSON <");
        console.log(config)
    });
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

    salvaConfig()

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

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    console.log('\n> Requisição de dados recebida')
    console.log('----------------------------------')

    getDadosUser(req.body.cpf)
        .then((dados) => {
            res.send(dados)
        })
        .catch((err) => {
            console.log("> Erro na consulta de dados <")
            console.log(err)

            res.send({"Status": "Falha"})
        })
})


app.post('/getDadosReconhecimento', (req, res) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    console.log('\n> Requisição de dados reconhecimento recebida')
    console.log('----------------------------------')

    getDadosReconhecimento()
        .then((dados) => {
            res.send(dados)
        })
        .catch((err) => {
            console.log("> Erro na consulta de dados <")
            console.log(err)

            res.send({"Status": "Falha"})
        })
})

// ------
app.post('/getAssociados', (req, res) => {

    console.log('\n> Requisição de dados recebida')
    console.log('----------------------------------')

    const filtro = req.body.filtro

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    getAssociados(filtro)
        .then(associados => {
            res.send(associados)
        })
        .catch(err => {
            console.log(err)
        })
})

//Adiciona Uma pessoa
app.post('/cadastrar', (req, res) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });
    
    console.log('\n> Requisição de cadastro recebida')
    console.log('----------------------------------')

    const dados = [req.body.label, req.body.dataUrls]

    cadastro(dados)
        .then((newPerson) => {
            labeledFaceDescriptors.push(newPerson)
            console.log('> Cadastro efetuado <')

            gerarFaceMatcher()

            saveLabeledFaces()

            res.send([dados[1] , {"Status": "Cadastrado"}])
        })
        .catch((err) => {
            console.log('> Erro no cadastro <')
            console.log(err)

            res.send([dados[1] , {"Status": "Falha"}])
        })

})

//Valida uma foto
app.post('/validar', (req, res) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    console.log('\n> Requisição de validação recebida')
    console.log('------------------------------------')

    const dataUrl = req.body.dataUrl;

    const dados = [dataUrl]

    validacao(dados, faceMatcher)
        .then((result) => {
            res.send(result)
        })
})

//Remove uma pessoa
app.post('/remover', (req, res) => {

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    console.log('\n> Requisição de remoção recebida')
    console.log('------------------------------------')

    remocao(req.body.codigo, labeledFaceDescriptors)
        .then((newLabeledFaceDescriptors) => {
            labeledFaceDescriptors = newLabeledFaceDescriptors

            gerarFaceMatcher()

            saveLabeledFaces()

            res.send({"Status": "Removido"})

        })
        .catch((err) => {
            console.log('> Erro na remoção <')
            console.log(err)

            res.send({"Status": "Falha"})
        })

})


//Configura o listener e carrega redes neurais
const port = process.env.APPPORT;
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

function start() {

    carregaConfig();

    if(process.env.LOADMODE == 'dir'){
        loadLabeledFacesFromLocalDir(); //Carrega faces pelas fotos salvas
    }else{
        loadLabeledFaces(); //Carrega faces salvas no json
    }
}




function gerarFaceMatcher() {
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, config.distanceThreshold)
    console.log(`> FaceMatcher atualizado com ${config.distanceThreshold} de Threshold <`)
}









async function saveLabeledFaces() {
    const data = JSON.stringify(labeledFaceDescriptors);
    fs.writeFile('./labeledFaces.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("> LabeledFaces salvas em JSON <");
    });
}

function loadLabeledFaces() {


    fs.readFile('./labeledFaces.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }

        const labeledFacesJSON = JSON.parse(data.toString());


        for (let i = 0; i < labeledFacesJSON.length; i++) {
            const descriptions = []

            //Carrega as imagens já convertidas do json
            descriptions.push(new Float32Array(labeledFacesJSON[i].descriptors[0]));
            //descriptions.push(new Float32Array(labeledFacesJSON[i].descriptors[1]));
            //descriptions.push(new Float32Array(labeledFacesJSON[i].descriptors[2]));

            //Cadastra como uma pessoa
            const newPerson = new faceapi.LabeledFaceDescriptors(labeledFacesJSON[i].label, descriptions)
            labeledFaceDescriptors.push(newPerson)

            console.log(`Face carregada... (${labeledFacesJSON[i].label})`)
        }

        console.log(labeledFacesJSON.length + ' Faces carregadas')

        if (labeledFacesJSON.length > 0)
            gerarFaceMatcher()

        console.log('> Carregamento concluído <')
    });
}

async function loadLabeledFacesFromLocalDir() {

    labeledFaceDescriptors = []

    const labels = []
    let fotosCarregadas = 0

    const associadosRF = await getAssociados(" WHERE rf.status = 'A' ")
    console.log(associadosRF)
    for (let i = 0; i < associadosRF.length; i++) {
        labels.push(associadosRF[i].CODIGO)
    }
    console.log(labels)


    for (let i = 0; i < labels.length; i++) {
        const descriptions = [];


        const imgBase64 = fs.readFileSync(`../ReconhecimentoFacialCC-API-Fotos/${labels[i]}/imagem0.txt`, 'utf8');
        fotosCarregadas++

        let image = new Image()
        image.src = imgBase64;

        detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)

        const newPerson = new faceapi.LabeledFaceDescriptors(labels[i], descriptions)

        labeledFaceDescriptors.push(newPerson)

        console.log(`Face carregada... (${labels[i]})`)

    }

    console.log('> Carregamento concluído <')
    console.log(fotosCarregadas + ' fotos carregadas')

    gerarFaceMatcher()

}




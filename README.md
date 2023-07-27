# Requisitos da API
- Processador que suporta instruções AVX.
- Node.js com gyp, C++ Build Tools e Pyhon 3.10 instalados. 
<br>

## Verificando se a cpu possui instruções AVX

 1. Instale o [HWINFO](https://www.hwinfo.com/download/).
 
 2. Execute o programa e confira as instruções suportadas.
 
 <img src="https://qph.fs.quoracdn.net/main-qimg-3131dd7bd2ef962f14b82ff46f9731f5"
     alt="hwinfo"
     style="width: 300px; height: auto" />
     
 >Instruções AVX são necessárias para o funcionamento do Tensorflow, caso a cpu não suporte essas instruções é possível executar uma versão do tensorflow que roda na gpu '@tensorflow/tfjs-node-gpu', consulte [a documentação](https://www.npmjs.com/package/@tensorflow/tfjs-node) para mais informações.

<br><br><br>

## Instalando gyp, C++ Build Tools e Pyhon 3.10

1. Se a máquina tiver o node instalado desinstale-o juntamente com versões atuais do python.

2. [Baixe](https://nodejs.org/en/) a versão **16.16.0** do node.

3. Na etapa de "Tools For Native Modules" marque a checkbox apresentada.

<img src="https://i.ibb.co/1Z13T1k/Capturar.png"
     alt="Tools For Native Modules"
     style="width: 400px; height: auto" />
     
     
4. Ao fim da instalação um script irá aparecer, aperte enter para aceitar a instalação (duas vezes) e deixe-o rodando.

5. O script garantirá que as ferramentas necessárias para o desenvolvimento com bibliotecas que utilizam funções em c++ ou python estejam instaladas corretamente. [Saiba mais](https://github.com/nodejs/node-gyp)

> Caso não queira desintalar versões atuais do node em sua máquina (não recomendado): [Tutorial para instalação manual do gyp](https://github.com/nodejs/node-gyp#on-windows).




<br><br><br><br><br><br>



   
   
   
   Obs: https://stackoverflow.com/questions/58286796/tfjs-binding-node-not-found-in-tensorflow-installed-folder
  

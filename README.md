## Requisitos do Tensorflow

###### Referência: https://github.com/nodejs/node-gyp#on-windows

Run: 
``` npm install -g node-gyp ```


Install the current version of Python from the [Microsoft Store package](https://www.microsoft.com/en-us/p/python-310/9pjpw5ldxlz5).

Install tools and configuration manually:
   * Install Visual C++ Build Environment: [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)
   (using "Visual C++ build tools" workload) or [Visual Studio Community](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community)
   (using the "Desktop development with C++" workload)
   * Launch cmd, `npm config set msvs_version 2017`

   If the above steps didn't work for you, please visit [Microsoft's Node.js Guidelines for Windows](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules) for additional tips.

   To target native ARM64 Node.js on Windows 10 on ARM, add the components "Visual C++ compilers and libraries for ARM64" and "Visual C++ ATL for ARM64".
   
   
   
   Obs: https://stackoverflow.com/questions/58286796/tfjs-binding-node-not-found-in-tensorflow-installed-folder

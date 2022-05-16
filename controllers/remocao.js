const sql = require('mssql')

async function atualizarNoBanco(codigo){
    try{
        var config = {
            user: 'jboss.consulta.06',
            password: 'consulta06@jboss',
            server: 'ccclube.no-ip.biz',
            port: 1433,
            database: 'CCONLINE_OLD',
            requestTimeout: 60000,
            options: {
                encrypt: false,
                enableArithAbort: true
            }
        };
    
        //Status: A = Ativo
        await sql.connect(config)
        let qry = ` DELETE FROM ReconhecimentoFacial 
                    WHERE codigoAssociado = '${codigo}'`
                    
        await sql.query(qry)

    }
    catch(err){
        throw(err)
    }
    

}

module.exports = async (req, res, codigo, labeledFaceDescriptors) => {

    try{
        console.log(codigo)
        labeledFaceDescriptors = labeledFaceDescriptors.filter(person => person.label !== codigo);
        
        await atualizarNoBanco(codigo)

        return labeledFaceDescriptors

    }catch(err) {

        throw(err)
    }

    
    
}
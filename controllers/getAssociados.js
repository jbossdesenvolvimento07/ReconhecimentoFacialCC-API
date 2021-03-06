const sql = require('mssql')

var config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: Number(process.env.PORT),
    database: process.env.DATABASE,
    requestTimeout: Number(process.env.REQUEST_TIMEOUT),
    options: {
        encrypt: false,
        enableArithAbort: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        },
        trustServerCertificate: true
    }
};

module.exports = async (filtro) => {
    
    try{

        await sql.connect(config)
        let qry = ` SELECT a.*, rf.status statusRF FROM ASSOCIADOS a 
                    LEFT JOIN dbo.ReconhecimentoFacial rf ON a.CODIGO = rf.codigoAssociado  ` + filtro
        console.log(qry)
        let result = await sql.query(qry)

        return result.recordset

    }catch(err){

        throw(err)

    }
}

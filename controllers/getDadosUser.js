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
        enableArithAbort: true
    }
};

module.exports = async (cpf) => {

    try{

        await sql.connect(config)
        let qry = ` SELECT a.*, rf.status statusRF FROM associados a
                    LEFT JOIN dbo.ReconhecimentoFacial rf ON a.CODIGO = rf.codigoAssociado 
                    WHERE dbo.ExtractInteger(a.cpf) = '${cpf}'`
        let result = await sql.query(qry)

        console.log(qry)
        console.log(result.recordset[0])

        return result.recordset[0]

    }catch(err){

        throw(err)

    }
}
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

module.exports = async () => {

    try{

        await sql.connect(config)
        let qry = ` SELECT
                        (SELECT COUNT(id) FROM dbo.ASSOCIADOS WHERE DESLIGAMENTO IS NULL) ASSOCIADOS,
                        (SELECT COUNT(id) FROM dbo.ReconhecimentoFacial WHERE status = 'A') RECONHECIMENTO`
        let result = await sql.query(qry)

        console.log(qry)
        console.log(result.recordset[0])

        return result.recordset[0]

    }catch(err){

        throw(err)

    }
}
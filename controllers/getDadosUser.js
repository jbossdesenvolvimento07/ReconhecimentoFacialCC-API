const sql = require('mssql')

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

module.exports = async (req, res, cpf) => {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
    });

    try{

        await sql.connect(config)
        let qry = ` SELECT a.*, rf.status statusRF FROM associados a
                    LEFT JOIN dbo.ReconhecimentoFacial rf ON a.CODIGO = rf.codigoAssociado 
                    WHERE dbo.ExtractInteger(a.cpf) = '${cpf}'`
        let result = await sql.query(qry)

        console.log(result.recordset[0])

        res.send(result.recordset[0])

    }catch(err){

        throw(err)

    }
}
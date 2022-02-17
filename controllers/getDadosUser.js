const sql = require('mssql')

var config = {
    user: 'jboss.consulta.06',
    password: 'consulta06@jboss',
    server: 'encopelx.no-ip.biz',
    port: 5023,
    database: 'JM2Online_OLD',
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

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `SELECT * FROM Entidades WHERE dbo.ExtractInteger(cnpjCPF) = ${cpf} AND dataFinal IS NULL`
        let result = await sql.query(qry)

        console.log(result)

        //res.send(result)

    }catch(err){

        throw(err)

    }
}
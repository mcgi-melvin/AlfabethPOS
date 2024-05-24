const
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Asdqwe123!@#',
        database: 'alfabeth',
        insecureAuth: true
    })

connection.connect((err) => {
    if( err ) {
        console.log( "Error Connecting: " + err.stack )
        return
    }

    console.log( `Connected as id ${connection.threadId}` )
})

module.exports = connection
const mysql  =   require('mysql');

const pool  =   mysql.createConnection({
    user: 'root',
    password: '',
    //database: 'vd',
    database: 'prabandh',
    host: 'localhost'
});

module.exports  =   pool;
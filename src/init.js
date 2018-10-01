'use strict'
const spawn = require('child_process').spawn;
const user = 'admin';
const password = 'admin';
const headers = {
    'Content-Type':'application/json',
};

// const got = require('got');
// var options = {
//     baseUrl: 'http://localhost/',
//     port:3000,
//     headers: headers,
//     auth:`${user}:${password}`,
// };
// const client = got.extend(options);
// const token = await client.get('auth_token');
// console.log(token.body);

// const alice = {name:"alice", balance:"10000"};
// options.params = alice;
// const res = await client.put('accounts/alice', options);
// console.log(res);


const adminAuth = Buffer.from(`${user}:${password}`).toString('base64');
async function main(name, balance, url){
    try {
        let process = spawn('curl',
            ['-X', 'PUT',
            '-H', "Authorization: Basic " + adminAuth,
            '-H', "Content-Type: application/json",
            '-d', `{"name": "${name}", "password": "${name}", "balance": "${balance}"}`,
            `${url}/accounts/${name}`
            ]);
        process.stdout.on('data', data => {console.log(data.toString()); });
        process.stderr.on('data', data => {console.error(data.toString()); });
    } catch (error) {
        console.log(error);
    }
}

main('alice', 100000, 'http://localhost:3000');
main('carol', 100000, 'http://localhost:3000');
main('bob', 100000, 'http://localhost:3001');
main('carol', 100000, 'http://localhost:3001');

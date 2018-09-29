'use strict'

const {spawn} = require('child_process');


// run npm args command at options{cwd: xxx} directory.
// to run five-bells-ledger, cwd: node_modules/five-bells-ledger.
function npm (args, prefix, options, waitFor) {
	const nodePath = process.env.npm_node_execpath
	const npmPath = process.env.npm_execpath
	const hasCustomNPM = nodePath && npmPath
	console.log(nodePath);
	console.log(npmPath);
	console.log(hasCustomNPM);

	return new Promise((resolve) => {
	    let cmd = 'npm'
	    console.log(hasCustomNPM);
	    if (hasCustomNPM) {
	        cmd = nodePath
	        args.unshift(npmPath)
	    }
	    options = Object.assign({
	        detached: true,
	        stdio: ['ignore', 'ignore', 'ignore']
	    }, options)

	    // Wait for result of process
	    if (waitFor) {
	        options.waitFor = {
	            trigger: waitFor,
	            callback: resolve
	        }
	    } else {
	        resolve()
	    }

	    const formatter = getOutputFormatter(prefix)
	    console.log(cmd, args, options);
	    const proc = spawn(cmd, args, options, formatter);
	});
}

function getOutputFormatter (prefix) {
    return function (line, enc, callback) {
        this.push('' + chalk.dim(prefix) + ' ' + line.toString('utf-8') + '\n')
        callback()
    }
}

async function main(ccys){
  for (var i = 0; i < ccys.length; i++) {
    const pgtools = require('pgtools');
    const pgConf = {user: 'fivebells', password: 'fivebells', port:5432, host:'localhost'};
    try{
      await pgtools.dropdb(pgConf, ccys[i]);
    }
    catch(error){
      console.log(error);
    }
    await pgtools.createdb(pgConf, ccys[i]);
    const proc = spawn('npm', ['start'], {cwd:'node_modules/five-bells-ledger',
      env:{LEDGER_DB_URI: `postgres://fivebells:fivebells@localhost/${ccys[i]}`,
           LEDGER_ADMIN_USER:'admin',
           LEDGER_AADMIN_PASS:'admin',
           LEDGER_PUBLIC_URI:'http://localhost/',
           LEDGER_PORT:3000+i,
           LEDGER_CURRENCY_SYMBOL:ccys[i]
          }
      });
    proc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    proc.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}

main(['JPY', 'EUR']);

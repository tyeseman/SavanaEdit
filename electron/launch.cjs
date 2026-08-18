const {spawn}=require('node:child_process');
const electronPath=require('electron');

// Some development hosts set ELECTRON_RUN_AS_NODE for their own tooling.
// Never inherit it when launching the actual SavanaEdit desktop runtime.
const env={...process.env};
delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(electronPath,['.'],{cwd:require('node:path').join(__dirname,'..'),env,stdio:'inherit',windowsHide:false});
child.on('exit',code=>process.exit(code??0));
child.on('error',error=>{console.error(error);process.exit(1)});

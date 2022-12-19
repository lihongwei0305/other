import prompts from 'prompts';
import path from "path";


// console.log('===aaa===', await import('./server.js') )

import {generateZip} from "./zip.js";
import {connectScp} from './scp.js';

import {fileURLToPath} from "url";


const sourceDir = path.join(fileURLToPath(import.meta.url), '../../') + 'dist'; // 需要打包的目录
const generateDir = path.join(fileURLToPath(import.meta.url), '../../') + 'dist.zip'; // 打包后生成的目录

// console.log("sourceDir:",sourceDir)
// console.log("generateDir:",generateDir)


let questions;
if (!process.argv[2]) {
    questions = [
        {
            type: 'text',
            name: 'host',
            message: '输入的服务器ip:'
        },
        {
            type: 'number',
            name: 'port',
            message: '输入的服务器的端口:',
            initial: 22
        },
        {
            type: 'text',
            name: 'path',
            message: '上传服务器目录:'
        },
        {
            type: 'text',
            name: 'username',
            message: '输入用户名:'
        },
        {
            type: 'password',
            name: 'password',
            message: '输入密码:'
        }
    ]
} else {
    let {server} = await import(`${process.argv[2]}`);
    questions = [
        {
            type: 'select',
            name: 'config',
            message: '请选择服务器:',
            choices: server

        }
    ]
}


(async () => {
    await generateZip(sourceDir, generateDir)
    const response = await prompts(questions);
    await connectScp(response.config)
})();
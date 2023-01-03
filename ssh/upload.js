import {connectScp} from "./scp.js";
import {generateZip} from "./zip.js";


import path from "path";
import {fileURLToPath} from "url";


const sourceDir = path.join(fileURLToPath(import.meta.url), '../../') + 'dist'; // 需要打包的目录
const generateDir = path.join(fileURLToPath(import.meta.url), '../../') + 'dist.zip'; // 打包后生成的目录

(async () => {
    await generateZip(sourceDir, generateDir)
    await connectScp({
        host: '192.168.109.135',
        port: 22,
        username: 'root',
        password: 'admin',
        path: '/usr/share/nginx/html',
    })
})()
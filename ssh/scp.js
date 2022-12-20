import scp2 from 'scp2'

import {connectSsh} from "./connect.js"
import ora from 'ora';
import path from "path";
import {fileURLToPath} from "url";

export function connectScp(server) {
    const spinner = ora('本地文件上传服务器中...').start();
    scp2.scp(path.join(fileURLToPath(import.meta.url), '../../') + 'dist.zip', server, (err) => {
        if (!err == null) {
            return
        }
        spinner.succeed("本地文件上传完成").clear()
        connectSsh(server);

    })
}



import scp2 from 'scp2'

import {connectSsh} from "./connect.js"
import ora from 'ora';
import path from "path";
import {fileURLToPath} from "url";

export function connectScp(server) {
    const spinner = ora('上传服务器...').start();
    scp2.scp(path.join(fileURLToPath(import.meta.url),'../../') + 'dist.zip', server, (err) => {
        if (!err == null) {
            return
        }
        spinner.succeed("上传完成").clear()
        connectSsh(server);

    })
    // spinner.succeed("上传完成").clear()
}



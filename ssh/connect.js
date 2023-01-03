import {Client} from "ssh2"

const conn = new Client()
import ora from 'ora';
import {getCurrentTime} from "./date.js";

export function connectSsh(server, cmd) {
    // console.log("server",server)
    const spinner = ora('连接服务器...').start();
    conn.on("ready", () => {
        spinner.succeed("连接服务器成功!")
        //shopt -s  extglob
        //  rm -rf !\(dist.zip\);
        // find * | grep -v '\(dist.zip\)' | xargs rm -rf
        let a = '(dist.zip)'
        if (!cmd) {
            cmd = `
                    cd ${server.path};
                    shopt -s  extglob;
                    rm -rf !'\(dist.zip\)';
                    unzip -o dist.zip;
                    rm -rf dist.zip
                    `
        }
        conn.exec(cmd, (err, stream) => {
            if (err) {
                spinner.fail("连接服务器失败!")
                throw err
            }
            stream.on('close', (code, signal) => {
                // console.log('close', code, signal)
                if (code == 0) {
                    spinner.succeed("解压完成!" + getCurrentTime())
                }
                conn.end();
            }).on("data", (data) => {
                console.log("" + data)
            }).stderr.on('data', (data) => {
                conn.end()
                console.log('STDERR: ' + data);
            });
        });


    }).connect(server)
}


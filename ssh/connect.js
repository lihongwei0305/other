import {Client} from "ssh2"

const conn = new Client()
import ora from 'ora';
import {getCurrentTime} from "./date.js";

export function connectSsh(server, cmd) {
    // console.log("server",server)
    const spinner = ora('连接服务器...').start();
    conn.on("ready", () => {
        if (!cmd) {
            cmd = `
                    cd ${server.path};
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
                console.log('close', code, signal)
                conn.end()
            }).on("data", (data) => {
                spinner.succeed("连接服务器成功!")
                console.log("" + data)
                spinner.succeed("解压完成!" + getCurrentTime())
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });


    }).connect(server)
}


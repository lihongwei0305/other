import JSZip from "jszip";
import ora from 'ora'
import fs from "fs"

let zip = new JSZip()

function readDir(zip, dirPath) {
    // console.log("dirPath", dirPath)
    const files = fs.readdirSync(dirPath)
    files.forEach(fileName => {
        const filePath = dirPath + "\\" + fileName
        const file = fs.statSync(filePath)
        if (file.isDirectory()) {
            const dirZip = zip.folder(fileName)
            readDir(dirZip, filePath)
        } else {
            zip.file(fileName, fs.readFileSync(filePath))
        }
    })
}

export function generateZip(sourceDir, generateDir) {
    const spinner = ora('开始打包...').start();

    readDir(zip, sourceDir);
    zip.generateAsync({
        type: "nodebuffer", // 压缩类型
        compression: "DEFLATE", // 压缩算法
        compressionOptions: { // 压缩级别
            level: 9
        }
    }).then(content => {
        // 把zip包写到硬盘中，这个content现在是一段buffer
        fs.writeFileSync(generateDir, content);
        spinner.succeed("打包完成").clear()
    });
}


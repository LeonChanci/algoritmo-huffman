import { Get, Post, Res, Body, Controller, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlgoritmoService } from './algoritmo.service';
import { ExpressAdapter, FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, readFile, readFileSync} from 'fs';
import { join } from 'path';

@Controller('api/v1/algoritmoHuffman')
export class AlgoritmoController {

    constructor(private algoritmoService: AlgoritmoService) {

    }

    @Post('readFile1')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile1(@UploadedFile() file: Express.Multer.File) {
        return this.algoritmoService.readFile(file);
    }

    @Post('readFile2')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        
        const typeEncoding:BufferEncoding = "utf-8";
        const options:Object = {
            encoding: typeEncoding,
            flag: "r"
        }
        
        /**
        const filetxt = readFile(file.buffer, options, (err, data) => {
            console.log("This File:");
            console.log(file);
            if (err) {
                throw err
            }else {
                console.log(data.buffer);
                return data;
            }
        })
        return file;*/
        const filetxt = readFileSync("./src/modules/algoritmo/file.txt", "utf-8");
            console.log("This File: ");
            console.log(file);
            console.log("This DataFile: ");
            console.log(filetxt);
        return filetxt;
    }
}

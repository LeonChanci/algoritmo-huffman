/* eslint-disable prettier/prettier */
import { Post, Controller, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlgoritmoService } from './algoritmo.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/algoritmoHuffman')
export class AlgoritmoController {

    constructor(private algoritmoService: AlgoritmoService) {

    }

    @Post('encodeFile')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
        return this.algoritmoService.encodeFile(file);
    }
}

/* eslint-disable prettier/prettier */
import { Post, Controller, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlgoritmoService } from './algoritmo.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/algoritmoHuffman')
export class AlgoritmoController {

    constructor(private algoritmoService: AlgoritmoService) {}

    //Variable para guardar el código binario para posteriormente poder usarlo para decodificar
    private codigoBinario: Map<string, string> = new Map<string, string>();

    @Post('encodeFile')
    @UseInterceptors(FileInterceptor('file'))
    uploadFileTxt(@UploadedFile() fileTxt: Express.Multer.File) {
        console.log(fileTxt);
        const resultado: Map<string, string> = this.algoritmoService.encodeFile(fileTxt);
        this.codigoBinario = resultado;

        const mapArray: [string, string][] = Array.from(this.codigoBinario);

        // Serialize the array to JSON
        const jsonResult = JSON.stringify(mapArray);
        return jsonResult;
    }

    @Post('decodeFile')
    @UseInterceptors(FileInterceptor('file'))
    uploadFileBin(@UploadedFile() fileBin: Express.Multer.File) {
        console.log(fileBin);
        const resultado: string = this.algoritmoService.decodeFile(fileBin, this.codigoBinario);
        return resultado;
    }
}

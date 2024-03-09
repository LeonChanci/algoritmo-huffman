import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class AlgoritmoService {

    private names:string[];

    readFile(file:Express.Multer.File):string {
        const filetxt = readFileSync("./src/modules/algoritmo/file.txt", "utf-8");
            console.log("This DataFile: ");
            console.log(filetxt);
        return filetxt;
    }
}

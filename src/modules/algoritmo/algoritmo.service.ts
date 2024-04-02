/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { WriteFileOptions, readFileSync, writeFileSync } from 'fs';
import { Nodo } from './algoritmo.module';

@Injectable()
export class AlgoritmoService {

    encodeFile(file) {
        const pathFiles:string = "./src/modules/algoritmo/filesTxt/";
        const nameFile:string = file.fieldname;
        const dateString:string = new Date().valueOf().toString();
        let finalName = new String(nameFile).concat("_", dateString, ".txt").toString();
        
        //Guardar Archivo en el directorio "files"
        writeFileSync(pathFiles.concat(finalName), file.buffer.toString());
        //writeFileSync(pathFiles.concat(finalName), file.bufferut.toString());
        
        const fileTxt = readFileSync(pathFiles+finalName, "utf-8");
        console.log("---====TEXTO DEL ARCHIVO===---", "\n", fileTxt, "\n");

        const frecuencias = this.getFrecuencia(fileTxt);
        console.log("---====TABLA DE FRECUENCIAS===---", "\n", frecuencias, "\n");

        const arbol = this.construirArbol(frecuencias);
        console.log("---====NODO PADRE===---", "\n", arbol, "\n");

        const codigoBinario = this.getCodigoBinario(fileTxt);
        console.log("---====TABLA CÓDIGO BINARIO===---", "\n", codigoBinario, "\n");

        const textoCodificado = this.codificacionTexto(fileTxt, codigoBinario);
        console.log("---====TEXTO (CARACTERES) CODIFICADO===---", "\n", textoCodificado, "\n");

        const textoDecodificado = this.decodificacionTexto(textoCodificado, codigoBinario);
        console.log("---====TEXTO (CARACTERES) DECODIFICADO===---", "\n", textoDecodificado, "\n");

        


        this.pruebaGuardarBin(textoCodificado, codigoBinario, file);

        //let uint8Array = new Uint8Array([72, 111, 108, 97]);
        //console.log( new TextDecoder().decode(uint8Array) ); // Hola

        return arbol;
    }

    /**
     * 
     * @param textoCodificado 
     * @param codigoBinario 
     */
    pruebaGuardarBin(textoCodificado: Array<string>, codigoBinario: Map<string, string>, file) {
        let codigoBinarioConcatenado = "";
        for (let i=0; i < textoCodificado.length; i++) {
            codigoBinarioConcatenado+= textoCodificado[i];  
        }
        console.log("---====CODIGO CODIFICADO BINARIO UNIDO EN STRING===---", "\n", codigoBinarioConcatenado, "\n");

        const typeEncoding:WriteFileOptions = {
            encoding: "ascii"
        }
        writeFileSync("./src/modules/algoritmo/filesBin/fileBinario.bin", textoCodificado.toString(), typeEncoding);
        console.log("---====CODIGO BINARIO POR COMAS EN .bin===---", "\n", textoCodificado.toString(), "\n");

        const newFileTexto = readFileSync("./src/modules/algoritmo/filesBin/fileBinario.bin", "utf-8");
        let textoCodificadoBin = newFileTexto.split(",");

        const textoDecodificado = this.decodificacionTexto(textoCodificadoBin, codigoBinario);
        console.log("---====CODIGO DECODIFICADO LEYENDO .bin===---", "\n", textoDecodificado, "\n");
        


        
        console.log(file.buffer);
        const buffer = Buffer.alloc(file.size);
        buffer.write(file.buffer.toString());
        console.log(buffer);
        console.log(file.buffer.toString());
        writeFileSync("./src/modules/algoritmo/filesBin/fileBinario2.bin", file.buffer, typeEncoding);

        /*
        let cadenaCodificada = btoa(stringUnido);
        console.log("Codificacion64:");
        console.log(cadenaCodificada);

        const fileTxt = readFileSync("./src/modules/algoritmo/fileBinario.bn", "utf-8");

        console.log("Decodificacion64: Del archivo .bin");
        let decodificado2 = atob(fileTxt);
        console.log(decodificado2);
        */

    }

    /**
     * Obtener la frecuencia (contar el número de veces que se repite un caracter)
     * @param texto Dentro del Archivo TXT
     * @returns frecuencias Arreglo
     */
    getFrecuencia(texto:string) : [string, number][] {
        const frecuenciasMap: Map<string, number> = new Map();

        //Se recorre el texto por cada caracter
        for (const caracter of texto) {
            const contador = frecuenciasMap.get(caracter);
            frecuenciasMap.set(caracter, contador ? contador + 1 : 1);
        }
        return Array.from(frecuenciasMap).sort((a, b) => b[1] - a[1]); // descending
    }

    /**
     * Construir el árbol ordenando cada uno de los nodos
     * @param frecuenciasArray 
     * @returns 
     */
    construirArbol(frecuenciasArray : [string, number][]) {
        const nodos: Nodo[] = [];

        //Se recorre cada item para agregarlo a nodos
        for (const [caracter, cantidad] of frecuenciasArray) {
            nodos.push({caracter, cantidad, izquierda: null, derecha: null});
        }
      
        //Se recorre cada uno de los nodos
        while (nodos.length > 1) {
            //Se organizan de menor a mayor
            nodos.sort((a, b) => a.cantidad - b.cantidad);
      
            const izquierda = nodos.shift()!;
            const derecha = nodos.shift()!;
      
            //Se suman la frecuencia de los nodos hijos
            const nodoPadre: Nodo = {caracter: '', cantidad: izquierda?.cantidad + derecha?.cantidad, izquierda, derecha};
      
            nodos.push(nodoPadre);
        }
        return nodos[0];
    }

    /**
     * Crear el código Binario para cada caracter
     * @param texto
     * @returns codes Mapa
     */
    getCodigoBinario(texto: string): Map<string, string> {
        const frecuenciasArray = this.getFrecuencia(texto);
        const arbol = this.construirArbol(frecuenciasArray);
    
        const codes: Map<string, string> = new Map(); // Array with symbols and codes
    
        this.getCodigos(arbol, (caracter, codigo) => {
            codes.set(caracter, codigo);
        });
        return codes;
    }

    getCodigos = (arbol: Nodo | null, 
        codigoBinario: (caracter: string, codigo: string) => void, 
        codigo = '',): void => {
        if (!arbol) {
            return;
        }
    
        if (!arbol.izquierda && !arbol.derecha) {
            codigoBinario(arbol.caracter, codigo);
            return;
        }
    
        this.getCodigos(arbol.izquierda, codigoBinario, codigo + '0');
        this.getCodigos(arbol.derecha, codigoBinario, codigo + '1');
    }

    /**
     * De acuerdo al código binario códificar cada caracter del texto y retornar todo en Binario
     * @param texto 
     * @param codigoBinario 
     * @returns 
     */
    codificacionTexto(texto: string, codigoBinario: Map<string, string>): Array<string> {
        const textoCodificado: Array<string> = [];
        for (const caracter of texto) {
            textoCodificado.push(codigoBinario.get(caracter)!);
        }
        return textoCodificado;
    }

    /**
     * De acuerdo al código binario decodificar cada caracter del texto y retornar todo el texto
     * @param textoCodificado 
     * @param codigoBinario 
     * @returns 
     */
    decodificacionTexto(textoCodificado: Array<string>, codigoBinario: Map<string, string>): string {
        let resultado = '';
      
        const reversedCodes: Record<string, string> = {};
        Array.from(codigoBinario.entries()).forEach(([key, value]) => {
            reversedCodes[value] = key;
        });
      
        for (const codigo of textoCodificado) {
            resultado += reversedCodes[codigo];
        }
      
        return resultado;
    }
}

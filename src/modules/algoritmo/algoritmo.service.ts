/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { WriteFileOptions, readFileSync, writeFileSync } from 'fs';
import { Nodo } from './algoritmo.module';

@Injectable()
export class AlgoritmoService {

    encodeFile(fileTxt) {
        const pathFiles:string = "./src/modules/algoritmo/filesTxt/";
        const nameFile:string = fileTxt.fieldname;
        const dateString:string = new Date().valueOf().toString();
        let finalName = new String(nameFile).concat("_", dateString, ".txt").toString();
        
        //Guardar Archivo en el directorio "filesTxt"
        writeFileSync(pathFiles.concat(finalName), fileTxt.buffer.toString());
        
        //Leer el archivo del directorio "filesTxt"
        const textoFile = readFileSync(pathFiles + finalName, "utf-8");
        
        //Imprimir el proceso del algoritmo en consola
        const { textoCodificado, codigoBinario, arbol } = this.imprimirProcesoEnConsola(textoFile, pathFiles, finalName);
        const resultadoMapa:Map<string, string> = this.ejecutarAlgoritmo(textoFile);

        //Prueba para guardar y comrprimir el archivo .bin
        this.pruebaGuardarBin(textoCodificado, codigoBinario, fileTxt);
        return resultadoMapa;
    }

    decodeFile(fileBin, codigoBinario: Map<string, string>): string {

        const fileBn = fileBin.buffer;
        console.log(fileBn);

        const arrayBuffer2 = fileBin.buffer as ArrayBuffer;
        let binaryContent: string;
            
        // Convierte el ArrayBuffer a una cadena binaria
        const binaryArray = new Uint8Array(arrayBuffer2);
        binaryContent = Array.from(binaryArray)
          .map((byte) => byte.toString(2).padStart(8, '0'))
          .join('');        

        const compressedText = "11101111000110001010110011100101";

        let decompressedText = '';
        let currentCode = '';
        // recorre cada bit del texto comprimido
        for (const bit of compressedText) {
          // agrega el bit al código actual
          currentCode += bit;
          // busca el código actual en la tabla de códigos
          if (codigoBinario.get(currentCode)) {
            // si se encontró el código, agrega el carácter correspondiente al texto descomprimido
            decompressedText += codigoBinario.get(currentCode)!;
            // reinicia el código actual
            currentCode = '';
          }
        }
    
        // retorna el texto descomprimido
        return decompressedText;
    }

    /**
     * 
     * @param textoCodificado 
     * @param codigoBinario 
     */
    pruebaGuardarBin(textoCodificado: Array<string>, codigoBinario: Map<string, string>, file) {

        console.log("\n", "\n", "\n", "\n", "---====PRUEBAS===---", "\n", "\n", "\n", "\n", );

        let codigoBinarioConcatenado = "";
        for (let i=0; i < textoCodificado.length; i++) {
            codigoBinarioConcatenado+= textoCodificado[i];  
        }
 
        const codeBin = this.textToUint8Array(codigoBinarioConcatenado);
        writeFileSync("./src/modules/algoritmo/filesBin/fileBinario.bin", codeBin, "utf-8");
        console.log("---====.bin===---", "\n", codeBin, "\n");

        /*
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
        */

    }

    textToUint8Array(text: string): Uint8Array {
        const binaryArray = new Uint8Array(text.length / 8);
        for (let i = 0; i < text.length; i += 8) {
          const byte = text.substr(i, 8);
          binaryArray[i / 8] = parseInt(byte, 2);
        }
        return binaryArray;
    }

    /**
     * Ejecuta el algoritmo
     * @param texto 
     * @returns 
     */
    ejecutarAlgoritmo(texto: string): Map<string, string> {
        const codigoBinario: Map<string, string> = this.getCodigoBinario(texto);
        //const textoCodificadoArray: Array<string> = this.codificacionTexto(texto, codigoBinario);
        //const textoDecodificado: string = this.decodificacionTexto(textoCodificadoArray, codigoBinario);
        
        const codigoBinarioInvertido:Map<string, string> = this.invertMap(codigoBinario);
        return codigoBinarioInvertido;
    }

    invertMap(originalMap: Map<string, string>): Map<string, string> {
        const invertedMap = new Map<string, string>();
        originalMap.forEach((value, key) => {
          invertedMap.set(value, key);
        });
        return invertedMap;
    }
    
    /**
     * Crear la tabla con el código Binario para cada caracter
     * @param texto
     * @returns codes Mapa
     */
    getCodigoBinario(texto: string): Map<string, string> {
        
        //Obtener el array de las frecuencias
        const frecuenciasArray: [string, number][] = this.getFrecuencia(texto);

        //Obtener el arbol Huffman
        const arbolHuffman: Nodo = this.construirArbol(frecuenciasArray);
    
        const codigoBinario: Map<string, string> = new Map();
        //Obtener código binario
        this.getCodigos(arbolHuffman, (caracter, codigo) => {

            //Se llena el Mapa con el código binario respectivo para cada caracter
            codigoBinario.set(caracter, codigo);
        });     

        return codigoBinario;
    }

    /**
     * Obtener la frecuencia (contar el número de veces que se repite un caracter)
     * @param texto string Texto del archivo
     * @returns frecuencias Arreglo
     */
    getFrecuencia(texto: string) : [string, number][] {
        //Map<caracter, frecuencia> para guardar las frecuencias de cada carácter del texto
        const frecuenciasMap: Map<string, number> = new Map();

        //Se recorre cada caracter del texto
        for (const caracter of texto) {

            //Lleva la suma de las frecuencias cuando encuentra un caracter igual
            const contador = frecuenciasMap.get(caracter);
            frecuenciasMap.set(caracter, contador ? contador + 1 : 1);
        }

        //Retorna un arreglo ordenando de manera descendente
        return Array.from(frecuenciasMap).sort((a, b) => b[1] - a[1]);
    }

    /**
     * Construir el árbol de Huffman de acuerdo a las frecuencias de cada caracter
     * @param frecuenciasArray [string, number][]
     * @returns 
     */
    construirArbol(frecuenciasArray : [string, number][]): Nodo {
        const nodos: Nodo[] = [];

        //Se recorre cada item del array construyendo los nodos iniciales
        for (const [caracter, cantidad] of frecuenciasArray) {
            nodos.push({caracter, cantidad, izquierda: null, derecha: null});
        }
      
        //Se recorre mientras haya nodos en el arreglo
        while (nodos.length > 1) {
            //Se ordenan los nodos de menor a mayor
            nodos.sort((a, b) => a.cantidad - b.cantidad);
      
            //Elimina el primer elemento de los nodos (el de la izquierda); se guarda en variable
            const izquierda = nodos.shift()!;

            //Elimina el "segundo" elemento de los nodos (el de al derecha); se guarda en variable
            const derecha = nodos.shift()!;

            //Se crea un nuevo nodo con los dos nodos anteriores como hijos y suma de sus frecuencias
            const nodoNuevo: Nodo = {
                caracter: '', 
                cantidad: izquierda?.cantidad + derecha?.cantidad, 
                izquierda, 
                derecha
            };
      
            //Inserta el nodo nuevo a el arreglo de nodos
            nodos.push(nodoNuevo);
        }

        //Retorna el nodo padre que existe en el arreglo
        return nodos[0];
    }

    /**
     * Obtiene los códigos
     * @param arbol 
     * @param codigoBinario 
     * @param codigo 
     * @returns 
     */
    getCodigos = (arbolNodo: Nodo | null, 
        codigoBinario: (caracter: string, codigo: string) => void, 
        codigo = '',): void => {

        //Si el arbol está vacío finalizar proceso
        if (!arbolNodo)
            return;
    
        //Si el nodo de la izquierda y derecha no están vacíos
        if (!arbolNodo.izquierda && !arbolNodo.derecha) {
            codigoBinario(arbolNodo.caracter, codigo);
            return;
        }
        
        this.getCodigos(arbolNodo.izquierda, codigoBinario, codigo + '0');
        this.getCodigos(arbolNodo.derecha, codigoBinario, codigo + '1');
    }

    /**
     * De acuerdo al Mapa del código binario 
     * Códificar cada caracter del texto y retornar su respectivo código en Binario
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
    
    /**
     * Método encargado de imprimir en consola todo el proceso del algoritmo
     * @param fileTxt 
     * @param pathFiles 
     * @param finalName 
     * @returns 
     */
    imprimirProcesoEnConsola(fileTxt:string, pathFiles: string, finalName: string) {

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

        let codigoBinarioConcatenado = "";
        for (let i=0; i < textoCodificado.length; i++) {
            codigoBinarioConcatenado+= textoCodificado[i];  
        }
        console.log("---====CÓDIGO CODIFICADO BINARIO UNIDO EN STRING===---", "\n", codigoBinarioConcatenado, "\n");


        return { textoCodificado, codigoBinario, arbol };
    }
}
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { Nodo, ResultEncode, ResultDecode } from './algoritmo.module';

@Injectable()
export class AlgoritmoService {

    /**
     * Codificar el texto con el algoritmo Huffman y guardarlo en un archivo .bin
     * @param fileTxt File
     * @returns resultadoMapa Map<string, string>
     */
    encodeFile(fileTxt) {
        //Obtener el nombre de los archivos a guardar
        const pathFiles: string = "./src/modules/algoritmo/filesTxt/";
        const nameFile: string = fileTxt.fieldname;
        const dateString: string = new Date().valueOf().toString();
        let finalName = new String(nameFile).concat("_", dateString, ".txt").toString();
        
        //Tamaño del archivo
        let tamanoArchivo = new String(fileTxt.size).concat(" bytes");
        console.log(tamanoArchivo);

        //Guardar Archivo en el directorio "filesTxt"
        writeFileSync(pathFiles.concat(finalName), fileTxt.buffer.toString());
        
        //Leer el archivo del directorio "filesTxt"
        const textoFile = readFileSync(pathFiles + finalName, "utf-8");
        
        //Imprimir el proceso del algoritmo en consola
        const { textoCodificado, codigoBinarioConcatenado} = this.imprimirProcesoEnConsola(textoFile, pathFiles, finalName);
        
        //Ejecutar Algoritmo Huffman
        const resultadoMapa: Map<string, string> = this.ejecutarAlgoritmo(textoFile);

        //Guardar y comprimir el archivo .bin
        const arhivoBin = this.crearArchivoBin(textoCodificado);


        let result: ResultEncode = {
            mapCodeBinario: resultadoMapa,
            textoFile: textoFile,
            tamanoFile: tamanoArchivo,
            pathFileTxt: pathFiles.concat(finalName),
            pathFileBin: arhivoBin,
            codigoBinario: codigoBinarioConcatenado
        };

        //return resultadoMapa;
        return result;
    }

    /**
     * Decódificar el texto recibiendo archivo .bin
     * @param fileBin File .bin
     * @param codigoBinario  Map<string, string>
     * @returns 
     */
    decodeFile(fileBin, codigoBinario: Map<string, string>): string {        
        const arrayBuffer = fileBin.buffer as ArrayBuffer;
            
        //Convierte el ArrayBuffer a una cadena binaria
        const binarioArray = new Uint8Array(arrayBuffer);
        let binaryContent = Array.from(binarioArray)
          .map((byte) => byte.toString(2).padStart(8, '0'))
          .join('');

        let textoDescomprimido = '';
        let codigoActual = '';
        //Recorre cada bit del texto comprimido
        for (const bit of binaryContent) {
          //Agrega el bit al código actual
          codigoActual += bit;
          //Busca el código actual en la tabla de códigos
          if (codigoBinario.get(codigoActual)) {
            //Si se encontró el código, agrega el carácter correspondiente al texto descomprimido
            textoDescomprimido += codigoBinario.get(codigoActual)!;
            //Reinicia el código actual
            codigoActual = '';
          }
        }
        
        let tamanoArchivo = new String(fileBin.size).concat(" bytes");
        console.log(tamanoArchivo);

        let result: ResultDecode = {
            textoFile: textoDescomprimido,
            tamanoFile: tamanoArchivo
        };

        //Retorna el texto descomprimido
        //return result;
        return textoDescomprimido;
    }

    /**
     * Crear archivo .bin con el texto codificado 
     * @param textoCodificado 
     */
    crearArchivoBin(textoCodificado: Array<string>): string {
        const pathFiles: string = "./src/modules/algoritmo/filesBin/";
        const nameFile: string = "fileBinario.bin"
        //Se une todo el código binario en una variable
        let codigoBinarioConcatenado = "";
        for (let i=0; i < textoCodificado.length; i++) {
            codigoBinarioConcatenado+= textoCodificado[i];  
        }
        
        //Obtener código binario en 8Array
        const codeBin = this.textToUint8Array(codigoBinarioConcatenado);
        console.log("---====CÓDIGO BINARIO COMPRIMIDO===---", "\n", codeBin, "\n");

        //Crea archivo .bin en el directorio "filesBin"
        writeFileSync(pathFiles.concat(nameFile), codeBin, "utf-8");

        return pathFiles.concat(nameFile);
    }

    //Pasar texto a un array tipo int de 8bit para comprimir el código binario
    textToUint8Array(text: string): Uint8Array {
        //Los Uint8Array representan un array de enteros sin signo de 8 bits

        //Obtenemos el tamaño del texto y se divide en 8 para poder guardarlos en el Uint8Array
        const binaryArray = new Uint8Array(text.length / 8);
        for (let i = 0; i < text.length; i += 8) {
            
            //Sacamos byte por byte desde la posición 0 a la 8
            const byte = text.substr(i, 8);
            binaryArray[i / 8] = parseInt(byte, 2);
        }
        return binaryArray;
    }

    /**
     * Ejecuta el Algoritmo Huffman
     * @param texto 
     * @returns 
     */
    ejecutarAlgoritmo(texto: string): Map<string, string> {
        const codigoBinario: Map<string, string> = this.getCodigoBinario(texto);

        //Se obtiene el código binario invertido para luego identificar el código por letra
        const codigoBinarioInvertido:Map<string, string> = this.invertMap(codigoBinario);
        return codigoBinarioInvertido;
    }

    //Se invierte el mapa para identificar el código por letra
    invertMap(mapaOriginal: Map<string, string>): Map<string, string> {
        const mapaInvertido = new Map<string, string>();
        mapaOriginal.forEach((value, key) => {
            mapaInvertido.set(value, key);
        });
        return mapaInvertido;
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
        //Retorna un arreglo ordenando de manera descendente (Mayor frecuencia a menor frecuencia)
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
     * Obtiene los códigos resultantes pasando por cada nodo
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
        console.log("---====CÓDIGO CODIFICADO BINARIO UNIDO EN STRING SIN COMPRIMIR===---", "\n", codigoBinarioConcatenado, "\n");

        return { textoCodificado, codigoBinario, arbol, codigoBinarioConcatenado};
    }
}
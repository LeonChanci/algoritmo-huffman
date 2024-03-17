import { ConsoleLogger, Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { Nodo } from './algoritmo.module';

@Injectable()
export class AlgoritmoService {

    readFile(file:Express.Multer.File) {
        const fileTxt = readFileSync("./src/modules/algoritmo/file.txt", "utf-8");
            console.log("---====TEXTO DEL ARCHIVO===---");
            console.log(fileTxt);
            
            console.log("---====TABLA DE FRECUENCIAS===---");
            const frecuencias = this.getFrecuencia(fileTxt);
            console.log(frecuencias);

            const arbol = this.construirArbol(frecuencias);
            console.log("---====NODO PADRE===---");
            console.log(arbol);

            const codigoBinario = this.getCodigoBinario(fileTxt);
            console.log("---====TABLA CÓDIGO BINARIO===---");
            console.log(codigoBinario);

            const textoCodificado = this.codificacionTexto(fileTxt, codigoBinario);
            console.log("---====TEXTO CODIFICADO===---");
            console.log(textoCodificado);

            const textoDecodificado = this.decodificacionTexto(textoCodificado, codigoBinario);
            console.log("---====TEXTO DECODIFICADO===---");
            console.log(textoDecodificado);
                      
            this.prueba(textoCodificado);

            let uint8Array = new Uint8Array([72, 111, 108, 97]);

            console.log( new TextDecoder().decode(uint8Array) ); // Hola

        return arbol;
    }

    prueba(textoCodificado: Array<string>) {
        let stringUnido = "";
        for (let i=0; i < textoCodificado.length; i++) {
            stringUnido+= textoCodificado[i];  
        }
        console.log("CODIGO STRING UNIDO CODIFICADO:");
        console.log(stringUnido);

        let cadenaCodificada = btoa(stringUnido);
        console.log("Codificacion64:");
        console.log(cadenaCodificada);

        const newFileBinario = writeFileSync("./src/modules/algoritmo/fileBinario.bn", cadenaCodificada);
        const fileTxt = readFileSync("./src/modules/algoritmo/fileBinario.bn", "utf-8");

        console.log("Decodificacion64: Del archivo .bin");
        let decodificado2 = atob(fileTxt);
        console.log(decodificado2);
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

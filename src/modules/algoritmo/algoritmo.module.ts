import { Module } from '@nestjs/common';
import { AlgoritmoController } from './algoritmo.controller';
import { AlgoritmoService } from './algoritmo.service';

@Module({
  imports: [],
  controllers: [AlgoritmoController],
  providers: [AlgoritmoService]
})

export class AlgoritmoModule {}

export interface Nodo {
  caracter: string;
  cantidad: number;
  izquierda: Nodo | null;
  derecha: Nodo | null;
}

/** ENCODE TEXT */
export function encode(text: string, codes: Map<string, string>): Array<string> {
  const result: Array<string> = [];
  for (const char of text) {
      result.push(codes.get(char)!);
  }

  return result;
}

/** DECODE TEXT */
export function decode(encodedText: Array<string>, codes: Map<string, string>): string {
  let result = '';

  const reversedCodes: Record<string, string> = {};
  Array.from(codes.entries()).forEach(([key, value]) => {
      reversedCodes[value] = key;
  });

  for (const code of encodedText) {
      result += reversedCodes[code];
  }

  return result;
}

/** GET ENTROPY */
/*
export function getEntropyOfText(text: string): number {
  const relFreq: Array<any> = getRelativeFrequency(getCharsFrequency(text));
  let entropy = 0;

  for (let i = 0; i < relFreq.length; i++) {
      entropy += relFreq[i][1] * Math.log2(relFreq[i][1]);
  }
  return -entropy;
}*/

/** Create char-to-code Map */
export function getCharCodesFromSource(text: string): Map<string, string> {
  const freqArr = getCharsFrequency(text);
  const tree = getTree(freqArr);

  const codes: Map<string, string> = new Map(); // Array with symbols and codes

  getCodes(tree, (char, code) => {
      codes.set(char, code);
  });
  return codes;
}

const getCodes = (
  tree: Nodo | null,
  cb: (char: string, code: string) => void,
  code = '',
): void => {
  if (!tree) {
      return;
  }

  if (!tree.izquierda && !tree.derecha) {
      cb(tree.caracter, code);
      return;
  }

  getCodes(tree.izquierda, cb, code + '0');
  getCodes(tree.derecha, cb, code + '1');
};

/** Relative frequency */
/*
export function getRelativeFrequency(arr: Array<any>): Array<any> {
  let length = 0;
  const resArr: Array<any> = [];
  for (let i = 0; i < arr.length; i++) {
      length += arr[i][1];
  }
  for (let i = 0; i < arr.length; i++) {
      const relFreq = arr[i][1] / length;
      resArr.push([arr[i][0], relFreq]);
  }

  return resArr;
}*/

/** Calculate chars frequency */
export function getCharsFrequency(text: string): [string, number][] {
  const freq: Map<string, number> = new Map();

  for (const char of text) {
      const count = freq.get(char);
      freq.set(char, count ? count + 1 : 1);
  }

  return Array.from(freq).sort((a, b) => b[1] - a[1]); // descending
}

/** Generate Huffman tree */
export function getTree(freq: [string, number][]): Nodo {
  const nodes: Nodo[] = [];

  for (const [caracter, cantidad] of freq) {
      nodes.push({caracter, cantidad, izquierda: null, derecha: null});
  }

  while (nodes.length > 1) {
    console.log(nodes);
      nodes.sort((a, b) => a.cantidad - b.cantidad);

      const izquierda = nodes.shift()!;
      const derecha = nodes.shift()!;

      const parent: Nodo = {caracter: '', cantidad: izquierda?.cantidad + derecha?.cantidad, izquierda, derecha};

      nodes.push(parent);
      console.log(nodes);
  }
  console.log("Nodo Final: ");
  console.log(nodes);
  return nodes[0];

}
/* eslint-disable prettier/prettier */
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

import { Test, TestingModule } from '@nestjs/testing';
import { AlgoritmoController } from './algoritmo.controller';

describe('AlgoritmoController', () => {
  let controller: AlgoritmoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlgoritmoController],
    }).compile();

    controller = module.get<AlgoritmoController>(AlgoritmoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

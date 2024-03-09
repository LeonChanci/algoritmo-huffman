import { Test, TestingModule } from '@nestjs/testing';
import { AlgoritmoService } from './algoritmo.service';

describe('AlgoritmoService', () => {
  let service: AlgoritmoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlgoritmoService],
    }).compile();

    service = module.get<AlgoritmoService>(AlgoritmoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

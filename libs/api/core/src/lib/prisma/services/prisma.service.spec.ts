import { Test } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = app.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

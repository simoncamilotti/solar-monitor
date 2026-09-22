import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

const mockConfigService = {
  getOrThrow: () => 'postgresql://postgres:postgres@localhost:5432/test?schema=public',
};

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [PrismaService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = app.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

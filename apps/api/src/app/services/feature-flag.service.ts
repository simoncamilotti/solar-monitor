import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/core';

import type {
  CreateFeatureFlagRequestDto,
  FeatureFlagDto,
  UpdateFeatureFlagRequestDto,
} from '../dtos/feature-flag.dto';
import { FeatureFlagMapper } from '../mappers/feature-flag.mapper';

@Injectable()
export class FeatureFlagService {
  private readonly _logger = new Logger(FeatureFlagService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _featureFlagMapper: FeatureFlagMapper,
  ) {}

  async findAll(): Promise<FeatureFlagDto[]> {
    const flags = await this._prismaService.featureFlag.findMany();
    return this._featureFlagMapper.toFeatureFlagDtoList(flags);
  }

  async create(dto: CreateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    const featureFlag = await this._prismaService.featureFlag.create({
      data: dto,
    });

    return this._featureFlagMapper.toFeatureFlagDto(featureFlag);
  }

  async update(key: string, dto: UpdateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    const existing = await this._prismaService.featureFlag.findUnique({ where: { key } });

    if (!existing) {
      throw new NotFoundException(`Feature flag '${key}' not found`);
    }

    const flag = await this._prismaService.featureFlag.update({
      where: { key },
      data: { enabled: dto.enabled },
    });

    return this._featureFlagMapper.toFeatureFlagDto(flag);
  }

  async delete(key: string): Promise<void> {
    const existing = await this._prismaService.featureFlag.findUnique({ where: { key } });

    if (!existing) {
      throw new NotFoundException(`Feature flag '${key}' not found`);
    }

    await this._prismaService.featureFlag.delete({ where: { key } });
  }
}

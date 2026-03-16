import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { CreateFeatureFlagRequestDto, FeatureFlagDto, UpdateFeatureFlagRequestDto } from '@/shared-models/server';

import { FeatureFlagService } from '../services/feature-flag.service';

@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly _featureFlagService: FeatureFlagService) {}

  @Get()
  async findAll(): Promise<FeatureFlagDto[]> {
    return this._featureFlagService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    return this._featureFlagService.create(dto);
  }

  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  async update(@Param('key') key: string, @Body() dto: UpdateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    return this._featureFlagService.update(key, dto);
  }
}

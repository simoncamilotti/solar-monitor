import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { Roles, RolesGuard } from '@/core';

import type {
  CreateFeatureFlagRequestDto,
  FeatureFlagDto,
  UpdateFeatureFlagRequestDto,
} from '../dtos/feature-flag.dto';
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
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    return this._featureFlagService.create(dto);
  }

  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('key') key: string, @Body() dto: UpdateFeatureFlagRequestDto): Promise<FeatureFlagDto> {
    return this._featureFlagService.update(key, dto);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('key') key: string): Promise<void> {
    return this._featureFlagService.delete(key);
  }
}

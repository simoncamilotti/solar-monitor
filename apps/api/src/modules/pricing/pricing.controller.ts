import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  type Installation,
  installationSchema,
  type Tariff,
  type TariffCreate,
  tariffCreateSchema,
  tariffIdSchema,
  tariffSchema,
} from '@repo/contracts';
import {
  ResponseListSchema,
  ResponseSchema,
} from '../../common/serialization/response-schema.decorator.js';
import { PricingService } from './pricing.service.js';

// Every route requires a signed-in user: @Public() opens one, @Roles() restricts it.
@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get('tariffs')
  @ApiOperation({ summary: 'List the purchase and feed-in tariffs' })
  @ResponseListSchema(tariffSchema)
  findTariffs(): Promise<Tariff[]> {
    return this.pricing.findTariffs();
  }

  @Post('tariffs')
  @ApiOperation({ summary: 'Add a tariff, effective from a given day' })
  @ApiResponse({ status: 409, description: 'A tariff of the same kind already starts that day' })
  @ResponseSchema(tariffSchema)
  createTariff(@Body({ schema: tariffCreateSchema }) dto: TariffCreate): Promise<Tariff> {
    return this.pricing.createTariff(dto);
  }

  @Delete('tariffs/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a tariff' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  deleteTariff(@Param('id', { schema: tariffIdSchema }) id: string): Promise<void> {
    return this.pricing.deleteTariff(id);
  }

  @Get('installation')
  @ApiOperation({ summary: 'Get the installation cost' })
  @ResponseSchema(installationSchema)
  getInstallation(): Promise<Installation> {
    return this.pricing.getInstallation();
  }

  @Put('installation')
  @ApiOperation({ summary: 'Update the installation cost' })
  @ResponseSchema(installationSchema)
  updateInstallation(
    @Body({ schema: installationSchema }) dto: Installation,
  ): Promise<Installation> {
    return this.pricing.updateInstallation(dto);
  }
}

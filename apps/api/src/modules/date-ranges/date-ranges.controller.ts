import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  type DateRange,
  type DateRangeCreate,
  dateRangeCreateSchema,
  dateRangeIdSchema,
  dateRangeSchema,
  type DateRangeUpdate,
  dateRangeUpdateSchema,
} from '@repo/contracts';
import {
  ResponseListSchema,
  ResponseSchema,
} from '../../common/serialization/response-schema.decorator.js';
import { DateRangesService } from './date-ranges.service.js';

// Every route requires a signed-in user: @Public() opens one, @Roles() restricts it.
@ApiTags('Date ranges')
@Controller('date-ranges')
export class DateRangesController {
  constructor(private readonly dateRanges: DateRangesService) {}

  @Get()
  @ApiOperation({ summary: 'List the saved date ranges' })
  @ResponseListSchema(dateRangeSchema)
  findAll(): Promise<DateRange[]> {
    return this.dateRanges.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Save a named date range, both bounds included' })
  @ApiResponse({ status: 409, description: 'A range already has that name' })
  @ResponseSchema(dateRangeSchema)
  create(@Body({ schema: dateRangeCreateSchema }) dto: DateRangeCreate): Promise<DateRange> {
    return this.dateRanges.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a saved date range or change its bounds' })
  @ApiResponse({ status: 409, description: 'A range already has that name' })
  @ResponseSchema(dateRangeSchema)
  update(
    @Param('id', { schema: dateRangeIdSchema }) id: string,
    @Body({ schema: dateRangeUpdateSchema }) dto: DateRangeUpdate,
  ): Promise<DateRange> {
    return this.dateRanges.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a saved date range' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  delete(@Param('id', { schema: dateRangeIdSchema }) id: string): Promise<void> {
    return this.dateRanges.delete(id);
  }
}

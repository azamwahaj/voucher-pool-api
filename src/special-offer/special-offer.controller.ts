// src/special-offer/special-offer.controller.ts
import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SpecialOfferService } from './special-offer.service';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';
import { SpecialOffer } from './entities/special-offer.entity';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('special-offers') // Tag for Swagger documentation
@Controller('special-offers')
export class SpecialOfferController {
  constructor(private readonly specialOfferService: SpecialOfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new special offer' })
  @ApiBody({ type: CreateSpecialOfferDto })
  @ApiResponse({ status: 201, description: 'The special offer has been successfully created.', type: SpecialOffer })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed)' })
  @ApiResponse({ status: 409, description: 'Conflict (Special offer with this name already exists)' })
  async create(@Body() createSpecialOfferDto: CreateSpecialOfferDto): Promise<SpecialOffer> {
    return this.specialOfferService.create(createSpecialOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all special offers' })
  @ApiResponse({ status: 200, description: 'Returns an array of special offers.', type: [SpecialOffer] })
  async findAll(): Promise<SpecialOffer[]> {
    return this.specialOfferService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a special offer by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the special offer', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: 200, description: 'Returns the special offer with the given ID.', type: SpecialOffer })
  @ApiResponse({ status: 404, description: 'Special offer not found.' })
  async findOne(@Param('id') id: string): Promise<SpecialOffer> {
    return this.specialOfferService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a special offer by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the special offer', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: 204, description: 'The special offer has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Special offer not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.specialOfferService.remove(id);
  }
}

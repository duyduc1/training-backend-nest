import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Put, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() creaeUploadDto: CreateUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadService.uploadFile(creaeUploadDto, file);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return await this.uploadService.findAll({ page, limit, search});
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.uploadService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image')) 
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUploadDto: UpdateUploadDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.uploadService.updateFile(id, updateUploadDto, file);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.uploadService.removeFile(id);
  }

  @Delete('softdelete/:id')
  async softDeleteFile(@Param('id') id: number) {
    return await this.softDeleteFile(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() creaeUploadDto: CreateUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadFile(creaeUploadDto, file);
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image')) 
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUploadDto: UpdateUploadDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.uploadService.updateFile(id, updateUploadDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.removeFile(id);
  }
}

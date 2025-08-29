import { 
  Controller, 
  Get, 
  Post, 
  Body,  
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFiles, 
  UploadedFile, 
  ParseFilePipe, 
  ParseIntPipe, 
  Put, 
  Query, 
  MaxFileSizeValidator, 
  FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('singles3')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5}),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.uploadFileS3(file);
  }

  @Post('multiples3')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5}),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>
  ) {
    return this.uploadService.uploadFiles(files);
  }

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

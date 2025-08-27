import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Upload } from './entities/upload.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {}

  async uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto'},
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile(
    createUploadDto: CreateUploadDto,
    file: Express.Multer.File,
  ) {
    const uploadFile = await this.uploadImageToCloudinary(file);
    const newFile = this.uploadRepository.create({
      ...createUploadDto,
      ImageUrl: uploadFile,
    });
    return this.uploadRepository.save(newFile);
  }

  findAll() {
    return this.uploadRepository.find();
  }

  async findOne(id: number) {
    const product = await this.uploadRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return product;
  }

  async updateFile(
    id: number,
    updateUploadDto: UpdateUploadDto,
    file?: Express.Multer.File,
  ) {
    const fileUpdate = await this.findOne(id);

    let imageUrl = fileUpdate.ImageUrl;
    if (file) {
      imageUrl = await this.uploadImageToCloudinary(file);
    }
    
    const updateFile = this.uploadRepository.merge(fileUpdate, {
      ...updateUploadDto,
      ImageUrl: imageUrl,
    });

    return this.uploadRepository.save(updateFile);
  }

  async removeFile(id: number) {
    const file = await this.findOne(id);
    return this.uploadRepository.remove(file);
  }
}

import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Upload } from './entities/upload.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3_CLIENT } from 'src/shared/s3/s3.provider';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,

    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {
    const bucket = this.configService.get<string>('s3.bucket');
    if(!bucket) {
      throw new Error('S3 bucket name is not configured, Check your .env file');
    }
    this.bucketName = bucket;
  }

  async generatePresignedUrl(originalFileName: string, fileType:string): Promise<{ presignedUrl: string; key: string }> {
    this.logger.log(`Generating presigned URL for file: ${originalFileName}`);

    const key = `${uuidv4()}-${originalFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { presignedUrl, key };
  }

  async confirmUploadToS3(key: string, createUploadDto: CreateUploadDto): Promise<Upload> {
    const region = await this.s3Client.config.region();

    const imageUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

    const newFile = this.uploadRepository.create({
      ...createUploadDto,
      imageUrl: imageUrl,
    });

    return this.uploadRepository.save(newFile);
  }

  async uploadFileS3(file: Express.Multer.File): Promise<{ url: string }> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      const region = await this.s3Client.config.region();
      const fileUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;

      this.logger.log(`File uploaded successfully: ${fileUrl}`);
      return { url: fileUrl };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw new Error('Failed to upload file.');
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    const uploadPromises = files.map(file => this.uploadFileS3(file));
    const results = await Promise.all(uploadPromises);

    const urls = results.map(result => result.url);
    this.logger.log(`All ${files.length} files uploaded successfully`);
    return { urls };
  }

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
      imageUrl: uploadFile,
    });
    return this.uploadRepository.save(newFile);
  }


  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.uploadRepository.createQueryBuilder('uploads');

    if (search) {
      qb.andWhere('(uploads.nameUpload LIKE :search OR uploads.description :search)', {
        search: `%${search}%`
      })
    }

    qb.skip((page - 1) * limit).take(limit);

    qb.orderBy('uploads.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    let imageUrl = fileUpdate.imageUrl;
    if (file) {
      imageUrl = await this.uploadImageToCloudinary(file);
    }
    
    const updateFile = this.uploadRepository.merge(fileUpdate, {
      ...updateUploadDto,
      imageUrl: imageUrl,
    });

    return this.uploadRepository.save(updateFile);
  }

  async removeFile(id: number) {
    const file = await this.findOne(id);
    return this.uploadRepository.remove(file);
  }

  async softDeleteFile(id: number) {
    const resutl = await this.uploadRepository.softDelete(id);
    if (resutl.affected === 0 ) {
      throw new NotFoundException(`File with ID ${id} not found`)
    }

    return { message: 'File was soft deleted'}
  }
}
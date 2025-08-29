import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Định nghĩa một Injection Token để có thể inject S3Client
export const S3_CLIENT = 'S3_CLIENT';

// Tạo một custom provider
export const S3ClientProvider: Provider = {
  provide: S3_CLIENT, // Token để inject
  useFactory: (configService: ConfigService): S3Client => {
    // Lấy thông tin config từ namespace 's3' đã đăng ký
    const s3Config = configService.get('s3');
    
    // Khởi tạo và trả về S3Client
    return new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });
  },
  inject: [ConfigService], // Inject ConfigService để sử dụng trong factory
};
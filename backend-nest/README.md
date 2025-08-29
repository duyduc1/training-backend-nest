# Guide Setup Backend NestJS

## 1. Yêu cầu hệ thống

### Cài trước:

- Node.js (>= 18.x LTS)

- npm hoặc yarn / pnpm

- PostgreSQL hoặc MySQL

- Git control

## 2. Clone và cài đặt

``` bash 
https://github.com/duyduc1/training-backend-nest.git
cd backend-nest
npm install  
```

## 3. Database MySQL

1. chuẩn bị sẵn MySQL

2. truy cập MySQL Workbench 

3. tạo database 

## 4. Chạy dự án

1. Chạy với Dev mode:

``` bash
npm run start:dev
```

2. Chạy với Prod mode
``` bash 
npm run build
npm run start:prod
```

## 5. Test API
### Nest chạy ở http://localhost:3000/api/v1

``` ts
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
### GET http://localhost:3000/api/v1/health

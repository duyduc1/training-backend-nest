import { Controller, Post, UploadedFile, UseInterceptors, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { dest: path.join(process.cwd(), 'src/modules/excel/uploads') }))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    const filePath = file.path;
    try {
      const data = this.excelService.readExcel(filePath);
      return { data };
    } finally {
      this.excelService.deleteFile(filePath);
    }
  }

  @Post('export')
  async exportExcel(@Body() body: any, @Res() res: Response) {
    const data = body.data || [];
    const filePath = this.excelService.writeExcel(data, `export_${Date.now()}.xlsx`);
    res.download(filePath, (err) => {
      if (err) console.error(err);
      this.excelService.deleteFile(filePath); 
    });
  }
}

import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExcelService {

    private uploadsPath = path.join(process.cwd(), 'src/modules/excel/uploads');
    private exportsPath = path.join(process.cwd(), 'src/modules/excel/exports');

    constructor() {
        if (!fs.existsSync(this.uploadsPath)) fs.mkdirSync(this.uploadsPath);
        if (!fs.existsSync(this.exportsPath)) fs.mkdirSync(this.exportsPath); 
    }

    readExcel(filePath: string): any[] {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        return data;
    }

    writeExcel(data: any[], fileName: string): string {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const filePath = path.join(this.exportsPath, fileName);
        XLSX.writeFile(workbook, filePath);
        return filePath;
    }

    deleteFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
}

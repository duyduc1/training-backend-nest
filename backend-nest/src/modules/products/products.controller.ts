import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard'
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAllProducts() {
    return await this.productsService.findAll();
  }

  @Get(':id')
  async findProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  async updateProducts(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.removeProduct(id);
  }
}

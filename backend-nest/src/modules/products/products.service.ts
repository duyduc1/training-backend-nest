import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductDto);
    await this.productRepository.save(newProduct);
    return { message: "Product create successfull", newProduct}
  }

  findAll() {
    return this.productRepository.find();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product With ID #${id} not found`);
    }
    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const productUpdate = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    if (!productUpdate) {
      throw new NotFoundException(`Product With ID #${id} not found`);
    }
    return this.productRepository.save(productUpdate);
  }

  async removeProduct(id: number) {
    const deleteProduct = await this.findOne(id);
    return this.productRepository.remove(deleteProduct);
  }
}

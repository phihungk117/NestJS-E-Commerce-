import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(query?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number | string;
    limit?: number | string;
  }) {
    // Ép kiểu sang Number để đảm bảo an toàn tính toán
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.search) where.name = Like(`%${query.search}%`);

    const [items, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false; // Đổi sang xóa mềm
    await this.productRepository.save(product);
  }

  async decreaseStock(id: string, quantity: number): Promise<void> {
    const product = await this.findOne(id);
    if (product.stock < quantity) {
      throw new BadRequestException(`Sản phẩm "${product.name}" không đủ tồn kho`);
    }
    product.stock -= quantity;
    await this.productRepository.save(product);
  }
}
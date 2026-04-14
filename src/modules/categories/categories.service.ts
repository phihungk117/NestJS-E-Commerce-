import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category name already exists');
    
    const cat = this.categoryRepository.create(dto);
    return this.categoryRepository.save(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    return this.categoryRepository.save(cat);
  }

  // Update: Chuyển từ Xóa Cứng (remove) sang Xóa Mềm (Soft Delete)
  async remove(id: string): Promise<void> {
    const cat = await this.findOne(id);
    cat.isActive = false; 
    await this.categoryRepository.save(cat);
  }
}
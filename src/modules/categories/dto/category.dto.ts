import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

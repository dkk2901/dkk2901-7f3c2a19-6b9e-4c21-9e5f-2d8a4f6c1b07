import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['todo', 'in_progress', 'done'])
  status!: 'todo' | 'in_progress' | 'done';

  @IsIn(['general', 'bug', 'feature'])
  category!: 'general' | 'bug' | 'feature';

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

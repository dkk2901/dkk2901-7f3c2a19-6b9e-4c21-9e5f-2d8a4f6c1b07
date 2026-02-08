import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  @Roles('Owner', 'Admin', 'Viewer')
  list(@Req() req: any) {
    return this.tasks.list(req.user);
  }

  @Post()
  @Roles('Owner', 'Admin')
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasks.create(dto, req.user);
  }

  @Put(':id')
  @Roles('Owner', 'Admin')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tasks.remove(id, req.user);
  }
}

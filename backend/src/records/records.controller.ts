import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, PipeTransform, Post, Put } from '@nestjs/common';
import { RecordDto } from './record.dto';
import { RecordsService } from './records.service';

class RecordIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[+-]?\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
      throw new BadRequestException('Invalid record ID');
    }
    return Number(value);
  }
}

@Controller('api/records')
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Get()
  list() { return this.records.list(); }

  @Post()
  create(@Body() record: RecordDto) { return this.records.create(record); }

  @Put(':id')
  update(@Param('id', RecordIdPipe) id: number, @Body() record: RecordDto) {
    return this.records.update(id, record);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', RecordIdPipe) id: number): void { this.records.delete(id); }
}

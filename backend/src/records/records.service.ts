import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RecordInput, STATUSES } from './business-record';
import { RecordsRepository } from './records.repository';

@Injectable()
export class RecordsService {
  constructor(private readonly repository: RecordsRepository) {}

  list() { return this.repository.list(); }

  private validateStatus(record: RecordInput): void {
    if (!(STATUSES[record.type] as readonly string[]).includes(record.status)) {
      throw new BadRequestException('Invalid status for this record type');
    }
  }

  create(record: RecordInput) {
    this.validateStatus(record);
    return this.repository.create(record);
  }

  update(id: number, record: RecordInput) {
    const old = this.repository.find(id);
    if (!old) throw new NotFoundException('Record not found');
    if (old.type !== record.type) throw new BadRequestException('Record type cannot be changed');
    this.validateStatus(record);
    return this.repository.update(id, record);
  }

  delete(id: number): void {
    if (!this.repository.find(id)) throw new NotFoundException('Record not found');
    this.repository.delete(id);
  }
}

import {AggregateRoot} from '@nestjs/cqrs';
import {IsNotEmpty, IsDateString} from 'class-validator';
import { ObjectID } from 'mongodb';
import { DtoMapperUtils } from '@graphqlcqrs/common';
import { Before, ObjectIdColumn } from '../decorators';
import {BaseDto} from '../dtos';

export abstract class BaseEntity<T extends BaseDto = BaseDto> extends AggregateRoot {

  @IsNotEmpty()
  @ObjectIdColumn()
  id: ObjectID;

  @IsDateString()
  // @Column({ nullable: false })
  createdAt?: Date | string;

  @IsDateString()
  // @Column({ nullable: true })
  updatedAt?: Date | string;

  @IsDateString()
  // @Column()
  deletedAt?: Date | string;

  @IsDateString()
  // @Column({ default: false })
  deleted?: boolean;

  // @VersionColumn()
  version?: number;

  abstract toDtoClass?: new (entity: BaseEntity, options?: any) => T;

  toDto(options?: any) {
    return DtoMapperUtils.toDto(this.toDtoClass, this, options);
  }

  /**
   * Soft delete
   */
  public remove(): void {
    this.deletedAt = new Date();
  }

  @Before('update')
  beforeInsert() {
    this.createdAt = new Date();
  }

  @Before('update')
  updateDates() {
    this.updatedAt = new Date();
  }

  @Before('remove')
  updateRemove() {
    this.deleted = true;
    this.deletedAt = new Date();
  }
}

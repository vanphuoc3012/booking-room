import { UserInfoDto } from '@app/dto/user/user.Info.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDao } from 'src/dao/user/user.dao';
import { UserListQueryDto } from 'src/dto/user/query.ListUser.dto';
import { UserRegisterDto } from 'src/dto/user/user.dto';
import { AdminEntity } from 'src/schemas/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AdminEntity.name)
    private usersRepository: Model<UserDao>
  ) {}

  async findAll(data: UserListQueryDto): Promise<UserInfoDto[]> {
    return await this.usersRepository.find({
      ...(data?.username ? { username: { $regex: data?.username, $options: 'i' } } : {}),
      ...(data?.address ? { address: { $regex: data?.address, $options: 'i' } } : {}),
      ...(data?.createAt ? { createAt: { $regex: data?.createAt, $options: 'i' } } : {}),
      ...(data?.dateOfBirth ? { dateOfBirth: { $regex: data?.dateOfBirth, $options: 'i' } } : {}),
      ...(data?.email ? { email: { $regex: data?.email, $options: 'i' } } : {}),
      ...(data?.fullname ? { fullname: { $regex: data?.fullname, $options: 'i' } } : {}),
      ...(data?.phoneNumber ? { phoneNumber: { $regex: data?.phoneNumber, $options: 'i' } } : {}),
      ...(data?.role ? { role: { $regex: data?.role, $options: 'i' } } : {})
    });
  }

  async findOne(data: object): Promise<UserInfoDto> {
    return await this.usersRepository.findOne({ ...data });
  }

  async create(user: UserRegisterDto) {
    return await this.usersRepository.create(user);
  }

  async update(user: any) {
    return await this.usersRepository.updateOne({ username: user });
  }

  async delete(id) {
    return await this.usersRepository.findOneAndUpdate({ _id: id });
  }
}

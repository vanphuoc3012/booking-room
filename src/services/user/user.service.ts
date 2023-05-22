import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtTokenService } from '@app/shared/services/JwtTokenService.service';
import { UserRepository } from '@app/repo/user.repository';
import { UserListQueryDto } from '@app/dto/user/query.ListUser.dto';
import { UserRegisterDto } from '@app/dto/user/user.dto';
import { QueryMeInfoDto } from '@app/dto/user/query.MeInfo.dto';
import { UserInfoDto } from '@app/dto/user/user.Info.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository, private jwtTokenService: JwtTokenService) {}

  async findAll(data: UserListQueryDto): Promise<UserInfoDto[]> {
    return await this.userRepository.findAll({
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
    return await this.userRepository.findOne({ ...data });
  }

  async create(user: UserRegisterDto) {
    return await this.userRepository.createNewUser(user);
  }

  async getMyInfo(queryUserInfo: QueryMeInfoDto) {
    const userInToken = await this.jwtTokenService.getUserFromToken(queryUserInfo);

    if (!userInToken?.user && !!userInToken.errorMessage) {
      throw new HttpException(
        {
          status: 400,
          description: userInToken.errorMessage,
          error_message: userInToken.errorMessage,
          error_detail: null,
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const token = await this.jwtTokenService.createAuthToken({
      role: userInToken.user.role,
      username: userInToken.user.username
    });

    const user = await this.userRepository.findOne({
      username: userInToken.user.username
    });
    if (user) {
      const {
        fullname,
        dateOfBirth,
        password,
        username,
        phoneNumber,
        email,
        address,
        status,
        createAt,
        lastModify,
        role,
        createdAt,
        updatedAt
      } = user;

      return {
        request_id: 'string',
        status: 200,
        response_code: 'MY_INFO_200',
        response_message: 'Get my info success',
        response_description: 'Get my info success',
        request_date_time: new Date().toISOString(),
        ...token,
        data: {
          fullname,
          dateOfBirth,
          password,
          username,
          phoneNumber,
          email,
          address,
          status,
          createAt,
          lastModify,
          role,
          createdAt,
          updatedAt
        }
      };
    } else {
      throw new HttpException(
        {
          request_id: 'string',
          status: 200,
          response_code: 'MY_INFO_200',
          response_message: 'Get my info success',
          response_description: `Get my info success. But do not have user with username: ${userInToken.user.username}`,
          request_date_time: new Date().toISOString(),
          ...token,
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

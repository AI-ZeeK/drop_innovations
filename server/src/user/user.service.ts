/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register({
    email,
    password,
    first_name,
    last_name,
    phone_number,
  }: CreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error("Error checking for existing user");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        first_name,
        last_name,
        phone_number,
        password: hashedPassword,
        email,
      },
    });

    const token = await this.jwtService.signAsync({
      user_id: user.user_id,
      email,
    });

    return {
      user: {
        user_id: user.user_id,
        email,
        first_name,
        last_name,
        phone_number,
      },
      access_token: token,
    };
  }

  async login(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new UnauthorizedException("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid email or password");
      }

      const token = await this.jwtService.signAsync({
        user_id: user.user_id,
        email: user.email,
      });

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException("Login failed");
    }
  }
}

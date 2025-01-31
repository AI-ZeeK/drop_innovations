import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum CarType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY',
}

export class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  pickup_location: string;

  @IsString()
  @IsNotEmpty()
  dropoff_location: string;

  @IsEnum(CarType)
  car_type: CarType;
}

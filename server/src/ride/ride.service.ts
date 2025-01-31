/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRideDto, CarType } from "./dto/create-ride.dto";
import { RideStatus, Prisma } from "@prisma/client";

@Injectable()
export class RideService {
  private readonly RATE_PER_KM = {
    [CarType.STANDARD]: 2,
    [CarType.PREMIUM]: 3,
    [CarType.LUXURY]: 4,
  };

  private readonly FIXED_DISTANCE_KM = 10;

  constructor(private prisma: PrismaService) {}

  private calculateFare(carType: CarType, distanceKm: number): number {
    const ratePerKm = this.RATE_PER_KM[carType];
    const baseFare = distanceKm * ratePerKm;

    const bookingFee = 5;

    return Number((baseFare + bookingFee).toFixed(2));
  }

  async createRide({
    createRideDto,
    user_id,
  }: {
    createRideDto: CreateRideDto;
    user_id: number;
  }) {
    try {
      const { pickup_location, dropoff_location, car_type } = createRideDto;

      if (pickup_location.toLowerCase() === dropoff_location.toLowerCase()) {
        throw new BadRequestException(
          "Pickup and drop-off locations cannot be the same"
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { user_id },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const fare = this.calculateFare(car_type, this.FIXED_DISTANCE_KM);

      const ride = await this.prisma.$transaction(async (prisma) => {
        const newRide = await prisma.ride.create({
          data: {
            pickup_location,
            dropoff_location,
            car_type,
            fare,
            user_id,
          },
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                phone_number: true,
              },
            },
          },
        });

        return newRide;
      });

      return {
        ride_id: ride.ride_id,
        pickup_location: ride.pickup_location,
        dropoff_location: ride.dropoff_location,
        car_type: ride.car_type,
        fare: ride.fare,
        status: ride.status,
        user: ride.user,
        distance_km: this.FIXED_DISTANCE_KM,
        created_at: ride.created_at,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException("Database operation failed");
      }
      throw new InternalServerErrorException("Failed to create ride");
    }
  }

  async getUserRides({
    user_id,
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  }: {
    user_id: number;
    status?: RideStatus;
    page?: number;
    limit?: number;
    sortBy?: "created_at" | "fare";
    sortOrder?: "asc" | "desc";
  }) {
    try {
      const where: Prisma.RideWhereInput = {
        user_id,
        ...(status && { status }),
      };

      const rides = await this.prisma.ride.findMany({
        where,
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              phone_number: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      return rides;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException("Database operation failed");
      }
      throw new InternalServerErrorException("Failed to fetch user rides");
    }
  }

  async updateRideStatus({
    ride_id,
    user_id,
    status,
  }: {
    ride_id: number;
    user_id: number;
    status: RideStatus;
  }) {
    try {
      const ride = await this.prisma.ride.findFirst({
        where: { ride_id, user_id },
      });

      if (!ride) {
        throw new NotFoundException("Ride not found");
      }

      // Validate status transition
      if (!this.isValidStatusTransition(ride.status, status)) {
        throw new BadRequestException("Invalid status transition");
      }

      return await this.prisma.ride.update({
        where: { ride_id },
        data: { status },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              phone_number: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException("Database operation failed");
      }
      throw new InternalServerErrorException("Failed to update ride status");
    }
  }

  private isValidStatusTransition(
    currentStatus: RideStatus,
    newStatus: RideStatus
  ): boolean {
    const validTransitions = {
      [RideStatus.PENDING]: [RideStatus.CONFIRMED, RideStatus.CANCELLED],
      [RideStatus.CONFIRMED]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
    } as Record<RideStatus, RideStatus[]>;

    return validTransitions[currentStatus].includes(newStatus);
  }

  async seedUserRides(user_id: number) {
    try {
      const locations = [
        "Airport",
        "Train Station",
        "Shopping Mall",
        "City Center",
        "Beach",
        "Hotel",
        "Restaurant",
        "Park",
        "University",
        "Hospital",
      ];

      const carTypes = [CarType.STANDARD, CarType.PREMIUM, CarType.LUXURY];
      const statuses = [
        RideStatus.PENDING,
        RideStatus.CONFIRMED,
        RideStatus.COMPLETED,
        RideStatus.CANCELLED,
      ];

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const rides: any[] = [];

      // Generate 10 random rides
      for (let i = 0; i < 10; i++) {
        let pickup, dropoff;
        do {
          pickup = locations[Math.floor(Math.random() * locations.length)];
          dropoff = locations[Math.floor(Math.random() * locations.length)];
        } while (pickup === dropoff); // Ensure pickup and dropoff are different

        const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const fare = this.calculateFare(carType, this.FIXED_DISTANCE_KM);

        // Create ride with random date within last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const ride = await this.prisma.ride.create({
          data: {
            user_id,
            pickup_location: pickup,
            dropoff_location: dropoff,
            car_type: carType,
            status,
            fare,
            created_at: date,
          },
        });

        rides.push(ride);
      }

      return {
        message: "Successfully seeded 10 rides",
        count: rides.length,
        rides: rides.map((ride) => ({
          ride_id: ride.ride_id,
          pickup_location: ride.pickup_location,
          dropoff_location: ride.dropoff_location,
          car_type: ride.car_type,
          fare: ride.fare,
          status: ride.status,
          user: ride.user,
          distance_km: this.FIXED_DISTANCE_KM,
          created_at: ride.created_at,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException("Database operation failed");
      }
      throw new InternalServerErrorException("Failed to seed rides");
    }
  }
}

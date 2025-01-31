import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { RideService } from "./ride.service";
import { CreateRideDto } from "./dto/create-ride.dto";
import { UserGuard } from "src/user/user.guard";
import { RideStatus } from "@prisma/client";

@Controller("rides")
@UseGuards(UserGuard)
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post()
  create(@Request() req: any, @Body() createRideDto: CreateRideDto) {
    return this.rideService.createRide({
      createRideDto,
      user_id: req.user.user_id,
    });
  }

  @Get()
  getUserRides(
    @Request() req: any,
    @Query("status") status?: RideStatus,
    @Query("page", ParseIntPipe) page?: number,
    @Query("limit", ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: "created_at" | "fare",
    @Query("sortOrder") sortOrder?: "asc" | "desc"
  ) {
    return this.rideService.getUserRides({
      user_id: req.user.user_id,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Patch(":id/status")
  updateStatus(
    @Request() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: RideStatus
  ) {
    return this.rideService.updateRideStatus({
      ride_id: id,
      user_id: req.user.user_id,
      status,
    });
  }

  @Post("seed")
  seedUserRides(@Request() req: any) {
    return this.rideService.seedUserRides(req.user.user_id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { type CreateContributionDto, GroupGiftsService } from "./group-gifts.service"

interface AuthenticatedRequest {
  user: {
    id: string
  }
}

@Controller("items/:id/contributions")
export class GroupGiftsController {
  constructor(
    private readonly groupGiftsService: GroupGiftsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getContributions(@Param("id") itemId: string) {
    return this.groupGiftsService.getContributions(itemId)
  }

  @Post()
  async addContribution(
    @Param("id") itemId: string,
    @Body() dto: CreateContributionDto,
    @Headers("authorization") authHeader?: string,
  ) {
    let userId: string | undefined
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1]
        const payload = this.jwtService.decode(token) as { sub?: string; id?: string } | null
        userId = payload?.sub || payload?.id
      } catch {
        // guest contribution
      }
    }

    return this.groupGiftsService.addContribution(itemId, dto, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":contributionId")
  async deleteContribution(
    @Param("contributionId") contributionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.groupGiftsService.deleteContribution(contributionId, req.user.id)
  }
}

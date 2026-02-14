import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { FriendsService } from "./friends.service"

@Controller("api/friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post("request/:id")
  async sendRequest(
    @CurrentUser("id") userId: string,
    @Param("id") friendId: string,
  ) {
    return this.friendsService.sendRequest(userId, friendId)
  }

  @Post("respond/:id")
  async respondToRequest(
    @CurrentUser("id") userId: string,
    @Param("id") requestId: string,
    @Body("accept") accept: boolean,
  ) {
    return this.friendsService.respondToRequest(userId, requestId, accept)
  }

  @Get("me")
  async getMyFriends(@CurrentUser("id") userId: string) {
    return this.friendsService.getMyFriends(userId)
  }

  @Get("pending")
  async getPendingRequests(@CurrentUser("id") userId: string) {
    return this.friendsService.getPendingRequests(userId)
  }

  @Get("search")
  async searchUsers(
    @CurrentUser("id") userId: string,
    @Query("q") query: string,
  ) {
    return this.friendsService.searchUsers(query, userId)
  }

  @Post("invite")
  async invite(
    @CurrentUser("id") userId: string,
    @Body("email") email: string,
  ) {
    return this.friendsService.createInvitation(userId, email)
  }
}

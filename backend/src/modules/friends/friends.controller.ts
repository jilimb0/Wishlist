import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { Public } from "../auth/public.decorator"
import { FriendsService } from "./friends.service"

@Controller("api/friends")
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Public()
  @Get("invitations/:token")
  async previewInvitation(@Param("token") token: string) {
    return this.friendsService.getInvitationByToken(token)
  }

  @Post("request/:id")
  async sendRequest(@CurrentUser("id") userId: string, @Param("id") friendId: string) {
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

  @Delete("request/:id")
  async cancelRequest(@CurrentUser("id") userId: string, @Param("id") requestId: string) {
    return this.friendsService.cancelRequest(userId, requestId)
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
  async searchUsers(@CurrentUser("id") userId: string, @Query("q") query: string) {
    return this.friendsService.searchUsers(query, userId)
  }

  @Post("invite")
  async invite(@CurrentUser("id") userId: string, @Body("email") email: string) {
    return this.friendsService.createInvitation(userId, email)
  }

  @Delete(":id")
  async removeFriendship(@CurrentUser("id") userId: string, @Param("id") friendshipId: string) {
    return this.friendsService.removeFriendship(userId, friendshipId)
  }
}

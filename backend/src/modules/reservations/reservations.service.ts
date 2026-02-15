import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { ReservationStatus } from "@prisma/client"
import type { PrismaService } from "../../prisma/prisma.service"
import type { CreateReservationDto } from "./dto/reservation.dto"

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Reserve an item.
   * Uses a Prisma interactive transaction to avoid race conditions.
   * Also catches P2002 (unique constraint) as a safety net.
   */
  async reserve(itemId: string, userId: string, dto: CreateReservationDto) {
    try {
      return await this.prisma.$transaction(async (tx: any) => {
        const item = await tx.item.findUnique({
          where: { id: itemId },
          include: {
            wishlist: { select: { userId: true, id: true, title: true } },
            reservation: true,
          },
        })

        if (!item) throw new NotFoundException("Item not found")

        // Cannot reserve own items
        if (item.wishlist.userId === userId) {
          throw new ForbiddenException("Cannot reserve your own items")
        }

        // Check if already actively reserved
        if (item.reservation && item.reservation.status === ReservationStatus.ACTIVE) {
          throw new ConflictException("Item is already reserved")
        }

        // If there is a cancelled/fulfilled reservation, delete it first
        if (item.reservation) {
          await tx.reservation.delete({
            where: { id: item.reservation.id },
          })
        }

        const reservation = await tx.reservation.create({
          data: {
            itemId,
            userId,
            isAnonymous: dto.isAnonymous || false,
          },
          include: {
            item: {
              select: { id: true, title: true, imageUrl: true },
            },
          },
        })

        // Create notification for wishlist owner
        await tx.notification.create({
          data: {
            userId: item.wishlist.userId,
            type: "RESERVATION",
            title: "Item Reserved",
            message: `Someone reserved "${item.title}" from your wishlist "${item.wishlist.title}"`,
            relatedItemId: item.id,
          },
        })

        return reservation
      })
    } catch (e: any) {
      // Catch unique constraint violation as a safety net for race conditions
      if (e?.code === "P2002") {
        throw new ConflictException("Item is already reserved")
      }
      throw e
    }
  }

  /**
   * Cancel a reservation — hard-delete for consistency with @unique constraint.
   */
  async cancel(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) throw new NotFoundException("Reservation not found")
    if (reservation.userId !== userId) throw new ForbiddenException("Not your reservation")

    await this.prisma.reservation.delete({
      where: { id: reservationId },
    })

    return { success: true }
  }

  async getMyReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId, status: ReservationStatus.ACTIVE },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            url: true,
            imageUrl: true,
            currentPrice: true,
            currency: true,
            wishlist: {
              select: {
                id: true,
                title: true,
                user: { select: { id: true, displayName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}

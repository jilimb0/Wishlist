import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from "@nestjs/common"
import type { Response } from "express"
import { PrismaService } from "../../prisma/prisma.service"
import { AffiliateService } from "./affiliate.service"

@Controller()
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("affiliate/redirect")
  redirectCustomUrl(@Query("url") rawUrl: string, @Res() res: Response) {
    if (!rawUrl) {
      throw new BadRequestException("Target URL is required")
    }

    const affiliateUrl = this.affiliateService.getAffiliateUrl(rawUrl)
    return res.redirect(302, affiliateUrl)
  }

  @Get("items/:id/out")
  async redirectItem(@Param("id") itemId: string, @Res() res: Response) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, url: true, title: true },
    })

    if (!item) {
      throw new NotFoundException("Item not found")
    }

    const affiliateUrl = this.affiliateService.getAffiliateUrl(item.url)
    return res.redirect(302, affiliateUrl)
  }
}

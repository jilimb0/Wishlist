import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { type AffiliateMerchant, detectMerchant, generateAffiliateUrl } from "@wishtracker/shared"

@Injectable()
export class AffiliateService {
  constructor(private readonly configService: ConfigService) {}

  getAffiliateUrl(originalUrl: string): string {
    const amazonTag = this.configService.get<string>("AMAZON_AFFILIATE_TAG") || "wishtracker-20"
    const ozonPartner = this.configService.get<string>("OZON_PARTNER_CODE") || "wishtracker"
    const wbPartner = this.configService.get<string>("WB_PARTNER_CODE") || "wishtracker"

    return generateAffiliateUrl(originalUrl, {
      amazonTag,
      ozonPartner,
      wbPartner,
    })
  }

  getMerchant(url: string): AffiliateMerchant {
    return detectMerchant(url)
  }
}

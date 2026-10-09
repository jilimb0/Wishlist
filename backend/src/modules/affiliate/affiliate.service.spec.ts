import { ConfigService } from "@nestjs/config"
import { Test, type TestingModule } from "@nestjs/testing"
import { AffiliateService } from "./affiliate.service"

describe("AffiliateService", () => {
  let service: AffiliateService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliateService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === "AMAZON_AFFILIATE_TAG") return "custom-tag-20"
              if (key === "OZON_PARTNER_CODE") return "custom-ozon"
              if (key === "WB_PARTNER_CODE") return "custom-wb"
              return null
            },
          },
        },
      ],
    }).compile()

    service = module.get(AffiliateService)
  })

  it("appends Amazon affiliate tag from configuration", () => {
    const url = service.getAffiliateUrl("https://www.amazon.com/dp/B08N5WRWNW")
    expect(url).toContain("tag=custom-tag-20")
  })

  it("appends Ozon partner code", () => {
    const url = service.getAffiliateUrl("https://www.ozon.ru/product/123456/")
    expect(url).toContain("partner=custom-ozon")
  })

  it("appends Wildberries affiliate parameters", () => {
    const url = service.getAffiliateUrl("https://www.wildberries.ru/catalog/123456/detail.aspx")
    expect(url).toContain("utm_source=wishtracker")
  })
})

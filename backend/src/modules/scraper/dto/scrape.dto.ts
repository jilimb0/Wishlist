import { IsUrl } from "class-validator"

export class ScrapeDto {
  @IsUrl()
  url!: string
}

import { IsBoolean, IsOptional } from "class-validator"

export class CreateSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  notifyNewItems?: boolean
}

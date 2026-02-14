import { IsOptional, IsBoolean } from "class-validator"

export class CreateSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  notifyNewItems?: boolean
}

import { IsOptional, IsBoolean } from "class-validator"

export class CreateReservationDto {
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean
}

import { IsBoolean, IsOptional } from "class-validator"

export class CreateReservationDto {
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean
}

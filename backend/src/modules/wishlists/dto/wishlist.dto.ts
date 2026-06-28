import { Privacy } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  emoji?: string

  @IsEnum(Privacy)
  privacy!: Privacy
}

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  emoji?: string

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy
}

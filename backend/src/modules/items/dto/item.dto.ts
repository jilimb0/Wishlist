import {
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from "class-validator"

export class CreateItemDto {
  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsString()
  currency?: string
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  priority?: number

  @IsOptional()
  @IsBoolean()
  trackPrice?: boolean

  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsString()
  currency?: string
}

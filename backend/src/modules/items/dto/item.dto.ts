import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from "class-validator"

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
  @IsIn(["ACTIVE", "COMPLETED"])
  status?: "ACTIVE" | "COMPLETED"

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
  @IsIn(["ACTIVE", "COMPLETED"])
  status?: "ACTIVE" | "COMPLETED"

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

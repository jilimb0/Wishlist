import { IsOptional, IsString, IsUrl } from "class-validator"

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsUrl()
  avatarUrl?: string

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsString()
  currency?: string
}

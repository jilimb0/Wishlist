import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class RegisterDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsString()
  @IsNotEmpty()
  displayName!: string

  @IsOptional()
  @IsString()
  inviteToken?: string
}

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  password!: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string

  @IsString()
  @MinLength(6)
  password!: string
}

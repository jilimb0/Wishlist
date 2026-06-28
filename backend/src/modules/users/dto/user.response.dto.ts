import type { User } from "@prisma/client"
import { Exclude, Expose } from "class-transformer"

export class UserResponseDto {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }

  @Expose()
  id!: string

  @Expose()
  email!: string

  @Expose()
  displayName!: string

  @Expose()
  avatarUrl!: string | null

  @Expose()
  createdAt!: Date

  @Exclude()
  passwordHash!: string

  @Exclude()
  updatedAt!: Date
}

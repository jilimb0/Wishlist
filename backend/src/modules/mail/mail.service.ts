import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(private config: ConfigService) {
    const host = this.config.get<string>("mail.smtp.host")
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>("mail.smtp.port"),
        secure: false,
        auth: {
          user: this.config.get<string>("mail.smtp.user"),
          pass: this.config.get<string>("mail.smtp.pass"),
        },
      })
    }
  }

  async send(options: SendMailOptions): Promise<void> {
    const from = this.config.get<string>("mail.from")!

    if (!this.transporter) {
      this.logger.warn(`[MAIL:dev] To: ${options.to} | ${options.subject}`)
      this.logger.warn(options.text || options.html)
      return
    }

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
  }
}

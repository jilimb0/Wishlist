import { PinoLogger } from "./pino-logger"

describe("PinoLogger", () => {
  let logger: PinoLogger

  beforeAll(() => {
    logger = PinoLogger.create("TestContext")
  })

  it("should be defined", () => {
    expect(logger).toBeDefined()
  })

  it("should have all required methods", () => {
    expect(typeof logger.log).toBe("function")
    expect(typeof logger.error).toBe("function")
    expect(typeof logger.warn).toBe("function")
    expect(typeof logger.debug).toBe("function")
    expect(typeof logger.verbose).toBe("function")
  })

  it("should log without throwing", () => {
    expect(() => logger.log("test message")).not.toThrow()
    expect(() => logger.error("test error")).not.toThrow()
    expect(() => logger.warn("test warning")).not.toThrow()
  })
})

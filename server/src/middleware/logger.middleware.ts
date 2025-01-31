import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const userAgent = req.get("user-agent") || "";

    this.logger.log(
      `${method} ${originalUrl} - Body: ${JSON.stringify(
        body
      )} - User Agent: ${userAgent}`
    );

    const startTime = Date.now();
    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.get("content-length");
      const duration = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms`
      );
    });

    next();
  }
}

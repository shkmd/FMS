import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { buildAuthenticatedUser } from "./build-authenticated-user";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "change-me-access-secret",
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    return buildAuthenticatedUser(this.prisma, payload.sub);
  }
}

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { buildAuthenticatedUser } from "./build-authenticated-user";

const REFRESH_TOKEN_BYTES = 48;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseTtlToMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 60_000;
  return value * unitMs;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email or password");
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid email or password");
    return user;
  }

  private signAccessToken(userId: string, email: string) {
    return this.jwt.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? "change-me-access-secret",
        expiresIn: process.env.JWT_ACCESS_TTL ?? "15m",
      },
    );
  }

  private async issueRefreshToken(userId: string) {
    const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const ttlMs = parseTtlToMs(process.env.JWT_REFRESH_TTL ?? "7d");
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });
    return { token, ttlMs };
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);
    const accessToken = this.signAccessToken(user.id, user.email);
    const { token: refreshToken, ttlMs } = await this.issueRefreshToken(user.id);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.write({ entityType: "User", entityId: user.id, action: "LOGIN", userId: user.id });
    const authUser = await buildAuthenticatedUser(this.prisma, user.id);
    return { accessToken, refreshToken, refreshTtlMs: ttlMs, user: authUser };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");
    const tokenHash = hashToken(refreshToken);
    const record = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }
    // rotate
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is no longer active");
    }
    const accessToken = this.signAccessToken(user.id, user.email);
    const { token: newRefreshToken, ttlMs } = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken: newRefreshToken, refreshTtlMs: ttlMs };
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async me(userId: string) {
    return buildAuthenticatedUser(this.prisma, userId);
  }

  /** No email/SMS provider wired yet — the reset link is logged to the API console for demo purposes. */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return; // do not reveal whether the email exists
    const token = crypto.randomBytes(32).toString("hex");
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // eslint-disable-next-line no-console
    console.log(`[password-reset] Reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const record = await this.prisma.passwordResetToken.findFirst({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Reset link is invalid or expired");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.audit.write({ entityType: "User", entityId: record.userId, action: "RESET_PASSWORD" });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.audit.write({ entityType: "User", entityId: userId, action: "CHANGE_PASSWORD", userId });
  }
}

import { Body, Controller, Post, Get, Req, Res, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

const REFRESH_COOKIE = "fms_refresh";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setRefreshCookie(res: Response, token: string, ttlMs: number) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ttlMs,
      path: "/api/auth",
    });
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, refreshTtlMs, user } = await this.auth.login(dto.email, dto.password);
    this.setRefreshCookie(res, refreshToken, refreshTtlMs);
    return { accessToken, user };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    const { accessToken, refreshToken, refreshTtlMs } = await this.auth.refresh(token);
    this.setRefreshCookie(res, refreshToken, refreshTtlMs);
    return { accessToken };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    await this.auth.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return { success: true };
  }

  @Public()
  @Post("request-password-reset")
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.auth.requestPasswordReset(dto.email);
    return { success: true };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }

  @Get("me")
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(user.id, dto.currentPassword, dto.newPassword);
    return { success: true };
  }
}

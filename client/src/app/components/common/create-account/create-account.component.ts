import { Component, ViewChild } from "@angular/core";
import { AuthService } from "src/app/services/api/auth/auth-service.service";
import { ICreateAccountRequest } from "src/app/models/api/request/common/create-account.interface";
import { Router } from "@angular/router";
import * as zxcvbn from "zxcvbn";
import { NbPopoverDirective } from "@nebular/theme";

@Component({
  selector: "app-create-account",
  templateUrl: "./create-account.component.html",
  styleUrls: ["./create-account.component.scss"]
})
export class CreateAccountComponent {

  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public password: string = "";
  public organisation: string = "";

  public zxcvbnResult: zxcvbn.ZXCVBNResult;
  private readonly ZXCVBN_RESULT_SCORE_FAIL: number = 2;
  public readonly ZXCVBN_RESULT_SCORE_WARNING: number = 3;

  @ViewChild(NbPopoverDirective) passwordProtocolPopover: NbPopoverDirective;

  public accountCreated: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  public showPasswordProtocols(show: boolean): void {
    show ?
      this.passwordProtocolPopover.show() :
      this.passwordProtocolPopover.hide();
  }

  public async submit() {
    if (
      !this.passwordPassesProtocols()
      || !this.zxcvbnResult
      || this.zxcvbnResult.score < this.ZXCVBN_RESULT_SCORE_FAIL
    ) {
      return;
    }

    const createdAccount = await this.authService.createUser({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      organisationName: this.organisation,
      type: "Supplier"
    } as ICreateAccountRequest);

    if (createdAccount.errors.length > 0) {
      return;
    }

    this.accountCreated = true;
  }

  public goToDashboard() {
    this.router.navigate(["/"]);
  }

  public passwordDoesContainUppercase(): boolean {
    const r = /[A-Z]/;
    return r.test(this.password);
  }

  public passwordDoesContainLowercase(): boolean {
    const r = /[a-z]/;
    return r.test(this.password);
  }

  public passwordDoesContainNumber(): boolean {
    const r = /[0-9]/;
    return r.test(this.password);
  }

  public getPasswordProtocolIcon(valid: boolean): string {
    return valid ? "checkmark-circle-2-outline" : "close-outline";
  }

  public getPasswordProtocolIconColour(valid: boolean): string {
    return valid ? "var(--color-success-500)" : "var(--color-danger-500)";
  }

  public passwordPassesProtocols(): boolean {
    return this.passwordDoesContainLowercase()
      && this.passwordDoesContainUppercase()
      && this.passwordDoesContainNumber()
      && this.password.length >= 8;
  }

  public zxcvbnCheck(): boolean {
    if (this.passwordPassesProtocols()) {
      this.zxcvbnResult = zxcvbn(this.password);
      return true;
    }
    return false;
  }

  public getZxcvbnCheckResult(): zxcvbn.ZXCVBNResult {
    return this.zxcvbnResult;
  }

  public getZxcvbnCheckStyle(): any {
    if (this.zxcvbnResult.score < this.ZXCVBN_RESULT_SCORE_FAIL) {
      // red alert
      return {
        backgroundColor: "var(--color-danger-100)",
        color: "red",
        border: "1px solid red"
      };
    }

    // warning
    return {
      backgroundColor: "var(--color-warning-100)",
      color: "#67512b",
      border: "1px solid #67512b"
    };
  }

  public getZxcvbnCheckText(): string {
    if (this.zxcvbnResult.score < this.ZXCVBN_RESULT_SCORE_FAIL) {
      return "This password is too weak. Please enter a stronger password.";
    }

    return "You will be able to proceed with this password - but it is considered weak. Please consider using a stronger password.";
  }

  public getZxcvbnCheckIcon(): string {
    if (this.zxcvbnResult.score < this.ZXCVBN_RESULT_SCORE_FAIL) {
      return "close-circle-outline";
    }

    return "alert-triangle-outline";
  }
}

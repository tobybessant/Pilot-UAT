import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { IApiResponse } from "src/app/models/response/api-response.interface";
import { ICreateAccountRequest } from "src/app/models/request/common/create-account.interface";
import { ISignInRequest } from "src/app/models/request/common/sign-in.interface";
import { ISignInResponse } from "src/app/models/response/common/sign-in.interface";
import { IUserResponse } from "src/app/models/response/common/user.interface";
import { ICreateAccountResponse } from "src/app/models/response/common/create-account.interface";
import { Observable, BehaviorSubject } from "rxjs";
import { UserApiService } from "./user-api.service";
import { SessionService } from "../session.service";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  protected readonly baseUrl: string = "/auth";

  constructor(
    protected apiService: ApiService,
    protected sessionService: SessionService
    ) { }

  public async createUser(user: ICreateAccountRequest): Promise<IApiResponse<ICreateAccountResponse>> {
    const response =  await this.apiService.post<ICreateAccountResponse>(this.baseUrl + "/createaccount", user);

    // if user successfully created account then log them in
    if (response !== undefined) {
      await this.sessionService.setUser();
    }

    return response;
  }

  public async login(credentials: ISignInRequest): Promise<IApiResponse<ISignInResponse>> {
    const response = await this.apiService.post<ISignInResponse>(this.baseUrl + "/login", credentials);

    // if user successfully logged in
    if (response !== undefined) {
      await this.sessionService.setUser();
    }

    return response;
  }

  public async logout(): Promise<void> {
    await this.apiService.get<void>(this.baseUrl + "/logout");
    this.sessionService.logout();
  }
}

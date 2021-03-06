import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { IUserResponse } from "../../models/api/response/common/user.interface";
import { UserApiService } from "../api/user/user-api.service";

@Injectable({
  providedIn: "root"
})
export class SessionService {

  private subject = new Subject<IUserResponse>();
  private currentUser: IUserResponse;

  constructor(private userService: UserApiService) { }

  async setUser() {
    const response = await this.userService.getLoggedInAccountDetails();
    this.currentUser = response.payload;
    this.subject.next(this.currentUser);
  }

  public getSubject(): Observable<IUserResponse> {
    return this.subject.asObservable();
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public logout() {
    this.currentUser = null;
    this.subject.next(null);
  }
}

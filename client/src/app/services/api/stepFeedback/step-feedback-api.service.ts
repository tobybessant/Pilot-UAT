import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { IApiResponse } from "src/app/models/api/response/api-response.interface";

@Injectable({
  providedIn: "root"
})
export class StepFeedbackApiService {

  private readonly baseUrl: string = "/feedback";

  constructor(private apiService: ApiService) { }

  public getLatestStepFeedbackFromUser(stepId: string, userEmail): Promise<IApiResponse<any>> {
    return this.apiService.get(`${this.baseUrl}?stepId=${stepId}&userEmail=${userEmail}&onlyLatest=true`);
  }
}

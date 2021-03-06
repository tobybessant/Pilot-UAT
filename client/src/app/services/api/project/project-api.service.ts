import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { IProjectResponse } from "../../../models/api/response/supplier/project.interface";
import { ICreateProjectRequest } from "src/app/models/api/request/supplier/create-project.interface";
import { ICreateProjectResponse } from "src/app/models/api/response/supplier/create-project.interface";
import { IUserResponse } from "src/app/models/api/response/common/user.interface";

@Injectable({
  providedIn: "root"
})
export class ProjectApiService {

  protected readonly baseUrl: string = "/projects";

  constructor(protected apiService: ApiService) { }

  public async getProjects() {
    const response = await this.apiService.get<IProjectResponse[]>(this.baseUrl);
    return response;
  }

  public async getProjectById(id: string, extensive?: boolean) {
    const response = await this.apiService.get<IProjectResponse>(`${this.baseUrl}/${id}?extensive=${extensive === true}`);
    return response;
  }

  public async addProject(projectDetails: ICreateProjectRequest) {
    const response = await this.apiService.post<ICreateProjectResponse>(this.baseUrl, projectDetails);
    return response;
  }

  public async deleteProject(projectId: string) {
    const response = await this.apiService.delete<void>(`${this.baseUrl}/${projectId}`);
    return response;
  }

  public async getUsersForProject(projectId: string) {
    const response = await this.apiService.get<IUserResponse[]>(`${this.baseUrl}/${projectId}/users`);
    return response;
  }

  public async getOpenInvitesForProject(projectId: string) {
    const response = await this.apiService.get<any[]>(`${this.baseUrl}/${projectId}/invites`);
    return response;
  }

  public async removeUserFromProject(userId: string, projectId: string) {
    const response = await this.apiService.delete<any>(`${this.baseUrl}/${projectId}/${userId}`);
    return response;
  }
}

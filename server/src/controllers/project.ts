import { injectable } from "tsyringe";
import { Controller, ClassMiddleware, Post, Middleware, Get, Delete } from "@overnightjs/core";
import { Request, Response } from "express";
import { checkAuthentication } from "../services/middleware/checkAuthentication";
import { BodyMatches } from "../services/middleware/joi/bodyMatches";
import { PermittedAccountTypes } from "../services/middleware/permittedAccountTypes";
import { CreateProject } from "../services/middleware/joi/schemas/createProject";
import { IUserToken } from "../dto/response/common/userToken";
import { IProjectResponse } from "../dto/response/supplier/project";
import { ProjectRepository } from "../repositories/projectRepository";
import { UserRepository } from "../repositories/userRepository";
import { BaseController } from "./baseController";
import { ICreateProjectRequest } from "../dto/request/supplier/createProject";
import { GetProject } from "../services/middleware/joi/schemas/getProject";
import { IGetProjectRequest } from "../dto/request/supplier/getProject";
import { Validator } from "joiful";
import { BAD_REQUEST } from "http-status-codes";
import { ApiError } from "../services/apiError";
import { IUserResponse } from "../dto/response/common/user";

@injectable()
@Controller("project")
@ClassMiddleware(checkAuthentication)
export class ProjectController extends BaseController {

  constructor(
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository
  ) {
    super();
  }

  @Post("create")
  @Middleware([
    new BodyMatches(new Validator()).schema(CreateProject),
    PermittedAccountTypes.are(["Supplier"])
  ])
  public async createProject(req: Request, res: Response) {
    const model: ICreateProjectRequest = req.body;

    try {
      const user = await this.userRepository.getUserByEmail((req.user as IUserToken).email);
      if (!user) {
        throw new ApiError("Error finding user", BAD_REQUEST);
      }

      const project = await this.projectRepository.addProject(user, model.title);

      this.created<IProjectResponse>(res, {
        title: project.title,
        id: project.id.toString(),
        suites: project.suites.map(suite => ({
          id: suite.id.toString(),
          title: suite.title
        }))
      });

    } catch (error) {
      if (error instanceof ApiError) {
        this.errorResponse(res, error.statusCode, [error.message]);
        return;
      }
      this.serverError(res);
    }
  }

  @Post()
  @Middleware(
    new BodyMatches(new Validator()).schema(GetProject)
  )
  public async getProjectById(req: Request, res: Response) {
    const model: IGetProjectRequest = req.body;

    try {
      const project = await this.projectRepository.getProjectById(model.id);

      if (!project) {
        throw new ApiError("That project does not exist", BAD_REQUEST);
      }

      this.OK<IProjectResponse>(res, {
        id: project.id.toString(),
        title: project.title,
        suites: project.suites.map(s => ({
          id: s.id.toString(),
          title: s.title
        }))
      });
    } catch (error) {
      if (error instanceof ApiError) {
        this.errorResponse(res, error.statusCode, [error.message]);
        return;
      }

      this.serverError(res);
    }
  }

  @Get("all")
  public async getProjects(req: Request, res: Response) {
    try {
      let projects = await this.projectRepository.getProjectsForUser((req.user as IUserToken).email);
      projects = projects ? projects : [];

      this.OK<IProjectResponse[]>(res, projects.map(r =>
        ({
          id: r.id.toString(),
          title: r.title
        }))
      );
    } catch (error) {
      this.serverError(res);
    }
  }

  @Delete(":id")
  public async deleteProject(req: Request, res: Response) {
    const projectId = req.params.id;

    try {
      const deletedProject = await this.projectRepository.deleteProjectById(projectId);
      this.OK(res);
    } catch (error) {
      this.serverError(res);
    }
  }

  @Get(":id/users")
  public async getUsersForProject(req: Request, res: Response) {
    const userRoles = await this.projectRepository.getUsersForProject(req.params.id);

    this.OK<IUserResponse[]>(res, userRoles.map(role => ({
      email: role.user.email,
      firstName: role.user.firstName,
      lastName: role.user.lastName,
      type: role.user.userType.type,
      organisations: role.user.organisations,
      createdDate: role.user.createdDate
    })));
  }
}

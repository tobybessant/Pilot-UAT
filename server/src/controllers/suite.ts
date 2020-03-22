import { injectable } from "tsyringe";
import { Controller, ClassMiddleware, Post, Middleware, Delete } from "@overnightjs/core";
import { checkAuthentication } from "../services/middleware/checkAuthentication";
import { Request, Response } from "express";
import { TestSuiteRepository } from "../repositories/suiteRepository";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import { ProjectRepository } from "../repositories/projectRepository";
import { PermittedAccountTypes } from "../services/middleware/permittedAccountTypes";
import { ISuiteResponse } from "../dto/response/supplier/suite";
import { BaseController } from "./baseController";
import { ApiError } from "../services/apiError";
import { BodyMatches } from "../services/middleware/joi/bodyMatches";
import { ICreateSuiteRequest } from "../dto/request/supplier/createSuite";
import { CreateSuite } from "../services/middleware/joi/schemas/createSuite";
import { GetAllSuites } from "../services/middleware/joi/schemas/getAllSuites";
import { IGetAllSuitesRequest } from "../dto/request/supplier/getAllSuites";
import { Validator } from "joiful";

@injectable()
@Controller("suite")
@ClassMiddleware(checkAuthentication)
export class TestSuiteController extends BaseController {

  constructor(
    private testSuiteRepository: TestSuiteRepository,
    private projectsRepository: ProjectRepository
  ) {
    super();
  }

  @Post("create")
  @Middleware([
    new BodyMatches(new Validator()).schema(CreateSuite),
    PermittedAccountTypes.are(["Supplier"])
  ])
  public async createTestSuite(req: Request, res: Response) {
    const model: ICreateSuiteRequest = req.body;

    try {
      const project = await this.projectsRepository.getProjectById(model.projectId);
      if (!project) {
        throw new ApiError("Project does not exist", BAD_REQUEST);
      }

      const suite = await this.testSuiteRepository.addTestSuite(project, model.title);

      if (!suite) {
        throw new ApiError("Failed to add suite", INTERNAL_SERVER_ERROR);
      }

      this.OK<ISuiteResponse>(res, {
        title: suite.title,
        id: suite.id
      });

    } catch (error) {
      if (error instanceof ApiError) {
        this.errorResponse(res, error.statusCode, [error.message]);
      } else {
        this.serverError(res);
      }
    }
  }

  @Post("all")
  @Middleware(new BodyMatches(new Validator()).schema(GetAllSuites))
  public async getTestSuites(req: Request, res: Response) {
    const model: IGetAllSuitesRequest = req.body;

    try {
      const testSuites = await this.projectsRepository.getTestSuitesForProject(model.projectId);

      this.OK<ISuiteResponse[]>(res, testSuites.map(suite =>
        ({
          title: suite.title,
          id: suite.id
        })))
    } catch (error) {
      this.serverError(res);
    }
  }

  @Delete(":id")
  @Middleware(PermittedAccountTypes.are(["Supplier"]))
  public async deleteSuite(req: Request, res: Response) {
    const suiteId = req.params.id;

    try {
      const deletedSuite = await this.testSuiteRepository.deleteTestSuiteById(suiteId);
      this.OK(res);
    } catch (error) {
      this.serverError(res);
    }
  }
}
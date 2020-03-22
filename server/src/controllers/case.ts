import { Controller, ClassMiddleware, Post, Delete } from "@overnightjs/core";
import { injectable } from "tsyringe";
import { checkAuthentication } from "../services/middleware/checkAuthentication";
import { CaseRepository } from "../repositories/caseRepository";
import { Request, Response } from "express";
import { TestSuiteRepository } from "../repositories/suiteRepository";
import { ICaseResponse } from "../dto/response/supplier/case";
import { BAD_REQUEST } from "http-status-codes";
import { BaseController } from "./baseController";
import { ApiError } from "../services/apiError";

@injectable()
@Controller("case")
@ClassMiddleware(checkAuthentication)
export class TestController extends BaseController {
  constructor(
    private testRepository: CaseRepository,
    private suiteRepository: TestSuiteRepository
  ) {
    super();
  }

  @Post("create")
  public async addCase(req: Request, res: Response) {
    const { title, suiteId } = req.body;

    try {
      const suite = await this.suiteRepository.getTestSuiteById(suiteId);
      if (!suite) {
        throw new ApiError("Suite not found", BAD_REQUEST);
      }

      const test = await this.testRepository.addCase(suite, title);

      this.OK<ICaseResponse>(res, {
        id: test.id,
        title: test.title
      });
    } catch (error) {
      if (error instanceof ApiError) {
        this.errorResponse(res, error.statusCode, [error.message]);
      } else {
        this.serverError(res);
      }
    }
  }

  @Post()
  public async getCasesForSuite(req: Request, res: Response) {
    const { suiteId } = req.body;

    try {
      const tests = await this.testRepository.getCasesForTestSuite(suiteId);

      this.OK<ICaseResponse[]>(res, tests.map(t =>
        ({
          id: t.id,
          title: t.title
        }))
      )
    } catch (error) {
      this.serverError(res);
    }
  }

  @Post("update")
  public async updateCase(req: Request, res: Response) {
    const test: ICaseResponse = req.body;

    try {
      const savedTest = await this.testRepository.updateCase(test);

      this.OK<ICaseResponse>(res, {
        id: savedTest.id,
        title: savedTest.title
      });
    } catch (error) {
     this.serverError(res);
    }
  }

  @Delete(":id")
  public async deleteCaseById(req: Request, res: Response) {
    const testId = req.params.id;

    try {
      await this.testRepository.deleteCaseById(testId);
      this.OK(res);
    } catch (error) {
      this.serverError(res);
    }
  }
}
import { Component, OnInit, OnDestroy, QueryList, ChangeDetectorRef, ContentChildren, ViewChild, ViewChildren } from "@angular/core";
import { Location } from "@angular/common";
import { ProjectApiService } from "src/app/services/api/project/project-api.service";
import { NbMenuItem, NbTabComponent } from "@nebular/theme";
import { IProjectResponse } from "src/app/models/api/response/supplier/project.interface";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { TestSuiteApiService } from "src/app/services/api/suite/test-suite-api.service";
import { ISuiteResponse } from "src/app/models/api/response/supplier/suite.interface";
import { NavbarService } from "src/app/services/navbar/navbar.service";
import { BasicNavButtonComponent } from "../../common/nav/basic-nav-button/basic-nav-button.component";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"]
})
export class ProjectComponent implements OnInit, OnDestroy {

  public project: IProjectResponse;
  public fetchAttemptComplete = false;
  public activeSuite: ISuiteResponse;
  public projectSettings: NbMenuItem[] = [];
  public suiteMenuItems: NbMenuItem[] = [];

  constructor(
    private router: Router,
    private projectsApiService: ProjectApiService,
    private testSuiteApiService: TestSuiteApiService,
    private activeRoute: ActivatedRoute,
    private location: Location,
    private navbarService: NavbarService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((urlParameters) => this.fetchProjectById(urlParameters.id));
    this.navbarService.setActiveButton({
      component: BasicNavButtonComponent,
      data: {
        label: "Exit Project",
        callback: () => {
          this.router.navigate(["/"]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.projectSettings = null;
  }

  private async fetchProjectById(id: string) {
    const response = await this.projectsApiService.getProjectById(id);
    if (response.errors.length === 0) {
      this.project = response.payload;
      this.setActiveSuite(response.payload.suites[0]);
      this.navbarService.setHeader(response.payload.title);
    }
    this.fetchAttemptComplete = true;
  }

  public updateActiveSuite($event) {
    this.setActiveSuite(this.project.suites.filter(suite => suite.id === $event)[0]);
  }

  public async fetchSuites() {
    const response = await this.testSuiteApiService.getTestSuitesForProject(this.project.id);
    if (response.errors.length > 0) {
      return;
    }
    this.project.suites = response.payload;
  }

  public async addSuiteToProject(suiteName: string) {
    await this.testSuiteApiService.addTestSuite({
      title: suiteName,
      projectId: this.project.id
    });
    await this.fetchSuites();
    this.setActiveSuite(this.project.suites[this.project.suites.length - 1]);
  }

  public async suiteDeleted(suiteId: string) {
    const deletedIndex = this.project.suites.findIndex(suite => suite.id === suiteId);
    await this.fetchSuites();

    // assume not at the end
    let newSelectedIndex = deletedIndex;

    // if at end, decrement
    if (deletedIndex === this.project.suites.length) {
      newSelectedIndex--;
    }

    this.setActiveSuite(this.project.suites[newSelectedIndex]);
  }

  private setActiveSuite(suite: ISuiteResponse) {
    this.activeSuite = suite;
    this.mapAndAddSuitesToItems(this.project.suites);
  }

  private mapAndAddSuitesToItems(suites: ISuiteResponse[] = []) {
    const suiteItems = suites.map((s) => ({
      title: s.title,
      data: {
        id: s.id
      },
      selected: s.id === this.activeSuite.id
    }) as NbMenuItem);

    this.suiteMenuItems = suiteItems;
  }

  public updateUrlParameter(tab: NbTabComponent) {
    const urlSegs: UrlSegment[] = this.activeRoute.snapshot.url;
    const tabUrl: string = tab.tabTitle.toLocaleLowerCase();
    this.location.replaceState(`${urlSegs[0].path}/${urlSegs[1].path}/${tabUrl}`);
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IStepResponse } from "src/app/models/api/response/supplier/step.interface";

@Component({
  selector: "app-test-step-list",
  templateUrl: "./test-step-list.component.html",
  styleUrls: ["./test-step-list.component.scss"]
})
export class TestStepListComponent implements OnInit {

  @Input()
  public steps: IStepResponse[] = [];

  @Output()
  public stepAdded = new EventEmitter<string>();

  public newStepDescription: string;

  constructor() { }

  ngOnInit(): void {
  }

  public async addTestToCase(): Promise<void> {
    this.stepAdded.emit(this.newStepDescription);
    this.newStepDescription = "";
  }

}

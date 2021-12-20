// import { ComponentFixture } from "@angular/core/testing";

// describe("EventStateMachineService", () => {
//   let fixture: ComponentFixture<EventStartComponent>;
//   let component: EventStartComponent;
//   let de: DebugElement;
//   let route: any;
//   let snapshot: any;

//   const tasks = [
//     {
//       assignee: null,
//       assigneeName: null,
//       id: "0d22d838-b25a-11eb-a18c-f2d58a9b7bc6",
//       task_title: "Some lovely task name",
//       dueDate: "2021-05-20T16:00:00.000+0000",
//       description:
//         "[End the appeal](/cases/case-details/${[CASE_REFERENCE]}/trigger/endAppeal/endAppealendAppeal",
//       location_name: "Newcastle",
//       location_id: "366796",
//       case_id: "1620409659381330",
//       case_category: "asylum",
//       case_name: "Alan Jonson",
//       permissions: [],
//     },
//   ];

//   beforeEach(async(() => {
//     snapshot = {
//       data: {
//         tasks: tasks,
//       },
//     };
//     route = {
//       snapshot: snapshot,
//     };
//     TestBed.configureTestingModule({
//       declarations: [EventStartComponent],
//       schemas: [CUSTOM_ELEMENTS_SCHEMA],
//       providers: [
//         { provide: ActivatedRoute, useValue: route },
//         EventStateMachineService,
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(EventStartComponent);
//     component = fixture.componentInstance;
//     de = fixture.debugElement;
//     fixture.detectChanges();
//   }));

//   it("should create", () => {
//     expect(component).toBeTruthy();
//   });

//   it("should ngOnInit setup context and initialise state machine", () => {
//     component.ngOnInit();
//     expect(component.context.tasks).toEqual(tasks);
//     expect(component.stateMachine).toBeDefined();
//   });
// });

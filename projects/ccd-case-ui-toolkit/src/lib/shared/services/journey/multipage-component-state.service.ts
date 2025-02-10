import { Injectable } from '@angular/core';
import { Journey, JourneyInstigator } from '../../domain';

@Injectable({
  providedIn: 'root'
})
export class MultipageComponentStateService {
  //is journey at start will help keep track of the progress through the journey.
  private isJourneyAtStart: boolean = false;
  //journey collection references an upto date list of all the journey components currently rendered!!!!
  private journeyCollection: Journey[] = new Array<Journey>();
  //the instigator references the case-edit-page component that will invoke the next and previous methods
  private instigator: JourneyInstigator | null = null;
  //each journey will store its state here. this could include form data if needed
  private readonly journeyState: Map<string, Journey> = new Map<string, Journey>();

  //setJourneyComponent will be called by the app component to update the journey collection
  setJourneyCollection(journeyCollection: Journey[]): void {
    this.journeyCollection = journeyCollection;
  }

  //getJourneyCollection will be called by the app component to get the journey collection
  getJourneyCollection(): Journey[] {
    return this.journeyCollection;
  }

  //addToJourneyCollection will be called from the journey
  addTojourneyCollection(journey: Journey): void {
    this.journeyCollection.push(journey);
  }

  //resetJourneyCollection will be called
  resetJourneyCollection(): void {
    this.journeyCollection = [];
  }

  //setInstigator will be called by the app component to update the instigator
  setInstigator(instigator: JourneyInstigator): void {
    this.instigator = instigator;
  }

  //getInstigator will be called by the app component to get the instigator
  getInstigator(): JourneyInstigator | null {
    return this.instigator;
  }

  //setJourneyState will be called by the journey component to update the journey state
  setJourneyState(journey: Journey): void {
    this.journeyState.set(journey.journeyId, journey);
  }

  //getJourneyState will be called by the journey component to get the journey state
  getJourneyState(journey: Journey): Journey | null {
    return this.journeyState.get(journey.journeyId) || null;
  }

  //resetJourneyState will be called by the journey component to reset the journey state
  resetJourneyState(): void {
    this.journeyState.clear();
  }

  getJourneyCollectionMainObject(): Journey {
    return this.journeyCollection[0];
  }

  //reset will be called to ensure that the entire state is reset
  reset(): void {
    this.isJourneyAtStart = false;
    this.journeyState.clear();
    this.instigator = null;
    this.journeyCollection = [];
  }

  //next will be called by the instigator that will invoke the next method of the journey component that will invoke the next method of the childpage component
  public next(): void {
    if (this.journeyCollection.length <= 0) {
      this.instigator?.onFinalNext();
      return;
    }

    const isAnyObjectNotFinished: boolean = this.journeyCollection.some((journey) => !journey.isFinished());

    if (!isAnyObjectNotFinished) {
      this.instigator?.onFinalNext();
      return;
    }

    for (const journey of this.journeyCollection) {
      if (!journey) {
        continue;
      }

      if (!journey?.isFinished()) {
        journey?.next();
        break;
      }
    }
  }

  //previous will be called by the instigator that will invoke the previous method of the journey component that will invoke the previous method of the childpage component
  public previous(): void {
    if (this.journeyCollection.length <= 0) {
      this.instigator?.onFinalPrevious();
      return;
    }

    const isAnyObjectNotAtStart: boolean = this.journeyCollection.some((journey) => !journey.isStart());
    if (!isAnyObjectNotAtStart) {
      this.instigator?.onFinalPrevious();
      return;
    }

    for (const journey of this.journeyCollection.slice().reverse()) {
      if (!journey) {
        continue;
      }
      if (!journey?.isStart()) {
        journey?.previous();
        break;
      }
    }
  }

  //isAtStart can be used to inform the instigator if we're at the start.
  public get isAtStart(): boolean {
    return this.isJourneyAtStart;
  }

  //isAtStart can be used to update the value from a journey object, so the instigator knows.
  public set isAtStart(isAtStart: boolean) {
    this.isJourneyAtStart = isAtStart;
  }
}

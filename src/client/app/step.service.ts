import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Step } from './step';

const api = '/api';

@Injectable()
export class StepService {
  constructor(private http: HttpClient) {}

  scrapeContent(url: string){
    return this.http.put(`${api}/url`, { "url": url });
  }

  getPaths() {
    return this.http.get<Array<Step>>(`${api}/paths`);
  }

  deleteStep(step: Step) {
    return this.http.delete(`${api}/step/${step.uid}`);
  }

  addStep(step: Step) {
    return this.http.post<Step>(`${api}/step/`, step);
  }

  updateStep(step: Step) {
    return this.http.put<Step>(`${api}/step/${step.uid}`, step);
  }
}

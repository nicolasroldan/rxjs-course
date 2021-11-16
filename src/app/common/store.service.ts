import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, timer } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { delayWhen, map, retryWhen, shareReplay, tap } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
    providedIn: 'root'
})

export class Store {
    private subject = new BehaviorSubject<Course[]>([])

    courses$: Observable<Course[]> = this.subject.asObservable()



    init() {
        const http$ = createHttpObservable('/api/courses');

        http$
            .pipe(
                tap(() => console.log("HTTP request executed")),
                map(res => Object.values(res["payload"]))
            )
            .subscribe(courses => this.subject.next(courses));
    }

    selectBeginnerCourses() {
        return this.filterByCategry('BEGINNER')
    }

    selectAdvancedCourses() {
        return this.filterByCategry('ADVANCED')
    }

    filterByCategry(category: string) {
        return this.courses$
            .pipe(
                map(courses => courses
                    .filter(course => course.category == category))
            );
    }

    saveCourse(courseId: number, changes): Observable<any> {
        const courses = this.subject.getValue();
        const courseIndex = courses.findIndex(course => course.id == courseId);
        const newCourses = courses.slice(0);
        newCourses[courseIndex] = { ...courses[courseIndex], ...changes };
        debugger
        this.subject.next(newCourses)
        debugger

        return fromPromise(fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: { 'Content-type': 'application/json' }
        }))
    }
}


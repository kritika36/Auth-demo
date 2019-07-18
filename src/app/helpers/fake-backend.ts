import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
 let users = JSON.parse(localStorage.getItem('users')) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IktyaXRpa2EgUG91ZGVsIiwiYWRtaW4iOnRydWUsImlzR2hvc3QiOnRydWV9.3HUIaR7LCdOcEqnVjEM80acxlcG0zuSTpkjAqFf_-ts';

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/api/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/api/orders') && method === 'GET':
                    return order();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions

        function order() {
            if (headers.get('Authorization') === 'Bearer' + token) {
                return ok(
                    [1, 2, 3]
                );
            } else {
                return of(new HttpResponse({ status: 401 }));
            }
        }

        function authenticate() {
            const { email, password } = JSON.parse(body);
            // const user = users.find(x => x.username === username && x.password === password);
            const user = email === 'kritika@domain.com' && password === '1234';
            if (user) {
                return ok({
                    token
                });
            } else {
                return of(new HttpResponse({ status: 200 }));
            }

        }

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
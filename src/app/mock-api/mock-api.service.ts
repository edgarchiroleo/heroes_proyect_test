import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap, take } from 'rxjs/operators';
import { compact, fromPairs } from 'lodash-es';

export const MOCK_API_DEFAULT_DELAY = new InjectionToken<number>('MOCK_API_DEFAULT_DELAY');

export type MockApiReplyCallback =
    | ((data: { request: HttpRequest<any>; urlParams: { [key: string]: string } }) => ([number, string | any]) | Observable<any>)
    | undefined;

export type MockApiMethods =
    | 'get'
    | 'post'
    | 'patch'
    | 'delete'
    | 'put'
    | 'head'
    | 'jsonp'
    | 'options';

@Injectable({
    providedIn: 'root'
})
export class MockApiService
{
    private _handlers: { [key: string]: Map<string, MockApiHandler> } = {
        'get'    : new Map<string, MockApiHandler>(),
        'post'   : new Map<string, MockApiHandler>(),
        'patch'  : new Map<string, MockApiHandler>(),
        'delete' : new Map<string, MockApiHandler>(),
        'put'    : new Map<string, MockApiHandler>(),
        'head'   : new Map<string, MockApiHandler>(),
        'jsonp'  : new Map<string, MockApiHandler>(),
        'options': new Map<string, MockApiHandler>()
    };

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Find the handler from the service
     * with the given method and url
     *
     * @param method
     * @param url
     */
    findHandler(method: string, url: string): { handler: MockApiHandler | undefined; urlParams: { [key: string]: string } }
    {
        // Prepare the return object
        const matchingHandler: { handler: MockApiHandler | undefined; urlParams: { [key: string]: string } } = {
            handler  : undefined,
            urlParams: {}
        };

        // Split the url
        const urlParts = url.split('/');

        // Get all related request handlers
        const handlers = this._handlers[method.toLowerCase()];

        // Iterate through the handlers
        handlers.forEach((handler, handlerUrl) => {

            // Skip if there is already a matching handler
            if ( matchingHandler.handler )
            {
                return;
            }

            // Split the handler url
            const handlerUrlParts = handlerUrl.split('/');

            // Skip if the lengths of the urls we are comparing are not the same
            if ( urlParts.length !== handlerUrlParts.length )
            {
                return;
            }

            // Compare
            const matches = handlerUrlParts.every((handlerUrlPart, index) => handlerUrlPart === urlParts[index] || handlerUrlPart.startsWith(':'));

            // If there is a match...
            if ( matches )
            {
                // Assign the matching handler
                matchingHandler.handler = handler;

                // Extract and assign the parameters
                matchingHandler.urlParams = fromPairs(compact(handlerUrlParts.map((handlerUrlPart, index) =>
                    handlerUrlPart.startsWith(':') ? [handlerUrlPart.substring(1), urlParts[index]] : undefined
                )));
            }
        });

        return matchingHandler;
    }

    /**
     * Register GET request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onGet(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('get', url, delay);
    }

    /**
     * Register POST request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onPost(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('post', url, delay);
    }

    /**
     * Register PATCH request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onPatch(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('patch', url, delay);
    }

    /**
     * Register DELETE request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onDelete(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('delete', url, delay);
    }

    /**
     * Register PUT request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onPut(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('put', url, delay);
    }

    /**
     * Register HEAD request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onHead(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('head', url, delay);
    }

    /**
     * Register JSONP request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onJsonp(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('jsonp', url, delay);
    }

    /**
     * Register OPTIONS request handler
     *
     * @param url - URL address of the mocked API endpoint
     * @param delay - Delay of the response in milliseconds
     */
    onOptions(url: string, delay?: number): MockApiHandler
    {
        return this._registerHandler('options', url, delay);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register and return a new instance of the handler
     *
     * @param method
     * @param url
     * @param delay
     * @private
     */
    private _registerHandler(method: MockApiMethods, url: string, delay?: number): MockApiHandler
    {
        // Create a new instance of FuseMockApiRequestHandler
        const fuseMockHttp = new MockApiHandler(url, delay);

        // Store the handler to access it from the interceptor
        this._handlers[method].set(url, fuseMockHttp);

        // Return the instance
        return fuseMockHttp;
    }
}

export class MockApiHandler
{
    request!: HttpRequest<any>;
    urlParams!: { [key: string]: string };

    // Private
    private _reply: MockApiReplyCallback = undefined;
    private _replyCount = 0;
    private _replied = 0;

    /**
     * Constructor
     */
    constructor(
        public url: string,
        public delay?: number
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for response callback
     */
    get response(): Observable<any>
    {
        // If the execution limit has been reached, throw an error
        if ( this._replyCount > 0 && this._replyCount <= this._replied )
        {
            return throwError('Execution limit has been reached!');
        }

        // If the response callback has not been set, throw an error
        if ( !this._reply )
        {
            return throwError('Response callback function does not exist!');
        }

        // If the request has not been set, throw an error
        if ( !this.request )
        {
            return throwError('Request does not exist!');
        }

        // Increase the replied count
        this._replied++;

        // Execute the reply callback
        const replyResult = this._reply({
            request  : this.request,
            urlParams: this.urlParams
        });

        // If the result of the reply callback is an observable...
        if ( replyResult instanceof Observable )
        {
            // Return the result as it is
            return replyResult.pipe(take(1));
        }

        // Otherwise, return the result as an observable
        return of(replyResult).pipe(take(1));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reply
     *
     * @param callback
     */
    reply(callback: MockApiReplyCallback): void
    {
        // Store the reply
        this._reply = callback;
    }

    /**
     * Reply count
     *
     * @param count
     */
    replyCount(count: number): void
    {
        // Store the reply count
        this._replyCount = count;
    }
}

export class ApiUtils
{
    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate a globally unique id
     */
    static guid(): string
    {
        /* eslint-disable */

        let d = new Date().getTime();

        // Use high-precision timer if available
        if ( typeof performance !== 'undefined' && typeof performance.now === 'function' )
        {
            d += performance.now();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        /* eslint-enable */
    }
}


@Injectable({
  providedIn: 'root'
})
export class MockApiInterceptor implements HttpInterceptor
{
  /**
   * Constructor
   */
  constructor(
      @Inject(MOCK_API_DEFAULT_DELAY) private _defaultDelay: number,
      private _mockApiService: MockApiService
  )
  {
  }

  /**
   * Intercept
   *
   * @param request
   * @param next
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
      const {
                handler,
                urlParams
            } = this._mockApiService.findHandler(request.method.toUpperCase(), request.url);


      if ( !handler )
      {
          return next.handle(request);
      }


      handler.request = request;


      handler.urlParams = urlParams;


      return handler.response.pipe(
          delay(handler.delay ?? this._defaultDelay ?? 0),
          switchMap((response) => {

              if ( !response )
              {
                  response = new HttpErrorResponse({
                      error     : 'NOT FOUND',
                      status    : 404,
                      statusText: 'NOT FOUND'
                  });

                  return throwError(response);
              }


              const data = {
                  status: response[0],
                  body  : response[1]
              };


              if ( data.status >= 200 && data.status < 300 )
              {
                  response = new HttpResponse({
                      body      : data.body,
                      status    : data.status,
                      statusText: 'OK'
                  });

                  return of(response);
              }


              response = new HttpErrorResponse({
                  error     : data.body.error,
                  status    : data.status,
                  statusText: 'ERROR'
              });

              return throwError(response);
          }));
  }
}




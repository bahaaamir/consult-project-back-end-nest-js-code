import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: QueryParams;
}

@Injectable({ providedIn: 'root' })
export class ApiCallerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(this.toUrl(path), this.toHttpOptions(options));
  }

  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: RequestOptions,
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.toUrl(path), body, this.toHttpOptions(options));
  }

  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: RequestOptions,
  ): Observable<TResponse> {
    return this.http.put<TResponse>(this.toUrl(path), body, this.toHttpOptions(options));
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: RequestOptions,
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(this.toUrl(path), body, this.toHttpOptions(options));
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(this.toUrl(path), this.toHttpOptions(options));
  }

  private toUrl(path: string): string {
    return path.startsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
  }

  private toHttpOptions(options?: RequestOptions): {
    headers?: HttpHeaders | Record<string, string | string[]>;
    params?: HttpParams;
  } {
    if (!options?.params) {
      return {
        headers: options?.headers,
      };
    }

    let params = new HttpParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value === null || value === undefined) continue;
      params = params.set(key, String(value));
    }

    return {
      headers: options.headers,
      params,
    };
  }
}


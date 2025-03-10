import { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosInterceptorManager, AxiosHeaderValue, HeadersDefaults, AxiosHeaders } from 'axios';

interface MockAxiosInstance extends Omit<AxiosInstance, 'defaults'> {
  create: jest.Mock;
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
  head: jest.Mock;
  options: jest.Mock;
  request: jest.Mock;
  getUri: jest.Mock;
  postForm: jest.Mock;
  putForm: jest.Mock;
  patchForm: jest.Mock;
  defaults: {
    headers: HeadersDefaults & {
      [key: string]: AxiosHeaderValue;
    };
  };
  interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
}

const mockAxios: MockAxiosInstance = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
  getUri: jest.fn(),
  postForm: jest.fn(),
  putForm: jest.fn(),
  patchForm: jest.fn(),
  defaults: {
    headers: {
      common: {} as AxiosHeaders,
      delete: {} as AxiosHeaders,
      get: {} as AxiosHeaders,
      head: {} as AxiosHeaders,
      post: {} as AxiosHeaders,
      put: {} as AxiosHeaders,
      patch: {} as AxiosHeaders
    }
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn()
    }
  }
};

export default mockAxios; 
import 'axios'

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        controller: AbortController;
    }
}
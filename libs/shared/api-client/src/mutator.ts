/** RFC 9457 error body returned by the API. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: { path: string; message: string }[];
}

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
  }

  get status(): number {
    return this.problem.status;
  }
}

export interface ApiClientConfig {
  /** Origin of the API, e.g. `http://localhost:3000`. The paths already start with `/api`. */
  baseUrl: string;
  /** Access token sent as a bearer token, when the user is signed in. */
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
}

let config: ApiClientConfig = { baseUrl: '' };

/** Called once at startup by each application. */
export function configureApiClient(next: ApiClientConfig): void {
  config = next;
}

/** Used by the generated code as the error type of every query and mutation. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature imposed by orval
export type ErrorType<_Error> = ApiError;

async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return { type: 'about:blank', title: response.statusText, status: response.status };
  }
}

/** Fetch wrapper called by the generated client (orval mutator). */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = await config.getAccessToken?.();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${config.baseUrl}${url}`, { ...init, headers });
  if (!response.ok) {
    throw new ApiError(await readProblem(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

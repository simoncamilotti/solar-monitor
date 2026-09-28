import { type ArgumentsHost, NotFoundException } from '@nestjs/common';
import { ProblemDetailsFilter } from './problem-details.filter.js';
import { ValidationException } from './validation.exception.js';

function createHost() {
  const response = {
    status: vi.fn().mockReturnThis(),
    type: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: '/api/things/1' }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('ProblemDetailsFilter', () => {
  const filter = new ProblemDetailsFilter();

  it('maps an HTTP exception', () => {
    const { host, response } = createHost();
    filter.catch(new NotFoundException('Thing 1 does not exist.'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.type).toHaveBeenCalledWith('application/problem+json');
    expect(response.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Thing 1 does not exist.',
      instance: '/api/things/1',
    });
  });

  it('lists the validation errors', () => {
    const { host, response } = createHost();
    filter.catch(new ValidationException([{ message: 'Too small', path: ['name'] }]), host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, errors: [{ path: 'name', message: 'Too small' }] }),
    );
  });

  it('hides the details of an unexpected error', () => {
    const { host, response } = createHost();
    vi.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    filter.catch(new Error('database password is wrong'), host);

    expect(response.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      instance: '/api/things/1',
    });
  });
});

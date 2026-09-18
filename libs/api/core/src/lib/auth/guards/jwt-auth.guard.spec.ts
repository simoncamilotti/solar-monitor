import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Mock } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector;

    guard = new JwtAuthGuard(reflector);
  });

  const createMockContext = (): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn(),
    }) as unknown as ExecutionContext;

  describe('canActivate', () => {
    it('should return true when @IsPublic() is set', () => {
      (reflector.getAllAndOverride as Mock).mockReturnValue(true);
      const context = createMockContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should delegate to parent AuthGuard when not public', () => {
      (reflector.getAllAndOverride as Mock).mockReturnValue(false);
      const context = createMockContext();

      // The parent AuthGuard('jwt').canActivate will try to authenticate.
      // We spy on the prototype to verify delegation happens.
      const superCanActivate = vi
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalledWith(context);
      expect(result).toBe(true);

      superCanActivate.mockRestore();
    });

    it('should check the correct metadata key', () => {
      (reflector.getAllAndOverride as Mock).mockReturnValue(false);
      const context = createMockContext();

      vi.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockReturnValue(true);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [context.getHandler(), context.getClass()]);
    });

    it('should delegate when metadata is undefined', () => {
      (reflector.getAllAndOverride as Mock).mockReturnValue(undefined);
      const context = createMockContext();

      const superCanActivate = vi
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalled();

      superCanActivate.mockRestore();
    });
  });
});

import type { AuthUser } from '../../common/auth/auth-user.js';
import type { PrismaService } from '../../common/database/prisma.service.js';
import { UsersService } from './users.service.js';

const caller: AuthUser = {
  subject: 'kc-123',
  email: 'ada@example.com',
  name: 'Ada',
  locale: 'en',
  roles: [],
};

function createPrisma(existing: object | null) {
  const user = {
    findUnique: vi.fn().mockResolvedValue(existing),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'new', ...data })),
    update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...existing, ...data })),
  };
  return { prisma: { user } as unknown as PrismaService, user };
}

describe('UsersService', () => {
  it('creates the account at the first request', async () => {
    const { prisma, user } = createPrisma(null);
    const result = await new UsersService(prisma).findOrCreate(caller);

    expect(result.created).toBe(true);
    expect(user.create).toHaveBeenCalledWith({
      data: { subject: 'kc-123', email: 'ada@example.com', name: 'Ada', locale: 'en' },
    });
  });

  it('refreshes the profile of a known account', async () => {
    const { prisma, user } = createPrisma({
      id: 'u1',
      subject: 'kc-123',
      email: 'old@example.com',
    });
    const result = await new UsersService(prisma).findOrCreate(caller);

    expect(result).toMatchObject({ created: false, user: { id: 'u1', email: 'ada@example.com' } });
    expect(user.create).not.toHaveBeenCalled();
  });
});

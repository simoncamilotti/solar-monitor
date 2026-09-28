import { names } from '@nx/devkit';

/** The files of a domain module, keyed by path from the repository root. */
export function apiModuleFiles(name: string): Record<string, string> {
  const { className, propertyName, fileName } = names(name);
  const dir = `apps/api/src/modules/${fileName}`;

  return {
    [`libs/shared/contracts/src/lib/${fileName}.ts`]: `import { z } from 'zod';

export const ${propertyName}ItemSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
  })
  .meta({ id: '${className}Item' });
export type ${className}Item = z.infer<typeof ${propertyName}ItemSchema>;
`,
    [`${dir}/${fileName}.module.ts`]: `import { Module } from '@nestjs/common';
import { ${className}Controller } from './${fileName}.controller.js';
import { ${className}Service } from './${fileName}.service.js';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
})
export class ${className}Module {}
`,
    [`${dir}/${fileName}.controller.ts`]: `import { Controller, Get } from '@nestjs/common';
import { type ${className}Item, ${propertyName}ItemSchema } from '@repo/contracts';
import { ResponseListSchema } from '../../common/serialization/response-schema.decorator.js';
import { ${className}Service } from './${fileName}.service.js';

// Every route requires a signed-in user: @Public() opens one, @Roles() restricts it.
@Controller('${fileName}')
export class ${className}Controller {
  constructor(private readonly ${propertyName}: ${className}Service) {}

  @Get()
  @ResponseListSchema(${propertyName}ItemSchema)
  findAll(): Promise<${className}Item[]> {
    return this.${propertyName}.findAll();
  }
}
`,
    [`${dir}/${fileName}.service.ts`]: `import { Injectable } from '@nestjs/common';
import type { ${className}Item } from '@repo/contracts';

@Injectable()
export class ${className}Service {
  async findAll(): Promise<${className}Item[]> {
    return [];
  }
}
`,
    [`${dir}/${fileName}.controller.spec.ts`]: `import { Test } from '@nestjs/testing';
import { ${className}Controller } from './${fileName}.controller.js';
import { ${className}Service } from './${fileName}.service.js';

describe('${className}Controller', () => {
  let controller: ${className}Controller;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [${className}Controller],
      providers: [${className}Service],
    }).compile();
    controller = moduleRef.get(${className}Controller);
  });

  it('lists the items', async () => {
    await expect(controller.findAll()).resolves.toEqual([]);
  });
});
`,
  };
}

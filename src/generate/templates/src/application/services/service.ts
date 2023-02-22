import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
const pluralize = require('pluralize');

export function createService(
  types: Type[],
  type: Type,
  _tree: Tree,
  projectName: string
) {
  let [paginationArgsImport, fieldPaginationImport, fieldPaginationMethod] = computePaginationTemplates(types, type);
  let [
    forwardRefAndInjectImport,
    forwardReferencedServices,
    referencedServices,
    modelsAndServices,
    createRelationships,
    initRelationships,
    updateRelationships,
    relatedRepositoryImport
  ] = computeRelationshipsTemplates(types, type);
  let updateFields = computeFieldTemplate(type)
  let fileTemplate = `${handleIdGeneration(type)[0]}import { ${forwardRefAndInjectImport}Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { I${type.typeName}Service } from 'domain/service/${strings.camelize(type.typeName)}.service.interface';${modelsAndServices}
import { ${paginationArgsImport}SortDirection } from './dto/pagination/pagination.dto';${fieldPaginationImport}
import { ${type.typeName}CreateInput, ${type.typeName}CreateOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-delete.dto';
import { ${type.typeName}GetOneOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
import {
  ${pluralize(type.typeName)}Pagination,
  ${pluralize(type.typeName)}PaginationArgs,
} from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-pagination.dto';
import { ${type.typeName}UpdateInput, ${type.typeName}UpdateOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-update.dto';

@Injectable()
export class ${type.typeName}Service implements I${type.typeName}Service {
  constructor(
    @InjectRepository(${type.typeName})
    private readonly ${strings.camelize(type.typeName)}Repository: Repository<${type.typeName}>,${relatedRepositoryImport}${forwardReferencedServices}${referencedServices}
  ) {}

  async ${strings.camelize(type.typeName)}Create(
    input: ${type.typeName}CreateInput
  ): Promise<${type.typeName}CreateOutput> {
    const ${strings.camelize(type.typeName)} = this.${strings.camelize(type.typeName)}Repository.create(input);${createRelationships}${initRelationships}${handleIdGeneration(type)[1]}
    await ${strings.camelize(type.typeName)}.save();
    return { ${strings.camelize(type.typeName)} };
  }

  async ${strings.camelize(type.typeName)}Update(
    id: ${type.typeName}['id'],
    input: ${type.typeName}UpdateInput,
  ): Promise<${type.typeName}UpdateOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id },
    });${updateFields}${updateRelationships}
    await ${strings.camelize(type.typeName)}.save();
    return { ${strings.camelize(type.typeName)} };
  }

  async ${strings.camelize(type.typeName)}Delete(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id']
  ): Promise<${type.typeName}DeleteOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
    await ${strings.camelize(type.typeName)}.remove();
    return { ${strings.camelize(type.typeName)}Id };
  }

  async ${strings.camelize(pluralize(type.typeName))}Pagination(
    args: ${pluralize(type.typeName)}PaginationArgs
  ): Promise<${pluralize(type.typeName)}Pagination> {
    const queryBuilder = this.${strings.camelize(type.typeName)}Repository.createQueryBuilder('${strings.camelize(type.typeName)}');
    queryBuilder.take(args.take);
    queryBuilder.skip(args.skip);
    if (args.sortBy) {
      if (args.sortBy.createdAt !== null) {
        queryBuilder.addOrderBy(
          '${strings.camelize(type.typeName)}.createdAt',
          args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }${handleSortingInstructions(type)}
    }
    const [nodes, totalCount] = await queryBuilder.getManyAndCount();
    return { nodes, totalCount };
  }

  async ${strings.camelize(type.typeName)}GetDataById(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id']
  ): Promise<${type.typeName}GetOneOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
    return { ${strings.camelize(type.typeName)} };
  }

  async ${strings.camelize(type.typeName)}GetById(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id']
  ): Promise<${type.typeName}> {
    return await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
  }
  ${fieldPaginationMethod}
}
`;

  _tree.create(
    `${projectName}/src/application/services/${strings.camelize(
      type.typeName
    )}.service.ts`,
    fileTemplate
  );
}

function computeFieldTemplate(type: Type): string {
  let updateFields = '';
  const scalarAndEnumFields = type.fields.filter((field: Field) => field.type !== 'ID' && !field.isDeprecated && (!field.relation || field.isEnum));
  if (scalarAndEnumFields.length > 0) {
    scalarAndEnumFields.forEach((field) => {
      updateFields += `
    ${strings.camelize(type.typeName)}.${field.name} = input.${strings.camelize(field.name)};`;
    });
  }
  return updateFields;
}

function computeRelationshipsTemplates(types: Type[], type: Type): string[] {
  let [forwardRefAndInjectImport, forwardReferencedServices, referencedServices] = computeForwardRelationships(types, type);
  let modelsAndServices = '';
  let createRelationships = '';
  let initRelationships = '';
  let updateRelationships = '';
  let relatedRepositoryImport = '';

  const relationships = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated);
  if (relationships.length > 0) {
    forwardRefAndInjectImport += 'Inject, ';
    relationships.forEach((relationship) => {
      if (relationship.type !== type.typeName) {
        modelsAndServices += `
import { ${relationship.type} } from 'adapters/typeorm/entities/${strings.camelize(relationship.type)}.model';
import { ${relationship.type}Service } from './${strings.camelize(relationship.type)}.service';`;
      }
      if (relationship.isArray) {
        createRelationships += `\n    const mock${relationship.type} = new ${relationship.type}();`;
        if (relationship.type === type.typeName) {
          createRelationships += `
    ${strings.camelize(type.typeName)}.child${strings.capitalize(pluralize(relationship.name))} = [mock${relationship.type}];
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids && input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length > 0) {
      for (let i = 0; i < input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length; i++) {
        if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids[i] !== ${strings.camelize(type.typeName)}.id) {
          const child${strings.capitalize(relationship.type)} = await this.${strings.camelize(relationship.type)}Repository.findOneOrFail({
            where: { id: input.${strings.camelize(pluralize(relationship.name, 1))}Ids[i] },
          });
          ${strings.camelize(type.typeName)}.child${strings.capitalize(pluralize(relationship.name))}[i] = child${strings.capitalize(relationship.type)};
        }
      }
    }`;
          updateRelationships += `
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids) {
      const linked${strings.capitalize(relationship.name)}: ${relationship.type}[] = [];
      input.${strings.camelize(pluralize(relationship.name, 1))}Ids.forEach(async (${strings.camelize(pluralize(relationship.name, 1))}Id) => {
        if (${strings.camelize(pluralize(relationship.name, 1))}Id !== id) {
          linked${strings.capitalize(relationship.name)}.push(
            await this.${strings.camelize(relationship.type)}Repository.findOneOrFail({
              where: { id: ${strings.camelize(pluralize(relationship.name, 1))}Id },
            }),
          );
        }
      });
      ${strings.camelize(type.typeName)}.child${strings.capitalize(pluralize(relationship.name))} = linked${strings.capitalize(relationship.name)};
    }`;
        } else {
          createRelationships += `
    ${strings.camelize(type.typeName)}.${strings.camelize(relationship.name)} = [mock${relationship.type}];
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids && input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length > 0) {
      for (let i = 0; i < input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length; i++) {
        const ${strings.camelize(pluralize(relationship.name, 1))} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(
          input.${strings.camelize(pluralize(relationship.name, 1))}Ids[i],
        );
        ${strings.camelize(type.typeName)}.${strings.camelize(relationship.name)}[i] = ${strings.camelize(pluralize(relationship.name, 1))};
      }
    }`;
          updateRelationships += `
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids) {
      const linked${strings.capitalize(relationship.name)}: ${relationship.type}[] = [];
      input.${strings.camelize(pluralize(relationship.name, 1))}Ids.forEach(async (${strings.camelize(pluralize(relationship.name, 1))}Id) => {
        linked${strings.capitalize(relationship.name)}.push(
          await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(${strings.camelize(pluralize(relationship.name, 1))}Id),
        );
      });
      ${strings.camelize(type.typeName)}.${strings.camelize(relationship.name)} = linked${strings.capitalize(relationship.name)};
    }`;
          relatedRepositoryImport += `
    @InjectRepository(${relationship.type})
    private readonly ${strings.camelize(relationship.type)}Repository: Repository<${relationship.type}>,`;

        }

      } else {
        createRelationships += `
    ${strings.camelize(type.typeName)}.${relationship.name} = new ${relationship.type}();`;
        if (relationship.type === type.typeName) {
          initRelationships += `
    if (input.${relationship.name}Id && input.${relationship.name}Id !== ${strings.camelize(type.typeName)}.id) {
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Repository.findOneOrFail({
        where: { id: input.${relationship.name}Id },
      });
      ${strings.camelize(type.typeName)}.${relationship.name} = ${relationship.name};
    }`;
          updateRelationships += `
    if (input.${relationship.name}Id && input.${relationship.name}Id !== ${strings.camelize(type.typeName)}.id)) {
      ${strings.camelize(type.typeName)}.${relationship.name} = new ${relationship.type}();
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Repository.findOneOrFail({
        where: { id: input.${relationship.name}Id },
      });
      ${strings.camelize(type.typeName)}.${relationship.name} = ${relationship.name};
    }`;
        } else {
          initRelationships += `
    if (input.${relationship.name}Id) {
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(input.${relationship.name}Id);
      ${strings.camelize(type.typeName)}.${relationship.name} = ${relationship.name};
    }`;
          updateRelationships += `
    if (input.${relationship.name}Id) {
      ${strings.camelize(type.typeName)}.${relationship.name} = new ${relationship.type}();
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(input.${relationship.name}Id);
      ${strings.camelize(type.typeName)}.${relationship.name} = ${relationship.name};
    }`;
        }
      }
    });
  }
  if (computeManyOnlyRelationships(types, type)[0] 
    && !forwardRefAndInjectImport.includes('Inject') 
    && !forwardRefAndInjectImport.includes('forwardRef')) forwardRefAndInjectImport += 'forwardRef, Inject, ';
  modelsAndServices += computeManyOnlyRelationships(types, type)[1];
  initRelationships += computeManyOnlyRelationships(types, type)[3];
  updateRelationships += computeManyOnlyRelationships(types, type)[4];

  relatedRepositoryImport
  return [
    forwardRefAndInjectImport,
    forwardReferencedServices,
    referencedServices,
    modelsAndServices,
    createRelationships,
    initRelationships,
    updateRelationships,
    relatedRepositoryImport
  ];
}

function computeForwardRelationships(types: Type[], type: Type): string[] {
  const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.relationType !== 'selfJoinOne' && field.relationType !== 'selfJoinMany');
  let forwardRelationshipImport = '';
  let forwardReferencedServices = '';
  let referencedServices = '';
  relatedFields.forEach((relatedField) => {
    if (relatedField.type !== type.typeName) {
      let relation = type.relationList.find((relation) => relation.type === relatedField.type);
      if (relation.relatedFieldName || computeManyOnlyRelationships(types, type)[0]) {
        forwardRelationshipImport = 'forwardRef, ';
        forwardReferencedServices += `
    @Inject(forwardRef(() => ${strings.capitalize(relatedField.type)}Service))
    private readonly ${strings.camelize(relatedField.type)}Service: ${strings.capitalize(relatedField.type)}Service,`;
      } else if (relatedField.relationType !== 'manyOnly') {
        referencedServices += `
    private readonly ${strings.camelize(relatedField.type)}Service: ${strings.capitalize(relatedField.type)}Service,`;
      }
    }
  });
  forwardReferencedServices += computeManyOnlyRelationships(types, type)[2];
  const manyOnlyFields = relatedFields.filter(field => field.relationType === 'manyOnly');
  if (manyOnlyFields.length > 0) {
    if (!forwardRelationshipImport.includes('forwardRef')) forwardRelationshipImport = 'forwardRef, ';
    manyOnlyFields.forEach((manyOnlyField) => {
      forwardReferencedServices += `\n    @Inject(forwardRef(() => ${strings.capitalize(manyOnlyField.type)}Service))
    private readonly ${strings.camelize(manyOnlyField.type)}Service: ${strings.capitalize(manyOnlyField.type)}Service,`;
    });
  }

  return [forwardRelationshipImport, forwardReferencedServices, referencedServices];
}

function computePaginationTemplates(types: Type[], type: Type): string[] {
  let paginationArgsImport = '';
  let fieldPaginationImport = '';
  let fieldPaginationMethod = '';
  const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.isArray);
  if (relatedFields.length > 0) {
    paginationArgsImport = 'PaginationArgs, ';
    relatedFields.forEach((relatedField) => {
      const relatedType = types.find((type) => type.typeName === relatedField.type);
      if (relatedType) {
        let fieldInRelatedTypeName = relatedType.fields.find((field) => field.type === type.typeName)?.name;
        if (relatedField.relationType === 'selfJoinMany') fieldInRelatedTypeName = `parent${strings.capitalize(pluralize(relatedField.name, 1))}`;
        if (fieldInRelatedTypeName) {
          fieldPaginationImport += `
import { ${type.typeName}${strings.capitalize(relatedField.name)}Pagination } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-${strings.camelize(relatedField.name)}-pagination.dto';`;
          fieldPaginationMethod += `
  async ${strings.camelize(type.typeName)}${strings.capitalize(relatedField.name)}Pagination(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    args: PaginationArgs,
  ): Promise<${type.typeName}${strings.capitalize(relatedField.name)}Pagination> {
    const [nodes, totalCount] = await this.${strings.camelize(relatedField.type)}Repository.findAndCount({
      skip: args.skip,
      take: args.take,
      where: {
        ${fieldInRelatedTypeName}: {
          id: ${strings.camelize(type.typeName)}Id,
        },
      },
      order: {
        createdAt:
          args.sortBy?.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
      },
    });

    return {
      nodes,
      totalCount,
    };
  }\n`;
        }
      }
    });
    const manyOnlyFields = relatedFields.filter(field => field.relationType === 'manyOnly');
    if (manyOnlyFields.length > 0) {
      if (!paginationArgsImport.includes('PaginationArgs')) paginationArgsImport = 'PaginationArgs, ';
      manyOnlyFields.forEach((manyOnlyField) => {
        fieldPaginationImport += `
import { ${type.typeName}${strings.capitalize(manyOnlyField.name)}Pagination } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-${strings.camelize(manyOnlyField.name)}-pagination.dto';`;
        fieldPaginationMethod += `
  async ${strings.camelize(type.typeName)}${strings.capitalize(manyOnlyField.name)}Pagination(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    args: PaginationArgs,
  ): Promise<${type.typeName}${strings.capitalize(manyOnlyField.name)}Pagination> {
    const [nodes, totalCount] = await this.${strings.camelize(manyOnlyField.type)}Repository.findAndCount({
      skip: args.skip,
      take: args.take,
      where: {
        ${strings.camelize(type.typeName)}: {
          id: ${strings.camelize(type.typeName)}Id,
        },
      },
      order: {
        createdAt:
          args.sortBy?.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
      },
    });

    return {
      nodes,
      totalCount,
    };
  }\n`;
      });
    }
  }
  return [paginationArgsImport, fieldPaginationImport, fieldPaginationMethod];
}

function computeManyOnlyRelationships(types: Type[], manyOnlyType: Type): [boolean, string, string, string, string] {
  let forwardRefAndInjectImport = false;
  let importEntitiesAndServicesTemplate = ``;
  let injectServicesTemplate = ``;
  let createEntityTemplate = ``;
  let updateEntityTemplate = ``;
  types.forEach((type) => {
    const fieldInRelatedType = type.fields.find((field) => field.type === manyOnlyType.typeName)
    if (fieldInRelatedType && fieldInRelatedType.relationType === 'manyOnly') {
      forwardRefAndInjectImport = true;
      importEntitiesAndServicesTemplate += `\nimport { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { ${type.typeName}Service } from './${strings.camelize(type.typeName)}.service';`;
      injectServicesTemplate += `\n    @Inject(forwardRef(() => ${type.typeName}Service))
    private readonly ${strings.camelize(type.typeName)}Service: ${type.typeName}Service,`;
      createEntityTemplate += `\n  ${strings.camelize(manyOnlyType.typeName)}.${strings.camelize(type.typeName)} = new ${type.typeName}();
    if (input.${strings.camelize(type.typeName)}Id) {
      const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Service.${strings.camelize(type.typeName)}GetById(input.${strings.camelize(type.typeName)}Id);
      ${strings.camelize(manyOnlyType.typeName)}.${strings.camelize(type.typeName)} = ${strings.camelize(type.typeName)};
    }`;
      updateEntityTemplate += `\n  if (input.${strings.camelize(type.typeName)}Id) {
      ${strings.camelize(manyOnlyType.typeName)}.${strings.camelize(type.typeName)} = new ${type.typeName}();
      const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Service.${strings.camelize(type.typeName)}GetById(input.${strings.camelize(type.typeName)}Id);
      ${strings.camelize(manyOnlyType.typeName)}.${strings.camelize(type.typeName)} = ${strings.camelize(type.typeName)};
    }`;
    }
  });

  return [forwardRefAndInjectImport, importEntitiesAndServicesTemplate, injectServicesTemplate, createEntityTemplate, updateEntityTemplate];
}

function handleSortingInstructions(type: Type): string {
  let sortingInstructions = '';
  type.fields.forEach((field) => {
    if (field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === 'SortBy'))
      sortingInstructions += `\n      if (args.sortBy.${field.name} !== null) {
        queryBuilder.addOrderBy(
          '${strings.camelize(type.typeName)}.${field.name}',
          args.sortBy.${field.name} === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }`;
  });
  return sortingInstructions;
}

function handleIdGeneration(type: Type): string[] {
  let importUUID = '';
  let idTemplate = '';
  const idField = type.fields.find((field => field.type === 'ID'));
  if (!idField) {
    importUUID += `import { v4 as uuidv4 } from 'uuid';\n`
    idTemplate += `\n    ${strings.camelize(type.typeName)}.id = uuidv4();`;
  }
  return [importUUID, idTemplate]
}
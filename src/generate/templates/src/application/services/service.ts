import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require("pluralize");

export function createService(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let [paginationArgsImport, fieldPaginationImport, fieldPaginationMethod] = computePaginationTemplates(type);
    let [
      forwardRefAndInjectImport,
      forwardReferencedServices,
      referencedServices,
      modelsAndServices,
      createRelationships,
      initRelationships,
      updateRelationships,
      relatedRepositoryImport
      ] = computeRelationshipsTemplates(type);
    let updateFields = computeFieldTemplate(type)
    let fileTemplate = `import { ${forwardRefAndInjectImport}Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { I${type.typeName}Service } from 'domain/service/${strings.camelize(type.typeName)}.service.interface';${modelsAndServices}
import { ${paginationArgsImport}SortDirection } from './dto/pagination/pagination.dto';${fieldPaginationImport}
import { ${type.typeName}CreateInput, ${type.typeName}CreateOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-delete.dto';
import { ${type.typeName}GetOneOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
import {
  ${type.typeName}sPagination,
  ${type.typeName}sPaginationArgs,
} from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-pagination.dto';
import { ${type.typeName}UpdateInput, ${type.typeName}UpdateOutput } from './dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-update.dto';
    
@Injectable()
export class ${type.typeName}Service implements I${type.typeName}Service {
  constructor(
    @InjectRepository(${type.typeName})
    private readonly ${strings.camelize(type.typeName)}Repository: Repository<${type.typeName}>,${relatedRepositoryImport}${forwardReferencedServices}${referencedServices}
  ) {}
    
  async ${strings.camelize(type.typeName)}Create(input: ${type.typeName}CreateInput): Promise<${type.typeName}CreateOutput> {
    const ${strings.camelize(type.typeName)} = this.${strings.camelize(type.typeName)}Repository.create(input);${createRelationships}${initRelationships}
    await ${strings.camelize(type.typeName)}.save();
    return { ${strings.camelize(type.typeName)} };
  }
    
  async ${strings.camelize(type.typeName)}Update(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    input: ${type.typeName}UpdateInput,
  ): Promise<${type.typeName}UpdateOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });${updateFields}${updateRelationships}
    await ${strings.camelize(type.typeName)}.save();
    return { ${strings.camelize(type.typeName)} };
  }
    
  async ${strings.camelize(type.typeName)}Delete(${strings.camelize(type.typeName)}Id: ${type.typeName}['id']): Promise<${type.typeName}DeleteOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
    await ${strings.camelize(type.typeName)}.remove();
    return { ${strings.camelize(type.typeName)}Id };
  }
    
  async ${strings.camelize(pluralize(type.typeName))}Pagination(args: ${pluralize(type.typeName)}PaginationArgs): Promise<${pluralize(type.typeName)}Pagination> {
    const queryBuilder = this.${strings.camelize(type.typeName)}Repository.createQueryBuilder('${strings.camelize(type.typeName)}');
    queryBuilder.take(args.take);
    queryBuilder.skip(args.skip);
    if (args.sortBy) {
      if (args.sortBy.createdAt !== null) {
        queryBuilder.addOrderBy(
          '${strings.camelize(type.typeName)}.createdAt',
          args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
      if (args.sortBy.${type.fields[1].name} !== null) {
        queryBuilder.addOrderBy(
          '${strings.camelize(type.typeName)}.${type.fields[1].name}',
          args.sortBy.${type.fields[1].name} === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
    }
    const [nodes, totalCount] = await queryBuilder.getManyAndCount();
    return { nodes, totalCount };
  }
    
  async ${strings.camelize(type.typeName)}GetDataById(${strings.camelize(type.typeName)}Id: ${type.typeName}['id']): Promise<${type.typeName}GetOneOutput> {
    const ${strings.camelize(type.typeName)} = await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
    return { ${strings.camelize(type.typeName)} };
  }

  async ${strings.camelize(type.typeName)}GetById(${strings.camelize(type.typeName)}Id: ${type.typeName}['id']): Promise<${type.typeName}> {
    return await this.${strings.camelize(type.typeName)}Repository.findOneOrFail({
      where: { id: ${strings.camelize(type.typeName)}Id },
    });
  }
  ${fieldPaginationMethod}
}
`;
    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/${strings.camelize(
        type.typeName
      )}.service.ts`,
      fileTemplate
    );
}

function computeFieldTemplate(type: Type): string {
  let updateFields = '';
  const scalarAndEnumFields = type.fields.filter((field) => field.type !== "ID" && (!field.relation || field.isEnum));
  if (scalarAndEnumFields.length > 0) {
    scalarAndEnumFields.forEach((field) => {
        console.log(typeof field.type + "   " + field.type);
        updateFields += `
    ${strings.camelize(type.typeName)}.${strings.camelize(field.name)} = input.${strings.camelize(field.name)};`;
      });
  }
  return updateFields;
}

function computeRelationshipsTemplates(type: Type): string[] {
let [forwardRefAndInjectImport, forwardReferencedServices, referencedServices] = computeForwardRelationships(type);
  let modelsAndServices = "";
  let createRelationships = "";
  let initRelationships = "";
  let updateRelationships = "";
  let relatedRepositoryImport = "";

  const relationships = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated);
  if (relationships.length > 0) {
    forwardRefAndInjectImport += 'Inject, ';
    relationships.forEach((relationship) => {
      modelsAndServices += `
import { ${relationship.type} } from 'adapters/typeorm/entities/${strings.camelize(relationship.type)}.model';
import { ${relationship.type}Service } from './${strings.camelize(relationship.type)}.service';`;
      if (relationship.isArray) {
        createRelationships += `
    const mock${relationship.type} = new ${relationship.type}();
    planet.${strings.camelize(relationship.name)} = [mock${relationship.type}];
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length > 0) {
      for (let i = 0; i < input.${strings.camelize(pluralize(relationship.name, 1))}Ids.length; i++) {
        const ${strings.camelize(pluralize(relationship.name, 1))} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(
          input.${strings.camelize(pluralize(relationship.name, 1))}Ids[i],
        );
        ${strings.camelize(type.typeName)}.${strings.camelize(pluralize(relationship.name, 1))}s[i].id = ${strings.camelize(relationship.type)}.id;
      }
    }`;
        updateRelationships +=`
    if (input.${strings.camelize(pluralize(relationship.name, 1))}Ids) {
      const linked${strings.capitalize(relationship.name)}: ${relationship.type}[] = [];
      input.${strings.camelize(pluralize(relationship.name, 1))}Ids.forEach(async (${strings.camelize(pluralize(relationship.name, 1))}Id) => {
        linked${strings.capitalize(relationship.name)}.push(
          await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(${strings.camelize(pluralize(relationship.name, 1))}Id),
        );
      });
      planet.${strings.camelize(relationship.name)} = linked${strings.capitalize(relationship.name)};
    }`;
      if (relationship.relationType !== "selfJoinMany") {
        relatedRepositoryImport += `
    @InjectRepository(${relationship.type})
    private readonly ${strings.camelize(relationship.type)}Repository: Repository<${relationship.type}>,`;
      }
      } else {
        createRelationships += `
    ${strings.camelize(type.typeName)}.${relationship.name} = new ${relationship.type}();`;
        initRelationships += `
    if (input.${relationship.name}Id) {
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(input.${strings.camelize(relationship.type)}Id);
      ${strings.camelize(type.typeName)}.${relationship.name}.id = ${relationship.name}.id;
    }`;
        updateRelationships += `
    if (input.${relationship.name}Id) {
      ${strings.camelize(type.typeName)}.${relationship.name} = new ${relationship.type}();
      const ${relationship.name} = await this.${strings.camelize(relationship.type)}Service.${strings.camelize(relationship.type)}GetById(input.${strings.camelize(relationship.type)}Id);
      ${strings.camelize(type.typeName)}.${relationship.name}.id = ${relationship.name}.id;
    }`;
      }
    });
  }
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

function computeForwardRelationships(type: Type): string[] {
    const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.relationType !== "selfJoinOne" && field.relationType !== "selfJoinMany");
    let forwardRelationshipImport = '';
    let forwardReferencedServices = '';
    let referencedServices = '';
    relatedFields.forEach((relatedField) => {
      if (relatedField.type !== type.typeName) {
        let relation = type.relationList.find((relation) => relation.type === relatedField.type);
        if (relation.relatedFieldName) {
            forwardRelationshipImport = 'forwardRef, ';
          forwardReferencedServices += `
    @Inject(forwardRef(() => ${strings.capitalize(relatedField.type)}Service))
    private readonly ${strings.camelize(relatedField.type)}Service: ${strings.capitalize(relatedField.type)}Service,`;
        } else {
          referencedServices += `
    private readonly ${strings.camelize(relatedField.type)}Service: ${strings.capitalize(relatedField.type)}Service,`;
        }
      }
    })
    return [forwardRelationshipImport, forwardReferencedServices, referencedServices];
}

function computePaginationTemplates(type: Type): string[] {
  let paginationArgsImport = "";
  let fieldPaginationImport = "";
  let fieldPaginationMethod = "";
  const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.isArray && field.relationType);
  if (relatedFields.length > 0) {
    paginationArgsImport = 'PaginationArgs, ';
    relatedFields.forEach((relatedField) => {
      fieldPaginationImport += `
import { ${type.typeName}${strings.capitalize(relatedField.name)}Pagination } from './dto/planet/${strings.camelize(type.typeName)}-${strings.camelize(relatedField.name)}-pagination.dto';`;
      fieldPaginationMethod += `
  async ${strings.camelize(type.typeName)}${strings.capitalize(relatedField.name)}Pagination(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    args: PaginationArgs,
  ): Promise<${type.typeName}${strings.capitalize(relatedField.name)}Pagination> {
    const [nodes, totalCount] = await this.${strings.camelize(relatedField.type)}Repository.findAndCount({
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
  }`
    }); 
  }
  return [paginationArgsImport, fieldPaginationImport, fieldPaginationMethod];
}
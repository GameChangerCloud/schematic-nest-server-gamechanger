import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';


export function createTypeOrmEntitieFile(
  type: Type,
  types: Type[],
  _tree: Tree,
  projectName: string
) {
  let typeName = type.typeName;

  let entitieFiletemplate = `import { 
  Entity, 
  Column,
  JoinColumn,
  ${generateTypeOrmRelationsImportTemplate(type)}
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { I${typeName} as ${typeName}Model } from 'domain/model/${strings.decamelize(
    typeName
  )}.interface';
import { Node } from './node.model';
${generateEntitieRelationsModelImportsTemplate(type, types)}


@Entity({ name: '${strings.decamelize(typeName)}' })
@ObjectType()
export class ${typeName} extends Node implements ${typeName}Model {
  ${generateEntitieFieldsTemplate(type)}
}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/entities/${strings.decamelize(
      type.typeName
    )}.model.ts`,
    entitieFiletemplate
  );
}

/**
 * @param type 
 * @returns typeORM relations imports from type relations
 */
function generateTypeOrmRelationsImportTemplate(type: Type): string {
  let typeRelationsToTypeOrmImport = {
    oneOnly: 'OneToOne',
    oneToMany: 'ManyToOne',
    manyToOne: 'OneToMany',
  };
  let typeOrmRelationsImportTemplate = `RelationId,\n`;

  type.relationList.forEach(
    (result: {
      relation: 'oneOnly' | 'oneToMany' | 'manyToOne';
      type: string;
    }) => {
      let relation = typeRelationsToTypeOrmImport[result.relation];
      !typeOrmRelationsImportTemplate.includes(relation)
        ? (typeOrmRelationsImportTemplate += '  ' + relation + ',\n')
        : '';
    }
  );

  return typeOrmRelationsImportTemplate;
}

/**
 * @param type 
 * @returns typeORM models import from type relations
 */
function generateEntitieRelationsModelImportsTemplate(
  type: Type,
  types: Type[]
): string {
  types
  let entitieRelationsModelImportsTemplate = ``;

  type.relationList.forEach(
    (result: {
      relation: 'oneOnly' | 'oneToMany' | 'manyToOne';
      type: string;
    }) => {
      let importType = '';
      type.fields.forEach((type) => {
        type.isEnum && type.name === strings.decamelize(result.type)  
          ? importType = 'enum'
          : importType = 'model';
      });
      entitieRelationsModelImportsTemplate += `import {${
        result.type
      }} from './${strings.decamelize(result.type)}.${importType}';\n`;
    }
  );

  return entitieRelationsModelImportsTemplate;
}

/**
 * @param type 
 * @returns generate typeORM entities field for the given type
 */
function generateEntitieFieldsTemplate(type: Type): string {
  let entitieFieldstemplate = ``

  type.fields.forEach((field:any)=>{
    if(field.type !== 'ID'){
    const arrayCharacter = field.isArray ? "[]" : "";
    const nullOption = field.noNull ? "" : ", { nullable: true }";
    const nullColumn = field.noNull ? "" : "nullable: true";
    const nullField = field.noNull ? "" : "?";
    const nullType = field.noNull ? "" : " | null";
    const enumOptions = field.isEnum ? `type: 'enum',enum: ${field.type},`:``
    const pluralFieldName = field.isArray ? "s" : "";
    // const pluralRelationName = field.isArray && field.relationType !== 'manyToOne' && field.name !== type.typeName ? "s" : "";
    const singleRelation = field.relationType !== 'oneOnly' ? `, (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${strings.decamelize(type.typeName)}${pluralFieldName},`: ","
    const relationDeleteOption = field.relationType !== 'oneOnly' ? `{onDelete: 'SET NULL',}`:``
    
    field.type === 'Int' ? field.type = 'Number': ''

    let fieldTemplate = ``

    field.relation && !field.isEnum ? 
    fieldTemplate += `@${getTypeOrmRelation(field.relationType)}(() => ${strings.capitalize(field.type)} ${singleRelation} ${relationDeleteOption})
  @JoinColumn()
  ${field.name}:${field.type}${arrayCharacter};
  @RelationId((self: ${type.typeName}) => self.${strings.decamelize(field.type)}${pluralFieldName})
  readonly ${field.type}Id${pluralFieldName}${nullField}: ${field.type}['id']${arrayCharacter} ${nullType};\n` 
    : 
    fieldTemplate += `@Field(() => ${field.type}${nullOption})
  @Column({${nullColumn + enumOptions}})
  ${strings.decamelize(field.name)}${nullField}: ${field.type}${nullType};\n`

    entitieFieldstemplate += fieldTemplate

    }

  })
  
  return entitieFieldstemplate;
}

function getTypeOrmRelation(relation:'oneOnly' | 'oneToMany' | 'manyToOne'){
  let typeRelationsToTypeOrmImport = {
    oneOnly: 'OneToOne',
    oneToMany: 'ManyToOne',
    manyToOne: 'OneToMany',
  };

  return typeRelationsToTypeOrmImport[relation]
}


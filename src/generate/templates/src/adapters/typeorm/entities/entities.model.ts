import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';


export function createTypeOrmEntityFile(
  type: Type,
  types: Type[],
  _tree: Tree,
  projectName: string
) {
  let typeName = type.typeName;

  let entityFiletemplate = `import {
  Entity, 
  Column,
  JoinColumn,
  ${generateTypeOrmRelationsImportTemplate(type)}} from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';
import { I${typeName} as ${typeName}Model } from 'domain/model/${strings.decamelize(
    typeName
  )}.interface';
import { Node } from './node.model';
${generateEntityRelationsModelImportsTemplate(type, types)}
@Entity({ name: '${strings.decamelize(typeName)}' })
@ObjectType()
export class ${typeName} extends Node implements ${typeName}Model {${generateEntityFieldsTemplate(type)}
}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/entities/${strings.decamelize(
      type.typeName
    )}.model.ts`,
    entityFiletemplate
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
    manyOnly: 'OneToMany',
  };
  let typeOrmRelationsImportTemplate = `RelationId,\n`;

  type.relationList.forEach(
    (result: {
      relation: 'oneOnly' | 'oneToMany' | 'manyToOne' | 'manyOnly';
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
function generateEntityRelationsModelImportsTemplate(
  type: Type,
  types: Type[]
): string {
  types
  let entityRelationsModelImportsTemplate = ``;

  type.relationList.forEach(
    (result: {
      relation: 'oneOnly' | 'oneToMany' | 'manyToOne';
      type: string;
    }) => {
      let importType = '';
      let relatedType = types.find(type => type.typeName === result.type);
      // type.fields.forEach((type) => {
      //   type.isEnum //&& type.name === strings.decamelize(result.type)  
      //     ? importType = 'enum'
      //     : importType = 'model';
      // }); 
      importType = relatedType?.type === "EnumTypeDefinition" ? 'enum' : 'model';
      entityRelationsModelImportsTemplate += `import { ${
        result.type
      } } from './${strings.decamelize(result.type)}.${importType}';\n`;
    }
  );

  return entityRelationsModelImportsTemplate;
}

/**
 * @param type 
 * @returns generate typeORM entities field for the given type
 */
function generateEntityFieldsTemplate(type: Type): string {
  let entityFieldstemplate = ``

  type.fields.forEach((field:any)=>{
    if(field.type !== 'ID'){
    const arrayCharacter = field.isArray ? "[]" : "";
    const nullOption = field.noNull ? "" : ", { nullable: true }";
    const uniqueOption = field.noNull ? "" : "\n    unique: true,\n";
    const nullColumn = field.noNull ? "" : "\n    nullable: true,\n";
    const nullField = field.noNull ? "" : "?";
    const nullType = field.noNull ? "" : " | null";
    const enumOptions = field.isEnum ? `\n    type: 'enum',\n    enum: ${field.type},\n  `:``
    const pluralFieldName = field.isArray ? "s" : "";
    const relation = type.relationList.find(relation => relation.type === field.type)
    const relatedFieldName = relation ? relation.relatedFieldName : "";
    // const pluralRelationName = field.isArray && field.relationType !== 'manyToOne' && field.name !== type.typeName ? "s" : "";
    const singleRelation = field.relationType !== 'oneOnly' ? `, (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${relatedFieldName},`: ","
    const relationDeleteOption = `{\n    onDelete: 'SET NULL',\n  }`;
    let arrayBracketStart = '';
    let arrayBracketEnd = ''
    if (field.isEnum && field.isArray) { 
      arrayBracketStart = '[';
      arrayBracketEnd = ']';}
    field.type === 'Int' ? field.type = 'Number': ''

    let fieldTemplate = ``

    let JSFieldType = field.isEnum ? field.type : field.type.toLowerCase();
    field.relation && !field.isEnum ? 
    fieldTemplate += `\n  @${getTypeOrmRelation(field.relationType)}(() => ${strings.capitalize(field.type)}${singleRelation} ${relationDeleteOption})
  @JoinColumn()
  ${field.name}: ${field.type}${arrayCharacter};\n
  @RelationId((self: ${type.typeName}) => self.${field.name})
  readonly ${strings.camelize(field.name)}Id${pluralFieldName}${nullField}: ${field.type}['id']${arrayCharacter}${nullType};\n` 
    : 
    fieldTemplate += `\n  @Field(() => ${arrayBracketStart}${field.type}${nullOption}${arrayBracketEnd})
  @Column({${nullColumn + enumOptions + uniqueOption}  })
  ${field.name}${nullField}: ${JSFieldType}${arrayCharacter};\n`

    entityFieldstemplate += fieldTemplate

    }

  })
  
  return entityFieldstemplate;
}

function getTypeOrmRelation(relation:'oneOnly' | 'oneToMany' | 'manyToOne'){
  let typeRelationsToTypeOrmImport = {
    oneOnly: 'OneToOne',
    oneToMany: 'ManyToOne',
    manyToOne: 'OneToMany',
  };

  return typeRelationsToTypeOrmImport[relation]
}


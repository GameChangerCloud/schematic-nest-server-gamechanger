import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';


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
  JoinTable,
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
    oneToOne: 'OneToOne',
    selfJoinOne: 'OneToOne',
    oneToMany: 'ManyToOne',
    manyToOne: 'OneToMany',
    manyOnly: 'OneToMany',
    selfJoinMany: 'ManyToMany',
    manyToMany: 'ManyToMany',
    oneToOneJoin: 'OneToOne',
    manyToManyJoin: 'ManyToMany',
  };
  let typeOrmRelationsImportTemplate = `RelationId,\n`;

  type.relationList.forEach(
    (result: {
      relation: 'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany' | 'oneToOneJoin' | 'manyToManyJoin';
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
    (relation: {
      relation: 'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany' | 'oneToOneJoin' | 'manyToManyJoin' ;
      type: string;
    }) => {
      if (relation.type !== type.typeName) {
        let relatedType = types.find(type => type.typeName === relation.type);
        let importType = relatedType?.type === "EnumTypeDefinition" ? 'enum' : 'model';
        entityRelationsModelImportsTemplate += `import { ${
          relation.type
        } } from './${strings.decamelize(relation.type)}.${importType}';\n`;
      }
      
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
    const uniqueDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === "unique");
    let uniqueOption = "";
    if (uniqueDirective) {
      console.log('unique');
      uniqueOption = "\n    unique: true,\n";
    }
    
    const nullColumn = field.noNull ? "" : "\n    nullable: true,\n";
    const nullField = field.noNull ? "" : "?";
    const nullType = field.noNull ? "" : " | null";
    const enumOptions = field.isEnum ? `\n    type: 'enum',\n    enum: ${field.type},\n  `:``
    const pluralFieldName = field.isArray ? "s" : "";
    const relation = type.relationList.find(relation => relation.type === field.type)
    const relatedFieldName = relation ? relation.relatedFieldName : "";
    // const pluralRelationName = field.isArray && field.relationType !== 'manyToOne' && field.name !== type.typeName ? "s" : "";
    const singleRelation = field.relationType !== 'oneOnly' && field.relationType !== 'manyOnly' ? `, (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${relatedFieldName},`: ","
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
    fieldTemplate += `\n  @${getTypeOrmRelation(field.relationType)}(() => ${strings.capitalize(field.type)}${singleRelation} ${relationDeleteOption})${getJoinInstructions(type, field, relatedFieldName)}
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

function getTypeOrmRelation(relation:'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany'| 'oneToOneJoin' | 'manyToManyJoin'){
  let typeRelationsToTypeOrmImport = {
    oneOnly: 'OneToOne',
    oneToOne: 'OneToOne',
    selfJoinOne: 'OneToOne',
    oneToMany: 'ManyToOne',
    manyToOne: 'OneToMany',
    manyOnly: 'OneToMany',
    selfJoinMany: 'ManyToMany',
    manyToMany: 'ManyToMany',
    oneToOneJoin: 'OneToOne',
    manyToManyJoin: 'ManyToMany',
  };

  return typeRelationsToTypeOrmImport[relation]
}

function getJoinInstructions(type: Type, field: Field, relatedFieldName: string): string {
  let joinInstructions = ``;
  if (field.relationType === 'oneToOneJoin') joinInstructions += `\n  @JoinColumn({\n    name: '${field.name}_id,'\n  })`;
  if (field.relationType === 'manyToManyJoin') joinInstructions += 
`\n  @JoinTable({
    name: "${relatedFieldName}_${field.name}",
    joinColumn: {
      name: "${strings.camelize(type.typeName)}",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "${strings.camelize(field.type)}",
      referencedColumnName: "id",
    },
  })`;
  if (field.relationType === 'oneOnly' || field.relationType === 'manyOnly' || field.relationType === 'oneToMany' || field.relationType === 'manyToOne' || field.relationType === 'selfJoinOne' || field.relationType === 'selfJoinMany')
    joinInstructions = `JoinColumn()`;

  return joinInstructions;
}

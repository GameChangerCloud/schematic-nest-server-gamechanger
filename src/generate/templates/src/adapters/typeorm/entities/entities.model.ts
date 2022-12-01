import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
const pluralize = require('pluralize');

export function createTypeOrmEntityFile(
  type: Type,
  types: Type[],
  _tree: Tree,
  projectName: string
) {
  let typeName = type.typeName;

  let entityFiletemplate = `import {
  Entity,
  Column,${generateEntityRelationsModelImportsTemplate(type, types)[0]}
  JoinColumn,
  JoinTable,
  ${generateTypeOrmRelationsImportTemplate(type)}} from 'typeorm';
import {
    Length,
} from "class-validator"
import { Field, ${generateEntityRelationsModelImportsTemplate(type, types)[1]}ObjectType } from '@nestjs/graphql';
import { I${typeName} as ${typeName}Model } from 'domain/model/${strings.decamelize(
    typeName
  )}.interface';
import { Node } from './node.model';
${generateEntityRelationsModelImportsTemplate(type, types)[2]}
@Entity({ name: '${strings.decamelize(typeName)}' })
@ObjectType()
export class ${typeName} extends Node implements ${typeName}Model {${generateEntityFieldsTemplate(types, type)}
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
  let relationshipsToImport: string[] = [];
  relationshipsToImport.push('RelationId');
  type.relationList.forEach((relationship: { type: string, relation: string, relatedFieldName: string }) => {
      if (!relationshipsToImport.includes(relationship.relation)) {
        switch (relationship.relation) {
          case 'oneOnly':
            relationshipsToImport.push('OneToOne');
            break;
          case 'manyOnly':
            relationshipsToImport.push('OneToMany');
            break;
          case 'selfJoinOne':
            relationshipsToImport.push('OneToOne');
            break;
          case 'selfJoinMany':
            relationshipsToImport.push('OneToMany', 'ManyToOne');
            break;
          case 'manyToOne':
            relationshipsToImport.push('OneToMany');
            break;
          case 'oneToMany':
            relationshipsToImport.push('ManyToOne');
            break;
          case 'oneToOneJoin':
            relationshipsToImport.push('OneToOne');
            break;
          case 'manyToManyJoin':
            relationshipsToImport.push('ManyToMany');
            break;  
          default:
            relationshipsToImport.push(relationship.relation.charAt(0).toUpperCase() + relationship.relation.slice(1));
            break;
        }
      }
    });
    relationshipsToImport = relationshipsToImport.filter((item, index) => relationshipsToImport.indexOf(item) === index);
  return relationshipsToImport.join(',\n  ') + ',\n';
}

/**
 * @param type 
 * @returns typeORM models import from type relations
 */
function generateEntityRelationsModelImportsTemplate(
  type: Type,
  types: Type[]
): string[] {
  let entityRelationsModelImportsTemplate = ``;
  let primaryColumnImport = ``;
  let idImport = ``;
  let nodeId = true;
  types.forEach((type) => {
    if (type.fields.find((field => field.type === 'ID'))) {
      nodeId = false;
      idImport = `ID, `;
    }
  });

  const idField = type.fields.find((field => field.type === 'ID'));
  if (idField) {
    idImport = `ID, `;
    primaryColumnImport = `\n  PrimaryColumn, `;
  } else if (!nodeId) primaryColumnImport = `\n  PrimaryGeneratedColumn,`;

  type.relationList.forEach(
    (relation: {
      relation: 'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany' | 'oneToOneJoin' | 'manyToManyJoin' ;
      type: string;
    }) => {
      if (relation.type !== type.typeName) {
        let relatedType = types.find(type => type.typeName === relation.type);
        let importType = relatedType?.type === 'EnumTypeDefinition' ? 'enum' : 'model';
        entityRelationsModelImportsTemplate += `import { ${
          relation.type
        } } from './${strings.decamelize(relation.type)}.${importType}';\n`;
      }
      
    }
  );

  return [primaryColumnImport, idImport, entityRelationsModelImportsTemplate];
}

/**
 * @param type 
 * @returns generate typeORM entities field for the given type
 */
function generateEntityFieldsTemplate(types: Type[], type: Type): string {
  
  
  let entityFieldsTemplate = ``;
  let nodeId = true;
  const idField = type.fields.find((field => field.type === 'ID'));
  if (idField) entityFieldsTemplate += `\n  @Field(() => ID)\n  @PrimaryColumn()\n  id: string;\n`;
  types.forEach((type) => {
    if (type.fields.find((field => field.type === 'ID'))) nodeId = false;
  });
  if (!nodeId && !idField) entityFieldsTemplate += `\n  @Field(() => ID)\n  @PrimaryGeneratedColumn('uuid')\n  id: string;\n`;


  type.fields.forEach((field:any)=>{
    // console.log('TYPE DIRECTIVES :',field.directives);
    let deprecatedField = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === "deprecated");

    if(field.type !== 'ID' && field.relationType !== "selfJoinMany" && !deprecatedField){
      
    const arrayCharacter = field.isArray ? "[]" : "";
    const nullOption = field.noNull ? "" : ", { nullable: true }";
    const uniqueDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === "unique");
    const longDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === "long");
    const doubleDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === "double");
    const lengthDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === "length");

    let uniqueOption = "";
    let longIntOption = ''
    let floatOption = ''
    let lengthOption = ''
    longDirective ? longIntOption = 'type: "bigint"' : ''
    doubleDirective ? floatOption = 'type: "double"' : ''
    uniqueDirective ? uniqueOption = "\n    unique: true,\n": '';

    if(lengthDirective){
      console.log(lengthDirective.args.length,lengthOption);
      lengthDirective.args.length === 2 ? lengthOption = `@Length(${lengthDirective.args[0].value}, ${lengthDirective.args[1].value})`: lengthOption = `@Length(${lengthDirective.args[0].value})`
    }
    
    
    const nullColumn = field.noNull ? '' : '\n    nullable: true,\n';
    const nullField = field.noNull ? '' : '?';
    const nullType = field.noNull ? '' : ' | null';
    const enumOptions = field.isEnum ? `\n    type: 'enum',\n    enum: ${field.type},\n`:``
    const pluralFieldName = field.isArray ? 's' : '';
    const relation = type.relationList.find(relation => relation.type === field.type)
    const relatedFieldName = relation ? relation.relatedFieldName : '';
    // const pluralRelationName = field.isArray && field.relationType !== 'manyToOne' && field.name !== type.typeName ? 's' : '';
    const singleRelation = field.relationType !== 'oneOnly' && field.relationType !== 'manyOnly' ? `, (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${relatedFieldName},`: ','
    const relationDeleteOption = `{\n    onDelete: 'SET NULL',\n  }`;
    let arrayBracketStart = '';
    let arrayBracketEnd = ''
    if (field.isEnum && field.isArray) { 
      arrayBracketStart = '[';
      arrayBracketEnd = ']';
    }
    
    field.type === 'Float' ? floatOption = " type: 'numeric', precision: 10, scale: 2 " : ''
    field.type === 'Int' || field.type === 'Float' ? field.type = 'Number': ''
    let fieldTemplate = ``
    let JSFieldType = field.isEnum ? field.type : field.type.toLowerCase();

    field.relation && !field.isEnum ? 
    fieldTemplate += `\n  @${getTypeOrmRelation(field.relationType)}(() => ${strings.capitalize(field.type)}${singleRelation} ${relationDeleteOption})${getJoinInstructions(type, field, relatedFieldName)}
  ${field.name}: ${field.type}${arrayCharacter};\n
  @RelationId((self: ${type.typeName}) => self.${field.name})
  readonly ${strings.camelize(pluralize(field.name, 1))}Id${pluralFieldName}${nullField}: ${field.type}['id']${arrayCharacter}${nullType};\n` 
    : 
    fieldTemplate += `\n  @Field(() => ${arrayBracketStart}${field.type}${nullOption}${arrayBracketEnd})
  ${lengthOption}
  @Column({${nullColumn + enumOptions + uniqueOption + longIntOption + floatOption}  })
  ${field.name}${nullField}: ${JSFieldType}${arrayCharacter};\n`

    entityFieldsTemplate += fieldTemplate

    } else if (field.relationType === 'selfJoinMany') {
      entityFieldsTemplate += `\n  @ManyToOne(() => ${field.type}, (${strings.camelize(field.type)}) => ${strings.camelize(field.type)}.child${strings.capitalize(pluralize(field.name))}, {
    onDelete: 'SET NULL',
  })
  parent${strings.capitalize(pluralize(field.name, 1))}: ${field.type};

  @OneToMany(() => ${field.type}, (${strings.camelize(field.type)}) => ${strings.camelize(field.type)}.parent${strings.capitalize(pluralize(field.name, 1))}, {
    onDelete: 'SET NULL',
  })
  child${strings.capitalize(pluralize(field.name))}: ${field.type}[];\n
  @RelationId((self: ${type.typeName}) => self.child${strings.capitalize(pluralize(field.name))})
  readonly child${strings.capitalize(pluralize(field.name, 1))}Ids?: ${field.type}['id'][] | null;\n`
    }

  })
  
  return entityFieldsTemplate;
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
  if (field.relationType === 'oneToOneJoin') joinInstructions += `\n  @JoinColumn()`;
  if (field.relationType === 'manyToManyJoin') joinInstructions += 
`\n  @JoinTable({
    name: '${relatedFieldName}_${field.name}',
    joinColumn: {
      name: '${strings.camelize(type.typeName)}',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: '${strings.camelize(field.type)}',
      referencedColumnName: 'id',
    },
  })`;
  if (field.relationType === 'oneOnly' || field.relationType === 'manyOnly' || field.relationType === 'oneToMany' || field.relationType === 'manyToOne' || field.relationType === 'selfJoinOne' || field.relationType === 'selfJoinMany')
    joinInstructions = `\n  @JoinColumn()`;

  return joinInstructions;
}

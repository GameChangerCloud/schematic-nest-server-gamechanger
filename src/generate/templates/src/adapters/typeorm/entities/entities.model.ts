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
  ${generateTypeOrmRelationsImportTemplate(type, types)}} from 'typeorm';
import { Field, ${generateEntityRelationsModelImportsTemplate(type, types)[1]}ObjectType } from '@nestjs/graphql';
import { I${typeName} as ${typeName}Model } from 'domain/model/${strings.decamelize(
    typeName
  )}.interface';
import { Node } from './node.model';
${generateEntityRelationsModelImportsTemplate(type, types)[2]}${computeManyOnlyRelationships(types, type)[2].toString()}${classValidatorsImport(type)}
@Entity({ name: '${strings.decamelize(typeName)}' })
@ObjectType('${typeName}')
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
function generateTypeOrmRelationsImportTemplate(type: Type, types: Type[]): string {
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
  console.log(` A : ${type.typeName}`);
  if (computeManyOnlyRelationships(types, type)[0]) relationshipsToImport.push('ManyToOne');
  relationshipsToImport = relationshipsToImport.filter((item, index) => relationshipsToImport.indexOf(item) === index);
  return relationshipsToImport.join(',\n  ') + ',\n';
}

function classValidatorsImport(type: Type): string {
  let validators: string[] = [];
  let supportedValidators = ['String', 'HSL', 'Boolean', 'Currency', 'PhoneNumber', 'PostalCode', 'JSON', 'ISBN', 'Port', 'Date']
  let importValidatorsTemplate = ``;

  type.fields
    .forEach((field: Field) => {
      if (supportedValidators.includes(field.type) && !validators.includes(`Is${field.type}`)) validators.push(`Is${field.type}`);
      else if (field.type.includes('Positive') && !field.type.includes('Non') && !validators.includes(`IsPositive`)) validators.push(`IsPositive`);
      else if (field.type.includes('Negative') && !field.type.includes('Non') && !validators.includes(`IsNegative`)) validators.push(`IsNegative`);
      else if (field.type.includes('Int') && !validators.includes(`IsInt`)) validators.push(`IsInt`);
      else if (field.type.includes('IP') && !validators.includes(`IsIP`)) validators.push(`IsIP`);
      else if (field.type === 'RGB' || field.type === 'RGBA' && !validators.includes(`IsRgbColor`)) validators.push(`IsRgbColor`);
      else if (field.type === 'HexColorCode' && !validators.includes(`IsHexColor`)) validators.push(`IsHexColor`);
      else if (field.type === 'EmailAddress' && !validators.includes(`IsEmail`)) validators.push(`IsEmail`);
      else if (field.type === 'MAC' && !validators.includes(`IsMACAddress`)) validators.push(`IsMACAddress`);
      else if (field.type === 'URL' && !validators.includes(`IsUrl`)) validators.push(`IsUrl`);
      else if (field.isEnum && !validators.includes(`IsEnum`)) validators.push(`IsEnum`);
    });
  if (validators.length > 0) importValidatorsTemplate = `\nimport { ${validators.join(', ')} } from 'class-validator';\n`;
  return importValidatorsTemplate;
}

/**
 * @param type 
 * @returns typeORM models import from type relations
 */
function generateEntityRelationsModelImportsTemplate(
  processedType: Type,
  types: Type[]
): string[] {
  let entityRelationsModelImportsTemplate = ``;
  let primaryColumnImport = ``;
  let idImport = ``;
  let nodeId = true;
  types.forEach((type) => {
    if (type.fields.find((field) => field.type === 'ID')) {
      nodeId = false;
      idImport = `ID, `;
    }
  });

  const idField = processedType.fields.find((field => field.type === 'ID'));
  if (idField) {
    idImport = `ID, `;
    primaryColumnImport = `\n  PrimaryColumn,`;
  } else if (!nodeId) primaryColumnImport = `\n  PrimaryColumn,`; // PrimaryGeneratedColumn
  const manyOnlyRelationships = computeManyOnlyRelationships(types, processedType)[2];

  processedType.relationList.forEach(
    (relation: {
      relation: 'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany' | 'oneToOneJoin' | 'manyToManyJoin';
      type: string;
    }) => {
      console.log(manyOnlyRelationships);
      if (relation.type !== processedType.typeName && !manyOnlyRelationships.includes(relation.type)) {
        let relatedType = types.find(type => type.typeName === relation.type);
        let importType = relatedType?.type === 'EnumTypeDefinition' ? 'enum' : 'model';
        entityRelationsModelImportsTemplate += `import { ${relation.type
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
  if (!nodeId && !idField) entityFieldsTemplate += `\n  @Field(() => ID)\n  @PrimaryColumn()\n  id: string;\n`; //@PrimaryGeneratedColumn("uuid")


  type.fields.forEach((field: Field) => {

    let deprecatedField = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === 'deprecated');
    let fieldType = field.type;
    if (field.type !== 'ID' && field.relationType !== 'selfJoinMany' && !deprecatedField) {
      const arrayCharacter = field.isArray ? '[]' : '';
      const nullOption = field.noNull ? '' : ', { nullable: true }';
      const uniqueDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === 'unique');
      const longDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === 'long');
      const doubleDirective = field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name.toLocaleLowerCase() === 'double');

      let uniqueOption = '';
      let longIntOption = '';
      let floatOption = '';
      longDirective ? longIntOption = '    type: \'bigint\',\n' : ''
      doubleDirective ? floatOption = '    type: \'double\',\n' : ''
      uniqueDirective ? uniqueOption = '\n    unique: true,\n' : '';

      const nullColumn = field.noNull ? '' : '\n    nullable: true,\n';
      const nullField = field.noNull ? '' : '?';
      const nullType = field.noNull ? '' : ' | null';
      const enumOptions = field.isEnum ? `\n    type: 'enum',\n    enum: ${field.type},\n` : ``
      const pluralFieldName = field.isArray ? 's' : '';
      const relation = type.relationList.find(relation => relation.type === field.type)
      const relatedFieldName = relation ? relation.relatedFieldName : '';
      let singleRelation = `,`;
      if (field.relationType !== 'oneOnly' && field.relationType !== 'manyOnly')
        singleRelation += ` (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${relatedFieldName},`;
      if (field.relationType === 'manyOnly')
        singleRelation += ` (${strings.decamelize(field.type)}) => ${strings.decamelize(field.type)}.${strings.camelize(type.typeName)},`;
      const relationDeleteOption = `{\n    onDelete: 'SET NULL',\n  }`;
      let arrayBracketStart = '';
      let arrayBracketEnd = ''
      if (field.isArray) {
        arrayBracketStart = '[';
        arrayBracketEnd = ']';
      }
      if (field.type !== 'String' && field.type !== 'Int' && field.type !== 'Float' && field.type !== 'ID' && field.type !== 'Boolean' && !field.relation && !field.type.includes('Int')) fieldType = 'String';
      field.type === 'Float' || field.type.includes('Int') ? fieldType = 'Number' : '';
      field.type === 'Float' ? floatOption = '    type: \'numeric\',\n    precision: 10,\n    scale: 2,\n' : '';

      let fieldTemplate = ``
      let JSFieldType = field.isEnum ? fieldType : fieldType.toLowerCase();

      field.relation && !field.isEnum ?
        fieldTemplate += `\n  @${getTypeOrmRelation(field.relationType)}(() => ${strings.capitalize(field.type)}${singleRelation} ${relationDeleteOption})${getJoinInstructions(type, field, relatedFieldName)}
  ${field.name}: ${field.type}${arrayCharacter};\n
  @RelationId((self: ${type.typeName}) => self.${field.name})
  readonly ${strings.camelize(pluralize(field.name, 1))}Id${pluralFieldName}${nullField}: ${field.type}['id']${arrayCharacter}${nullType};\n`
        :
        fieldTemplate += `\n  ${getTypeValidators(field)}@Field(() => ${arrayBracketStart}${fieldType}${arrayBracketEnd}${nullOption})
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

  entityFieldsTemplate += computeManyOnlyRelationships(types, type)[1];

  return entityFieldsTemplate;
}

function getTypeOrmRelation(relation: 'oneOnly' | 'oneToOne' | 'selfJoinOne' | 'oneToMany' | 'manyToOne' | 'manyOnly' | 'selfJoinMany' | 'manyToMany' | 'oneToOneJoin' | 'manyToManyJoin') {
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

function computeManyOnlyRelationships(types: Type[], manyOnlyType: Type): [boolean, string, string] {
  let manyOnlyTemplate = ``;
  let importManyToOne = false;
  let entitiesToImport: string[] = [];
  let entitiesImportTemplate = ``;
  types.forEach((type) => {
    const fieldInRelatedType = type.fields.find((field) => field.type === manyOnlyType.typeName)
    if (fieldInRelatedType && fieldInRelatedType.relationType === 'manyOnly') {
      manyOnlyTemplate += `\n
  @ManyToOne(() => ${type.typeName}, (${strings.camelize(type.typeName)}) => ${strings.camelize(type.typeName)}.${fieldInRelatedType.name}, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  ${strings.camelize(type.typeName)}: ${type.typeName};

  @RelationId((self: ${manyOnlyType.typeName}) => self.${strings.camelize(type.typeName)})
  readonly ${strings.camelize(type.typeName)}Id?: ${type.typeName}['id'] | null;`;
      importManyToOne = true;
      entitiesToImport.push(`${type.typeName}`);
    }
  });
  entitiesToImport.filter((item, index) => entitiesToImport.indexOf(item) === index);
  entitiesToImport.forEach((entity) => entitiesImportTemplate += `import { ${entity} } from './${entity.toLowerCase()}.model';\n`);

  return [importManyToOne, manyOnlyTemplate, entitiesImportTemplate];
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

function getTypeValidators(field: Field): string {
  let typeValidators = ``;
  if (field.type.includes('Positive') && !field.type.includes('Non')) typeValidators += '@IsPositive()\n  ';
  if (field.type.includes('Negative') && !field.type.includes('Non')) typeValidators += '@IsNegative()\n  ';

  if (field.type === 'EmailAddress') typeValidators += `@IsEmail()\n  `;
  else if (field.isEnum) typeValidators += `@IsEnum(${field.type})\n  `;
  else if (field.type.includes('IP')) typeValidators += `@IsIP(${field.type[3]})\n  `;
  else if (field.type === 'MAC') typeValidators += `@IsMACAddress()\n  `;
  else if (field.type === 'URL') typeValidators += `@IsUrl()\n  `;
  else if (field.type === 'HSL') typeValidators += `@IsHSL()\n  `;
  else if (field.type === 'RGB' || field.type === 'RGBA') typeValidators += `@IsRgbColor()\n  `;
  else if (field.type === 'Port') typeValidators += `@IsPort()\n  `;
  else if (field.type === 'ISBN') typeValidators += `@IsISBN()\n  `;
  else if (field.type === 'JSON') typeValidators += `@IsJSON()\n  `;
  else if (field.type === 'Currency') typeValidators += `@IsCurrency()\n  `;
  else if (field.type === 'PostalCode') typeValidators += `@IsPostalCode()\n  `;
  else if (field.type === 'PhoneNumber') typeValidators += `@IsPhoneNumber()\n  `;
  else if (field.type === 'HexColorCode') typeValidators += `@IsHexColor()\n  `
  else if (field.type === 'Boolean') typeValidators += `@IsBoolean()\n  `;
  else if (field.type === 'Date') typeValidators += `@IsDate()\n  `;
  else if (field.type === 'String') typeValidators += `@IsString()\n  `;
  else if (field.type.includes('Int')) typeValidators += `@IsInt()\n  `;
  return typeValidators;
}

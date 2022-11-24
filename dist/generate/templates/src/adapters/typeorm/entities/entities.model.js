"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeOrmEntitieFile = void 0;
const core_1 = require("@angular-devkit/core");
function createTypeOrmEntitieFile(type, _tree, projectName) {
    // const importTemplate = computeImportsTemplate(type);
    // const stdScalarsTemplate = computeScalarsTemplate(type);
    // const stdRelationshipsTemplate = computeRelationshipsTemplate(type);
    console.log('Create Entitie :', type);
    let typeName = type.typeName;
    let typeOrmRelationsImportTemplate = generateTypeOrmRelationsImportTemplate(type);
    let entitieRelationsModelImportsTemplate = generateEntitieRelationsModelImportsTemplate(type);
    let entitieFieldsTemplate = generateEntitieFieldsTemplate(type);
    let entitieFiletemplate = `
  import { 
    Entity, 
    Column,
    ${typeOrmRelationsImportTemplate}
  } from 'typeorm';
  import { Field, ObjectType } from '@nestjs/graphql';

  import { I${typeName} as ${typeName}Model } from 'domain/model/${core_1.strings.decamelize(typeName)}.interface';
  import { Node } from './node.model';
  
  ${entitieRelationsModelImportsTemplate}
  
  
  @Entity({ name: '${core_1.strings.decamelize(typeName)}' })
  @ObjectType()
  export class ${typeName} extends Node implements ${typeName}Model {
    ${entitieFieldsTemplate}
  }
  `;
    // Create Service file
    _tree.create(`${projectName}/src/adapters/typerorm/entities/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}.model.ts`, entitieFiletemplate);
}
exports.createTypeOrmEntitieFile = createTypeOrmEntitieFile;
function generateTypeOrmRelationsImportTemplate(type) {
    let template = `
  OneToOne,
  ManyToOne,
  JoinColumn,
  RelationId
  `;
    type;
    return template;
}
function generateEntitieRelationsModelImportsTemplate(type) {
    type;
    let template = `
  import { Planet } from './planet.model';
  import { User } from './user.model';
  import { Rank } from './rank.enum';
  `;
    return template;
}
function generateEntitieFieldsTemplate(type) {
    type;
    let template = `
  @Field(() => String)
  @Column({})
  firstname: string;

  @Field(() => String)
  @Column({})
  lastname: string;

  @Field(() => String, { nullable: true })
  @Column({
    nullable: true,
  })
  picture?: string | null;

  @Field(() => Rank)
  @Column({
    type: 'enum',
    enum: Rank,
  })
  rank: Rank;

  // OneOnly
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @RelationId((self: Astronaut) => self.user)
  readonly userId?: User['id'] | null;

  // ManyToOne
  @ManyToOne(() => Planet, (planet) => planet.astronauts, {
    onDelete: 'CASCADE',
  })
  
  @JoinColumn()
  planet: Planet;

  @RelationId((self: Astronaut) => self.planet)
  readonly planetId?: Planet['id'] | null;

  `;
    return template;
}
// function computeImportsTemplate(type: Type): string {
//   let importTemplate = ``;
//   const relationships = type.fields.filter(
//     (field) => field.relation === true && !field.isDeprecated
//   );
//   relationships.forEach((relationship) => {
//     const scalarTemplate = `\nimport { ${
//       relationship.type
//     } } from 'adapters/typeorm/entities/${relationship.type.toLowerCase()}.model';`;
//     importTemplate += scalarTemplate;
//   });
//   return importTemplate;
// }
// function computeScalarsTemplate(type: Type): string {
//   let importTemplate = ``;
//   const scalars = type.fields.filter(
//     (field) =>
//       field.relation === false && !field.isDeprecated && field.type != 'ID'
//   );
//   scalars.forEach((scalar) => {
//     const arrayCharacter = scalar.isArray ? '[]' : '';
//     const noNullOption = scalar.noNull ? '' : ', { nullable: true }';
//     const noNullCharacter = scalar.noNull ? '' : '?';
//     let scalarTypeGQL: string;
//     switch (scalar.type) {
//       case 'String':
//         scalarTypeGQL = 'String';
//         break;
//       case 'Float':
//       case 'Int':
//         scalarTypeGQL = 'Number';
//         break;
//       case 'Boolean':
//         scalarTypeGQL = 'Boolean';
//         break;
//       default:
//         scalarTypeGQL = 'Other';
//     }
//     const scalarTemplate = `  @Field(() => ${scalarTypeGQL}${noNullOption})
//   ${
//     scalar.name
//   }${noNullCharacter} : ${scalar.type.toLowerCase()}${arrayCharacter}
// `;
//     importTemplate += scalarTemplate;
//   });
//   return importTemplate;
// }
// function computeRelationshipsTemplate(type: Type): string {
//   let importTemplate = ``;
//   const relationships = type.fields.filter(
//     (field) => field.relation === true && !field.isDeprecated
//   );
//   relationships.forEach((relationship) => {
//     let scalarTemplate;
//     if (relationship.isArray) {
//       scalarTemplate = `
//     @Field(() => [String], { nullable: true })
//     ${relationship.type.toLowerCase()}Ids?: ${relationship.type}['id'][] | null;
//     `;
//     } else {
//       scalarTemplate = `  @Field(() => String, { nullable: true })
//   ${relationship.type.toLowerCase()}Id?: ${relationship.type}['id'] | null;
// `;
//     }
//     importTemplate += scalarTemplate;
//   });
//   return importTemplate;
// }
//# sourceMappingURL=entities.model.js.map
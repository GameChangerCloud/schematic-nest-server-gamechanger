import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createNodeModel(
  types: Type[], 
  _tree: Tree, 
  projectName: string
) {
  let fileTemplate =
`import { Field, ${handleIdGeneration(types)[0]}InterfaceType } from '@nestjs/graphql';
import {
  BaseEntity,
  CreateDateColumn,${handleIdGeneration(types)[1]}
  UpdateDateColumn,
} from 'typeorm';

@InterfaceType()
export abstract class Node extends BaseEntity {${handleIdGeneration(types)[2]}
  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}\n`
  
  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/entities/node.model.ts`,
    fileTemplate
  );
}

function handleIdGeneration(types: Type[]): string[] {
  let typesHaveIDs = false;
  let importID = '';
  let importPrimaryGeneratedColumn = '';
  let primaryGeneratedColumn = '';
  types.forEach((type) => {
    if (type.fields.find((field => field.type === 'ID'))) typesHaveIDs = true;
  })
  if (!typesHaveIDs) {
    importID = 'ID, ';
    importPrimaryGeneratedColumn = '\n  PrimaryGeneratedColumn,'
    primaryGeneratedColumn = `\n  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
`;
  }
  return [importID, importPrimaryGeneratedColumn, primaryGeneratedColumn];
}

import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createNodeModelInterface(
  types: Type[],
  _tree: Tree,
  projectName: string
) {
  let domainModelInterfaceTemplate = 
`export interface INode {${generateEntityFieldsTemplate(types)}
  createdAt: Date;
  updatedAt: Date;
}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/domain/model/node.interface.ts`,
    domainModelInterfaceTemplate
  );
}

function generateEntityFieldsTemplate(types: Type[]): string {
    let idDefinition = '';
    let nodeId = true;
    types.forEach((type) => {
      if (type.fields.find((field: Field) => field.type === "ID")) nodeId = false;
    });
    if (nodeId) idDefinition = `\n  id: string`;   
  return idDefinition;
}


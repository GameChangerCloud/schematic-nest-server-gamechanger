import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createDomainModelInterfaceFile(
  types: Type[],
  type: Type,
  _tree: Tree,
  projectName: string
) {

  let typeName = type.typeName

  let domainModelInterfaceTemplate = 
`import { INode } from './node.interface';
${generateEntityRelationsModelImportsTemplate(type)}
export interface I${typeName} extends INode {
${generateEntityFieldsTemplate(types,type)}}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/domain/model/${strings.decamelize(type.typeName)}.interface.ts`,
    domainModelInterfaceTemplate
  );
}

function generateEntityRelationsModelImportsTemplate(type: Type): string {

    let entityRelationsModelImportsTemplate = ''

    type.fields.forEach(field=>{
      if(field.relation && field.type !== type.typeName){
        let interfacedPrefix = field.isEnum ? '': 'I'
        let interfacedField = field.isEnum ? '': '.interface'
        entityRelationsModelImportsTemplate += 
        `import { ${interfacedPrefix}${strings.capitalize(field.type)} } from './${strings.camelize(field.type)}${interfacedField}';\n`
      }
    })

    return entityRelationsModelImportsTemplate
}



function generateEntityFieldsTemplate(types: Type[], type: Type): string {
    let template = '';
    let nodeId = true;
    const idField = type.fields.find((field => field.type === "ID"));
    if (idField) template += `  ${idField.name}: string\n`;
    types.forEach((type) => {
      if (type.fields.find((field: Field) => field.type === "ID")) nodeId = false;
    });
    if (!nodeId && !idField) template += `  id: string\n`;

    type.fields.forEach(field=>{

      const nullField = field.noNull ? "" : "?";
      const arrayCharacter = field.isArray ? "[]" : "";
      const plurals = field.isArray ? "s":''
      let interfacedField = ''
      if(field.type !== 'String' && field.type !== 'Number' && field.type !== 'Boolean' && !field.isEnum && field.type !== 'ID' ) {
        interfacedField = 'I';
        template += `  ${strings.camelize(field.type)}Id${plurals}?: string${arrayCharacter};\n`;
      }
      if(field.type !== 'ID'){
        if (!field.relation) template += `  ${strings.camelize(field.name)}${nullField}: ${interfacedField}${strings.camelize(field.type)}${arrayCharacter};\n`;
        else template += `  ${strings.camelize(field.name)}${nullField}: ${interfacedField}${field.type}${arrayCharacter};\n`;
      }
    })    
  return template
}


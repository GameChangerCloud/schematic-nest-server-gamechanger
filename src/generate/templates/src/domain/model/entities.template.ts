import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createDomainModelInterfaceFile(
  type: Type,
  _tree: Tree,
  projectName: string
) {

  let typeName = type.typeName

  let domainModelInterfaceTemplate = 
`import { INode } from './node.interface';
${generateEntitieRelationsModelImportsTemplate(type)}
export interface I${typeName} extends INode {
${generateEntitieFieldsTemplate(type)}}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/domain/model/${strings.decamelize(type.typeName)}.interface.ts`,
    domainModelInterfaceTemplate
  );
}

function generateEntitieRelationsModelImportsTemplate(type: Type): string {

    let entitieRelationsModelImportsTemplate = ''

    type.fields.forEach(field=>{
      if(field.relation && field.type !== type.typeName){
        let interfacedPrefix = field.isEnum ? '': 'I'
        let interfacedField = field.isEnum ? '': '.interface'
        entitieRelationsModelImportsTemplate += 
        `import { ${interfacedPrefix}${strings.capitalize(field.type)} } from './${strings.camelize(field.type)}${interfacedField}';\n`
      }
    })

    return entitieRelationsModelImportsTemplate
}



function generateEntitieFieldsTemplate(type: Type): string {
    type
    let template = '';

    type.fields.forEach(field=>{

      const nullField = field.noNull ? "" : "?";
      const arrayCharacter = field.isArray ? "[]" : "";
      const plurals = field.isArray ? "s":''
      let interfacedField = ''
      if(field.type !== 'String' && field.type !== 'Number' && field.type !== 'Boolean' && !field.isEnum && field.type !== 'ID' ) {
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


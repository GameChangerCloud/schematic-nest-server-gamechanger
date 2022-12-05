import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
const pluralize = require('pluralize');

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
    const idField = type.fields.find((field => field.type === 'ID'));
    if (idField) template += `  id: string;\n`;
    types.forEach((type) => {
      if (type.fields.find((field: Field) => field.type === 'ID')) nodeId = false;
    });
    if (!nodeId && !idField) template += `  id: string;\n`;

    type.fields.forEach(field=>{

      const nullField = field.noNull ? '' : '?';
      const arrayCharacter = field.isArray ? '[]' : '';
      const plurals = field.isArray ? 's':''
      let interfacedField = ''
      let TSfieldType = field.type;
      if (field.type !== 'String' && !field.type.includes('Int') && field.type !== 'Float' && field.type !== 'ID' && field.type !== 'Boolean' && !field.relation) TSfieldType = 'String';
      if (field.type.includes('Int') || field.type === 'Float') TSfieldType = 'Number';
      if(!field.isEnum && field.relation) {
        interfacedField = 'I';
        if (field.relationType === 'selfJoinMany') template += `  child${strings.camelize(pluralize(field.name, 1))}Ids?: string[];\n  parent${strings.camelize(pluralize(field.name, 1))}Id?: string;\n`;
        template += `  ${strings.camelize(pluralize(field.name, 1))}Id${plurals}?: string${arrayCharacter};\n`;
      }
      if(field.type !== 'ID'){
        if (!field.relation) template += `  ${strings.camelize(field.name)}${nullField}: ${interfacedField}${strings.camelize(TSfieldType)}${arrayCharacter};\n`;
        else if (field.relationType === 'selfJoinMany') 
          template += `  child${strings.capitalize(pluralize(field.name))}${nullField}: ${interfacedField}${TSfieldType}${arrayCharacter};\n  parent${strings.capitalize(pluralize(field.name, 1))}${nullField}: ${interfacedField}${TSfieldType};\n`;
        else template += `  ${strings.camelize(field.name)}${nullField}: ${interfacedField}${TSfieldType}${arrayCharacter};\n`;
      }
    })    
  return template
}


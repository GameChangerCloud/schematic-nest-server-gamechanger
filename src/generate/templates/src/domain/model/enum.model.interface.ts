import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createDomainModelEnumFile(
  type: Type,
  _tree: Tree,
  projectName: string
) {

  let typeName = type.typeName


  // Create Service file
  _tree.create(
    `${projectName}/src/domain/model/${strings.decamelize(typeName)}.ts`,
    generateEnumFileTemplate(type)
  );
}


function generateEnumFileTemplate(type:Type): string{
  let typeName = type.typeName
 
 let enumListTemplate = ``
type.values.forEach((value:string)=>{
  enumListTemplate += `  ${value} = '${value.toLocaleLowerCase()}',\n`
})
  let entitieEnumListTemplate = 
`export enum ${typeName} {
${enumListTemplate}}`

  return entitieEnumListTemplate
}


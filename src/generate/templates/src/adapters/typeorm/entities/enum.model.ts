import { strings } from '@angular-devkit/core';
import { Tree} from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createTypeOrmEnumFile(type: Type, _tree: Tree, projectName: string) {

  let typeName = type.typeName
  let entitieEnumListTemplate = generateEntitieEnumListTemplate(type)
  let enumFileTemplate =
`import { registerEnumType } from '@nestjs/graphql';

${entitieEnumListTemplate}

registerEnumType(${typeName}, {
  name: '${typeName}',
});\n`
  
  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/entities/${strings.decamelize(type.typeName)}.enum.ts`,
    enumFileTemplate
  );
}

function generateEntitieEnumListTemplate(type:Type): string{
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

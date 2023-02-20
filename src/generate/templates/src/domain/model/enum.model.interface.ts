import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createDomainModelEnumFile(
  type: Type,
  _tree: Tree,
  projectName: string
) {
  let template = generateEnumFileTemplate(type);

  _tree.create(
    `${projectName}/src/domain/model/${strings.decamelize(type.typeName)}.ts`,
    template
  );
}

function generateEnumFileTemplate(type:Type): string{
  let enumListTemplate = ``;
  type.values.forEach((value:string) => {
    enumListTemplate += `  ${value} = '${value.toLocaleLowerCase()}',\n`
  });
  let entityEnumListTemplate = 
    `export enum ${type.typeName} {
${enumListTemplate}}`;

  return entityEnumListTemplate;
}


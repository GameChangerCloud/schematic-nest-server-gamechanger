This schematic allows you to generate graphql API based on NestJS and TypeORM

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with

```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!

### Running

To use generator, start of by installing the npm package in a repository which contains your graphql schema:

```bash
npm install schematic-nest-server-gamechanger@latest
````

Then use the following to generate projet

To run generator, add your graphql schema in the graphql-schemas folder and run:

```bash
schematics ./:generate --dry-run=false
```

You will then need to enter the name of the project you want to generate and the name and extension of the schema file as so :
`nest-graphql-server`
`employees.graphql`
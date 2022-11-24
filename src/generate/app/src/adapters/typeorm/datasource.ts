import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Constants } from 'config/credentials';

import { Planet } from './entities/planet.model';
import { User } from './entities/user.model';
import { Astronaut } from './entities/astronaut.model';

<% for (let i = 0; i < types.length; i++) { %> 
  import {<%=types[i].typeName%>} from './entities/<%=camelize(types[i].typeName)%>.model';
<% } %> 

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Constants.DATABASE_HOST,
  port: Constants.DATABASE_PORT,
  username: Constants.DATABASE_USER,
  password: Constants.DATABASE_PASSWORD,
  database: Constants.DATABASE_DB,
  synchronize: true,
  logging: true,
  entities: [Planet, User, Astronaut],
  subscribers: [],
  migrations: [],
});

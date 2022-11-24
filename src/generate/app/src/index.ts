// eslint-disable-next-line @typescript-eslint/no-var-requires
const { graphql } = require('graphql');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require('./schema');
// Entry point of the lambdas function
module.exports.handler = (event, context, callback) => {
  console.log(
    '**********************  Received Event  *******************\n' +
      JSON.stringify(event),
  );
  if (event['query']) {
    graphql({
      schema: schema,
      source: event['query'],
      variableValues: event['variables'],
    }).then((response) => {
      console.log(JSON.stringify(response));
      if (response.errors)
        callback(null, {
          statusCode: 200,
          data: response.data,
          errors: response.errors,
        });
      else callback(null, { statusCode: 200, data: response.data });
    });
  } else if (event['initTable']) {
    console.log('InitTable');
    //initDatabase.initDatabase()
    callback(null, { statusCode: 200, body: JSON.stringify('Init done') });
  } else if (event['fillTable']) {
    console.log('Fill the tables');
    //fillTable.fillTables(event["fillTable"])
    callback(null, { statusCode: 200, body: JSON.stringify('Fill done') });
  } else if (event['dropTables']) {
    console.log('Drop all tables');
    //dropTables.dropTables()
    callback(null, { statusCode: 200, body: JSON.stringify('Drop done') });
  } else if (event['cleanTables']) {
    console.log('Clean all tables');
    //cleanTables.cleanTables()
    callback(null, { statusCode: 200, body: JSON.stringify('Clean done') });
  } else {
    console.log('Hello world');
    callback(null, { statusCode: 200, body: JSON.stringify('Unknow command') });
  }
};

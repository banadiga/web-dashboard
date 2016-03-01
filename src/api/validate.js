var Validator = require('jsonschema').Validator,
    jsonfile = require('jsonfile'),
    instance = jsonfile.readFileSync(__dirname + '/dashboard.json'),
    schema = jsonfile.readFileSync(__dirname + '/dashboard.schema.json');

var v = new Validator();
var result = v.validate(instance, schema);

console.log(result.valid ? "Finished successful" : "Finished with error(s):");
result.errors.forEach(function (error) {
    console.error('- ' + error.stack);
});

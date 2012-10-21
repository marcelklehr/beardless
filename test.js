var dreamer = require('./index')
  , path = require('path')
  , fs = require('fs')
  , assert = require('assert')
  , testPath = __dirname+'/test/'

var tests = {}
fs.readdirSync(testPath).forEach(function(filename) {
  console.log('loading '+filename+' ...')
  var test = filename.split('.')[0]
    , data = filename.split('.')[1]
  if(!tests[test]) tests[test] = {}
  tests[test][data] = fs.readFileSync(path.join(testPath, filename)).toString()
})

console.log('Testing...\n')

for (var test in tests) {
  var template = new dreamer
    , testData = tests[test]
  
  template.insert(JSON.parse(testData.json))
  
  template.render(testData.html, function(err, out) {
  try{
    if(assert.ifError(err)) return console.log(err);
    
    assert.equal(out, testData.out)
    console.log('Passed test', test)
  }catch(e){console.log(test+' failed: ', e)}
  })
}
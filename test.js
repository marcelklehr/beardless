var beardless = require('./index')
  , path = require('path')
  , fs = require('fs')
  , vows = require('vows')
  , assert = require('assert')
  , testPath = __dirname+'/test/'

var tests = { /* testName => { html=> '...the template ...', json => '...params..', out => '... html output ...' } */}
// load all tests
fs.readdirSync(testPath).forEach(function(filename) {
  var test = filename.split('.')[0]
    , data = filename.split('.')[1]
  if(!tests[test]) tests[test] = {}
  tests[test][data] = fs.readFileSync(path.join(testPath, filename)).toString()
})

var suite = vows.describe('beardless')

for (var test in tests) {
  (function (test) {
    var batch = {}
    batch[test] = {
      topic: function() {
        var template = new beardless
          , testData = tests[test]
        this.testData = testData
        
        try{
          template.insert(JSON.parse(testData.json))
          template.render(testData.html, this.callback)
        }catch(e) {
          this.callback(e)
        }
      },
      'should render the template correctly': function(err, out) {
        assert.ifError(err)
        assert.equal(out, this.testData.out)
      }
    }
    suite.addBatch(batch)
  })(test)
}

suite.run(null, function() {
  (suite.results.broken+suite.results.errored) > 0 && process.exit(1)
})

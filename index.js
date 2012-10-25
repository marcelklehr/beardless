(function() {
  // Patch jsdom/sizzle.js, until they finally switch to NWMatcher
  // We patch this bug: https://github.com/tmpvar/jsdom/issues/523
  var fs = require('fs')
    , patchedSizzle = fs.readFileSync(__dirname+'/sizzle.patched.js')
    , sizzlePath = __dirname+'/node_modules/jsdom/lib/jsdom/selectors/sizzle.js'
  fs.writeFileSync(sizzlePath, patchedSizzle)
})()

var jsdom = require('jsdom')

function beardless() {
  if(!(this instanceof beardless)) return new beardless();
  
  this.html = ""
  this.params = {}
}
module.exports = beardless

beardless.prototype.insert = function(key, value) {
  var object = {}
  if(value) object[key] = value
  else object = key
  if('object' !== typeof object) throw new Error('`key` must be either a String or a hash.');
  
  function insert(dataObj, hash) {
    for(var key in hash) {
      if(!Object.prototype.hasOwnProperty.call(hash, key)) continue;

      if ('undefined' !== dataObj[key]) {
        if(dataObj[key] == hash[key]) continue;
        if(JSON.stringify(dataObj[key]) == JSON.stringify(hash[key])) continue;
        if(Array.isArray(dataObj) && Array.isArray(hash) && !isNaN(key)) {
          dataObj.push(hash[key])
          continue;
        }
      }

      if(Array.isArray(hash[key])) {
        if(!dataObj[key]) dataObj[key] = []
        insert(dataObj[key], hash[key])
        continue;
      }

      if('object' === typeof(hash[key])) {
        if(!dataObj[key]) dataObj[key] = {}
        insert(dataObj[key], hash[key])
        continue;
      }

      if('undefined' !== typeof(hash[key]) && null !== hash[key]) {
        dataObj[key] = hash[key]
        continue;
      }

    }
  }
  
  insert(this.params, object)
}

var _getParam = function(keyPath, params) {
  var object = params
  keyPath.split('.').forEach(function(prop) {
    if(prop == '') return;
    if('undefined' === typeof(object[prop])) throw new Error('Property doesn\'t exist: '+prop+' of '+keyPath)
    object = object[prop]
  })
  return object;
}

beardless.prototype.render = function(html, cb) {
  var beardlessAttr = 'data-template'
  var beardless = this
  this.html = html || this.html
  
  var window = jsdom.jsdom(this.html, null, {features:{QuerySelector: true}}).createWindow()
  var document = window.document
  
  function render(contextNode, params) {
    var element = contextNode
    while((contextNode.hasAttribute && contextNode.hasAttribute(beardlessAttr)) || (element = contextNode.querySelector('['+beardlessAttr+']'))) {
      var keyPath = element.getAttribute(beardlessAttr)
      try {
        var param = _getParam(keyPath, params)
      }catch(e) {
        // if the label references an unexisting param, remove it
        param = false
      }
      
      if(false === param) {
        element.parentNode.removeChild(element)
        continue;
      }
      
      if('string' == typeof param) {
        element.textContent = param
        element.removeAttribute(beardlessAttr)
        continue;
      }
      
      if(Array.isArray(param)) {
        param.forEach(function(arrayItem) {
          var node = element.cloneNode(true)
          element.parentNode.insertBefore(node, element)
          
          // temporarily replace the array with the
          // current Array item, producing reducedParams
          var parentPath = keyPath.split('.')
          var thisParamLabel = parentPath.pop()
          parentPath = parentPath.join('.')
          var reducedParams = JSON.parse(JSON.stringify(params))
          _getParam(parentPath, reducedParams)[thisParamLabel] = arrayItem
          
          render(node, reducedParams)
        })
        element.parentNode.removeChild(element)
        continue;
      }
      
      if('object' == typeof param) {
        element.removeAttribute(beardlessAttr)
        continue;
      }
      
      throw new Error('Unexpected value for '+keyPath)
    }
  }

  render(document, this.params)
  cb && cb(null, document.innerHTML)
}
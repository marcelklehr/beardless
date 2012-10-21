# Beardless - DSL-less html templating engine for node.js

## Why?
Ok, there's mustache, there's ejs, jade and some others I haven't looked at in detail. There are quite good templating engines out there allready, so why do I have to reinvent the wheel?  
Now, let me get this straight from the start: I didn't reinvent the wheel.
 
The majority of the existing templating engines implement some form of DSL. Mustache, for example, with it's nice {{mustache}} syntax, brags about being `logic-less`. But, by forcing you to use variables (and more importantly partial includes!), that you have to explicitly put somewhere in your template, you do end up squashing logic into your templates that you would want to have in your controller. This is critical, if you want to implement some plugin system, where plugins should be able to extend the user interface, because your templates limit the ability of plugins to extend the UI. You don't want this!
Another problem, is the use of DSLs itself. By implementing their own meta-language that is incompatible to the HTML spec and other templating languages, todays templating engines make a designers life harder, having to learn and understand the different reincarnations of templating languages.

I believe, the very idea of a 'templating language' is wrong.

That's why I created **beardless**.  
Inspired by [plates](https://github.com/flatiron/plates) and utilizing [jsdom](https://github.com/tmpvar/jsdom), beardless lets you write your templates in pure, beardless HTML, while still providing all features you'd expect from an advanced templating engine (well, not quite yet, but stay tuned).

## Example

Your params:
```js
{ title: "The template engine site"
, post:
  { title: "Next generation templating: Start shaving!"
  , text: "TL;DR You should really check out beardless!"
  , comments:
    [ {text: "Hey cool!", author:"mike"}
    , {text: "Really gotta check that out...", author:"steve"}  ]
  }
}
```

Your template:
```html
<html>
  <head>
  <title data-template="title"></title>
  </head>
  <body>
    <h1 data-template="post.title"></h1>
    <p data-template="post.text"></p>
    <div>
      <div data-template="post.comments" class="comment">
        <p data-template="post.comments.text"></p>
        <p data-template="post.comments.author"></p>
      </div>
    </div>
  </body>
</html>
```

Output:
```html
<html>
  <head>
  <title>The template engine site</title>
  </head>
  <body>
    <h1>Next generation templating: Start shaving!</h1>
    <p>TL;DR You should really check out beardless!</p>
    <div>
      <div class="comment">
        <p>Hey cool!</p>
        <p>mike</p>
      </div>
      <div class="comment">
        <p>Really gotta check that out...</p>
        <p>steve</p>
      </div>
    </div>
  </body>
</html>
```

## Installation

## Roadmap

 * implement partial include functionality
 * allow people to modify attributes

# Legal
MIT LICENSE

# Asset Compiler
# --------------
# Transforms lovely languages into ancient text

fs = require('fs')
util = require('util')
uglifyjs = require('uglify-js')
jade = require('jade')

templates = require('./templates.coffee')

exports.init = ->
  compile.run()
  pack.run()
  clean()

global =
  dir: __dirname + '/_assets/'
compile =
  run: ->
    for i in languages
  languages:
    jade: (input_file_name, cb) ->
      input = "#{SS.root}/app/views/#{input_file_name}"

      # Replace the 'SocketStream' magic keyword within the Jade file with all the asset inclusions
      locals = {locals: {SocketStream: headersAndTemplates().join('')}}

      SS.libs.jade.renderFile input, locals, (err, html) ->
        if err
          e = new Error(err)
          e.name = "Unable to compile Jade file #{file} to HTML"
          throw e if SS.config.throw_errors
        cb {output: html, content_type: 'text/html'}

    html: (path, cb) ->
      html = fs.readFileSync "#{SS.root}/app/views/#{path}", 'utf8'

      # Replace the 'SocketStream' magic attribute within the HTML file with all the asset inclusions
      html = html.replace '<SocketStream>', headersAndTemplates().join('')

      cb {output: html, content_type: 'text/html'}


    coffee: (path, cb) ->
      input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
      try
        file_ary = path.split('.')[0].split('/')
        input = namespaceClientFile(input, file_ary, 'coffee')
        js = SS.libs.coffee.compile(input)
        cb {output: js, content_type: 'text/javascript; charset=utf-8'}
      catch err
        e = new Error(err)
        e.name = "Unable to compile CoffeeScript file #{path} to JS"
        throw e if SS.config.throw_errors

    js: (path, cb) ->
      js = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
      file_ary = path.split('.')[0].split('/')
      js = namespaceClientFile(js, file_ary, 'js')
      cb {output: js, content_type: 'text/javascript; charset=utf-8'}

    styl: (input_file_name, cb) ->
      dir = "app/css"
      path = "#{dir}/#{input_file_name}"
      input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
      SS.libs.stylus.render input, {filename: input_file_name, paths: [dir], compress: SS.config.pack_assets}, (err, css) ->
        if err
          e = Error(err)
          e.name = "Unable to compile Stylus file #{path} to CSS"
          throw e if SS.config.throw_errors
        cb {output: css, content_type: 'text/css'}

file_utils.fileList = (path, first_file = null) ->
  try
    files = fs.readdirSync(path).filter((file) -> !file.match(/(^_|^\.)/)).sort()
    if first_file and files.include(first_file)
      files = files.delete(first_file)
      files.unshift(first_file)
    files
  catch e
    throw e unless e.code == 'ENOENT' # dir missing
    []

file_utils.concatFiles = (path) ->
  files = @fileList path
  files.map (file_name) ->
    util.log "  Concatenating file #{file_name}"
    output = fs.readFileSync("#{path}/#{file_name}", 'utf8')
    if file_name.match(/\.coffee$/i)
      util.log "  Compiling #{file_name} into JS..."
      try
        output = SS.libs.coffee.compile(output)
      catch e
        util.log "\x1B[1;31mError: Unable to compile CoffeeScript file #{path} to JS\x1B[0m"
        throw new Error(e)
    output = exports.minifyJS(file_name, output) if file_name.match(/\.(coffee|js)/) and !file_name.match(/\.min/)
    output += ';' # Ensures the file ends with a semicolon. Many libs don't and would otherwise break when concatenated
    output
  .join("\n")

exports.minifyJS = (file_name, orig_code) ->
  formatKb = (size) -> "#{Math.round(size * 1000) / 1000} KB"
  orig_size = (orig_code.length / 1024)
  jsp = SS.libs.uglifyjs.parser
  pro = SS.libs.uglifyjs.uglify
  ast = jsp.parse(orig_code)
  #ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  minified = pro.gen_code(ast)
  min_size = (minified.length / 1024)
  util.log("  Minified #{file_name} from #{formatKb(orig_size)} to #{formatKb(min_size)}")
  minified

# When serving client files app.coffee or app.js must always be loaded first, so we're ensuring this here for now.
# This is only temporary as big changes are coming to the way we serve and organise client files
exports.ensureCorrectOrder = (files) ->
  matches = files.filter (path) ->
    file = path.split('/').reverse()[0]
    file.split('.')[0] == 'app'
  first_file = matches[0]
  if files.include(first_file)
    files = files.delete(first_file)
    files.unshift(first_file)
  files

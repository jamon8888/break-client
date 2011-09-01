# Asset Compiler
# --------------
# Transforms lovely languages into ancient text

fs = require('fs')
util = require('util')

templates = require('./templates.coffee')

utils = require('./utils.coffee')
file_utils = require('../utils/file.js')

exports.init = (@assets) ->
  @

exports.compile =

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

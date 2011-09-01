#
# DB Setup
#

geohash = require('ngeohash')
cradle = require("cradle")
async = require('async')
cradle.setup
  host: "localhost"
  port: 5984

_createdb = (dbname) ->
  db = cclient.database(dbname)
  db.exists (err, exists) ->
    db.create()  unless exists
  db

cradle_error = (err, res) ->
  console.log err  if err

cclient = new (cradle.Connection)
DB = _createdb("break")

#
# Update geohashes
#

update_geo = (db) ->
  db.all (err, doc) ->
    console.log(doc)
    #async.until(
      #-> i > doc.length + 1
      #(a) ->
        #type = doc[i].id.split("/")[1].slice(0, -1)
        #if type is 'venue' and doc[i].id.indexOf("_design") is -1
          #id = doc[i].id.replace(/\//g, "%2F")
          #db.get id, (err, data) ->
            #console.log(id)
            #unless err
              #if data.location isnt undefined and data.location isnt null
                #console.log(data.location)
                #data.location =
                  #lat: data.location[0]
                  #lon: data.location[1]
                #if data.location.lat is null or data.location.lon is null then data.location.geohash = null
                #else data.location.geohash = geohash.encode(data.location.lat, data.location.lon)
                ##id = data.id
                ##console.log('id',id)
                ##console.log('location',location)
                ##console.log('geohash',location.geohash)
                ##db.save(id, data, (err, d) ->
                  ###console.log('id',id)
                  ###console.log('err', err)
                  ##console.log('result', d)
                ##)
            #i++
            #a()
        #else
          #console.log(i)
          #i++
          #a()
      #, (err) ->
        #console.log(err)
        #console.log('finished')
    #)


update_geo DB

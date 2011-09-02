#----------------#
# Break Couchapp #
#----------------#

#backbone connector
Backbone.couch_connector.config.db_name = "break"
Backbone.couch_connector.config.ddoc_name = "couchbreak"
Backbone.couch_connector.config.view_name = "collection"
Backbone.couch_connector.config.global_changes = false
#mustache-like templating
_.templateSettings = interpolate: /\{\{(.+?)\}\}/g

#
# Main App
# TODO - remove jquery mobile stuff
#

#this should hold some utility/state methods
app =
  activePage: ->
    $(".ui-page-active")

  reapplyStyles: (el) ->
    el.find('ul[data-role]').listview()
    el.find('div[data-role="fieldcontain"]').fieldcontain()
    el.find('button[data-role="button"]').button()
    el.find('input,textarea').textinput()
    el.page()

  redirectTo: (page) ->
    #$.mobile.changePage page
    log('1')

  goBack: ->
    log('1')
    #$.historyBack()

#
# Venue Model
#

class Venue extends Backbone.Model
  type: 'venue',
  url: => '/venues/' + @get('id')
  defaults:
    type: 'venue'
    created: new Date().getTime()
    updated: new Date().getTime()
    uuid: null
    status: 0
    title: null
    text:
      fr: null
      en: null
    images: null
    links: null
    location: null
    email: null
    address: null
    website: null
    category: null
  tags: []
  getUrl: ->
    @url
  getType: ->
    @get('type')
  getTitle: ->
    @get('title')
  getText: (lang) ->
    text = @get('text')
    if lang then return text[lang]
    else return text
  getLocation: ->
    @get('location')
  getEmail: ->
    @get('email')
  getAddress: ->
    @get('address')
  getWebsite: ->
    @get('website')
  getCreated: ->
    # TODO - check if it works
    new Date(@get('date'))
  getUpdated: ->
    # TODO - check if it works
    new Date(@get('date'))
  getStatus: ->
    @get('status')
  getImages: (num) ->
    images = @get('images')
    if num then return _.first(images, num)
    else return _.first(images)
  getLinks: (num) ->
    links = @get('links')
    if num then return _.first(links, num)
    else return _.first(links)
  getCategory: ->
    @get('category')
  getTags: ->
    _.pluck(@tags, 'title')
  getEvents: ->
    _.pluck(@venues, 'title')

#
# Event Model
#

class Event extends Backbone.Model
  type: 'event'
  url: => '/events/' + @get('id')
  defaults:
    type: 'event'
    created: new Date().getTime()
    updated: new Date().getTime()
    status: 0
    title: null
    text:
      fr: null
      en: null
    date: null
    images: null
    links: null
    category: null
  tags: []
  venues: []
  getUrl: ->
    @url
  getType: ->
    @get('type')
  getTitle: ->
    @get('title')
  getText: (lang) ->
    text = @get('text')
    if lang then return text[lang]
    else return text
  getCreated: ->
    # TODO - check if it works
    new Date(@get('date'))
  getUpdated: ->
    # TODO - check if it works
    new Date(@get('date'))
  getStatus: ->
    @get('status')
  getImages: (num) ->
    images = @get('images')
    if num then return _.first(images, num)
    else return _.first(images)
  getLinks: (num) ->
    links = @get('links')
    if num then return _.first(links, num)
    else return _.first(links)
  getCategory: ->
    @get('category')
  getTags: ->
    _.pluck(@tags, 'title')
  getVenues: ->
    _.pluck(@venues, 'title')

#
# Venue Collection
#

class Venues extends Backbone.Collection
  type: 'venues'
  model: Venue
  url: '/venues'
  # TODO - since backbone-couchdb has been hacked, work on the db property
  #db:
    #view: "venues"
    #changes: false
    #filter: Backbone.couch_connector.config.ddoc_name + "/venues"
  #comparator: (comment) ->
    #comment.get "date"

#
# Event Collection
#

class Events extends Backbone.Collection
  type: 'events'
  model: Event
  url: '/events'
  # TODO - Same as above

# TODO - Remove, as this is a test
class VenuesNearby extends Venues
  db:
    view: 'location'
    #keys: null
    #start_key: null
    #end_key: null
    #limit: null
    #skip: null
    #group: false
    #group_level: null
    #include_docs: null

# TODO - Remove, as this is a test
class VenuesHere extends VenuesNearby
  type: 'venuesHere'
  initialize: ->
    @db.limit = 20
    @db.startkey = 'gbwaaaaaa'
    @db.endkey = 'gzwzzzzzz'
    @db.include_docs = true

#
# Venue View
#

class VenueView extends Backbone.View
# TODO - Work on this

#
# Base View
# - used mainly for global jquery bindings
#

class BaseView extends Backbone.View
  el: 'body'
  initialize: ->
    @render()

  render: ->
    #bind click/touch events to the main buttons
    $('li#nav-map > .inner').bind 'click touchstart', ->
      $('#navbar .button').removeClass('active')
      $(@).parent().addClass('active')
      app.router.map()
    $('li#nav-favorites> .inner').bind 'click touchstart', ->
      $('#navbar .button').removeClass('active')
      $(@).parent().addClass('active')
      app.router.favorites()
    $('li#nav-events > .inner').bind 'click touchstart', ->
      $('#navbar .button').removeClass('active')
      $(@).parent().toggleClass('active')
      #toggle open the submenu
      $('ul#events-menu').toggle()
    #remove active class and hide submenus when clicking on another button
    $('#navbar .menu li').bind 'click touchstart', ->
      $('#navbar .button').removeClass('active')
      parent = $(@).parent()
      parent.hide()

#
# Home View
#

class HomeView extends Backbone.View
  id: 'home'
  className: 'content'
  template : _.template($("#template-home").html()),
  initialize: ->
    # TODO - remove this test
    @venues = new VenuesHere
    @venues.fetch success: (collection) =>
      @_mainView = new List
        collection : @venues
        childConstructor : Element
        childTag : 'div'
        childClass: 'venue'
        childTemplate: 'template-venue'
      @render()

  render: =>
    area = $('#page > .inner')
    #area.children().hide()
    #content = @model.toJSON()
    #area.append($(@el).html(@template(content)))

    $el = $(@el)
    $el.empty()
    #$('#left').html($el.html(@template.tmpl()))
    #@_mainView.el = @$('.listVenues')
    #@_mainView.render()
    area.append($el.html(@_mainView.render().el))

#
# Venue List View
#

#class VenueListView extends Backbone.View
  #tagName : "li"
  #className: 'venue'
  #template : _.template($("#template-venue").html()),
  ##initialize: ->
    ##@venues = new VenuesHere
    ##venues.fetch()
    ##console.log(venues)

  #render: =>
    #content = @model.toJSON()
    #$(@el).html(@template(content))
    #@

#
# List
# - generic list
#

class List extends Backbone.View
  initialize: (options) ->
    _(this).bindAll "add", "remove"
    throw "no child view constructor provided" unless options.childConstructor
    throw "no child view tag name provided" unless options.childTag
    throw "no child view class provided" unless options.childClass
    throw "no child view template provided" unless options.childTemplate
    @_childConstructor = options.childConstructor
    @_childTag = options.childTag
    @_childClass = options.childClass
    @_childTemplate = options.childTemplate
    @_childViews = []
    @collection.each @add
    @collection.bind "add", @add
    @collection.bind "remove", @remove

  # TODO - remove? shouldn't be necessary as the app won't be dynamic
  add: (model) ->
    childView = new @_childConstructor
      tagName: @_childTag
      className: @_childClass
      template: 'template-venue'
      model: model
    @_childViews.push childView
    $(@el).append childView.render().el if @_rendered

  # TODO - remove? shouldn't be necessary as the app won't be dynamic
  remove: (model) ->
    viewToRemove = _(@_childViews).select((cv) ->
      cv.model == model
    )[0]
    @_childViews = _(@_childViews).without(viewToRemove)
    $(viewToRemove.el).remove()  if @_rendered

  render: ->
    #that = @
    $el = $(@el)
    @_rendered = true
    $el.empty()
    #TODO - should be consistent with 'for .. in' instead of _.each (faster benchmarks)
    for view in @_childViews
      $el.append view.render().el
    #_(@_childViews).each (childView) ->
      #$(that.el).append childView.render().el
    @

#
# Element
# - single element in a list
#

class Element extends Backbone.View
  initialize: (options) ->
    @template =  _.template($('#' + options.template).html())

  render: ->
    content = @model.toJSON()
    #console.log('content',content)
    $el = $(@el)
    $el.html(@template(content))
    @

#
# Map View
#

class MapView extends Backbone.View
  id: 'map'
  className: 'content'
  initialize: ->
    @render()

  render: ->
    area = $('#page > .inner')
    $('.content').hide()
    $(@el).css('height', window.innerHeight - 100)
    area.append(@el)
    initMap()

  onLocationFound = (e) ->
    radius = e.accuracy / 2
    marker = new L.Marker(e.latlng)
    map.addLayer(marker)
    marker.bindPopup("You are within " + radius + " meters from this point").openPopup()
    circle = new L.Circle(e.latlng, radius)
    map.addLayer(circle)

  onLocationError = (e) ->
    alert(e.message)

  initMap = (e) ->
    map = new L.Map('map')
    # TODO - API key doesn't work, had to steal cloudmade's demo api key
    cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png'
    #cloudmadeUrl = 'http://{s}.tile.cloudmade.com/09e55b617c6847a8b0bf6b769749217b/997/256/{z}/{x}/{y}.png'

    #Leaflet demo code
    cloudmadeAttribution = 'Map data © 2011 OpenStreetMap contributors, Imagery © 2011 CloudMade'
    cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution})
    paris = new L.LatLng(48.8566,2.3508); #// geographical point (longitude and latitude)
    map.setView(paris, 13).addLayer(cloudmade)
    #map.addLayer(cloudmade)
    #map.locateAndSetView(29)
    #map.on('locationfound', @onLocationFound)
    #map.on('locationerror', @onLocationError)
    MyIcon = L.Icon.extend
      iconUrl: 'http://leaflet.cloudmade.com/dist/images/marker.png',
    icon = new MyIcon()

#
# Calendar View
# TODO - not sure what this was for
#

class Calendar extends Backbone.Collection
  type: 'calendar'
  model: Events
  url: '/calendar'
  db:
    view: 'date'
    #start_key: '2005-01-06T11:00:00.000'
    #start_key: '2006-01-06T11:00:00.000'

calendar = new Calendar
#calendar.fetch()
class CalendarView extends Backbone.View
  constructor: ->
    super
    _.bind(@render, monobjet)
    @el = app.activePage()
    # Watch for changes to the model and redraw the view
    @model.bind 'change', @render

    # Draw the view
    @render()

  render: =>
    # Set the name of the page
    @el.find('h1').text(@model.getName())

    # Render the content
    @el.find('.ui-content').html(@template({venue : @model}))

#
# Router
#

class Router extends Backbone.Router
  routes :
    "home"  : "home"
    "map"  : "map"
    "favorites"  : "favorites"
    "events"  : "events"
    "search"  : "search"

  constructor: ->
    super
    @_views = {}

  base : ->
    @_views['base'] ||= new BaseView

  home : ->
    console.log('home')
    @_views['home'] ||= new HomeView

  favorites : ->
    console.log('favorites')
    #@_views['favorites'] ||= new FavoritesView

  events: ->
    console.log('events')
    #@_views['events'] ||= new EventsView

  map : ->
    console.log('map')
    @_views['map'] ||= new MapView

  search : ->
    console.log('search')
    #@_views['search'] ||= new SearchView


app.router = new Router()

#
# Bootstrap
#

$(document).ready ->
  Backbone.history.start()
  #fire base view
  app.router.base()
  #fire home view
  app.router.home()
  #initialize collections
  venues = new Venues
  events = new Events

    ##SS.server.app.readGeo (data) ->
    #counter = 0
    #marker = []
    #_.each data, (d) ->
      ##if d[2] is not null and d[3] is not null
      #lon = Number(d[2])
      #markerLocation = new L.LatLng(d[3], lon)
      #marker[counter] = new L.Marker(markerLocation, {icon: icon})
      #marker[counter].bindPopup(d[1])
      #map.addLayer(marker[counter])
      #counter++

#globalize app
@app = window.app = app

#
# TODO
#

#filters:
  #by kewords
  #by category
  #by tag?
  #by venue

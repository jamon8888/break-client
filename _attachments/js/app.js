(function() {
  var BaseView, Calendar, CalendarView, Element, Event, Events, HomeView, List, MapView, Router, Venue, VenueView, Venues, VenuesHere, VenuesNearby, app, calendar, log;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  log = function(a) {
    return console.log(a);
  };
  Backbone.couch_connector.config.db_name = "break";
  Backbone.couch_connector.config.ddoc_name = "couchbreak";
  Backbone.couch_connector.config.view_name = "collection";
  Backbone.couch_connector.config.global_changes = false;
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };
  app = {
    activePage: function() {
      return $(".ui-page-active");
    },
    reapplyStyles: function(el) {
      el.find('ul[data-role]').listview();
      el.find('div[data-role="fieldcontain"]').fieldcontain();
      el.find('button[data-role="button"]').button();
      el.find('input,textarea').textinput();
      return el.page();
    },
    redirectTo: function(page) {
      return log('1');
    },
    goBack: function() {
      return log('1');
    }
  };
  Venue = (function() {
    __extends(Venue, Backbone.Model);
    function Venue() {
      this.url = __bind(this.url, this);
      Venue.__super__.constructor.apply(this, arguments);
    }
    Venue.prototype.type = 'venue';
    Venue.prototype.url = function() {
      return '/venues/' + this.get('id');
    };
    Venue.prototype.defaults = {
      type: 'venue',
      created: new Date().getTime(),
      updated: new Date().getTime(),
      uuid: null,
      status: 0,
      title: null,
      text: {
        fr: null,
        en: null
      },
      images: null,
      links: null,
      location: null,
      email: null,
      address: null,
      website: null,
      category: null
    };
    Venue.prototype.tags = [];
    Venue.prototype.artists = [];
    Venue.prototype.getUrl = function() {
      return this.url;
    };
    Venue.prototype.getType = function() {
      return this.get('type');
    };
    Venue.prototype.getTitle = function() {
      return this.get('title');
    };
    Venue.prototype.getText = function(lang) {
      var text;
      text = this.get('text');
      if (lang) {
        return text[lang];
      } else {
        return text;
      }
    };
    Venue.prototype.getLocation = function() {
      return this.get('location');
    };
    Venue.prototype.getEmail = function() {
      return this.get('email');
    };
    Venue.prototype.getAddress = function() {
      return this.get('address');
    };
    Venue.prototype.getWebsite = function() {
      return this.get('website');
    };
    Venue.prototype.getCreated = function() {
      return new Date(this.get('date'));
    };
    Venue.prototype.getUpdated = function() {
      return new Date(this.get('date'));
    };
    Venue.prototype.getStatus = function() {
      return this.get('status');
    };
    Venue.prototype.getImages = function(num) {
      var images;
      images = this.get('images');
      if (num) {
        return _.first(images, num);
      } else {
        return _.first(images);
      }
    };
    Venue.prototype.getLinks = function(num) {
      var links;
      links = this.get('links');
      if (num) {
        return _.first(links, num);
      } else {
        return _.first(links);
      }
    };
    Venue.prototype.getCategory = function() {
      return this.get('category');
    };
    Venue.prototype.getTags = function() {
      return _.pluck(this.tags, 'title');
    };
    Venue.prototype.getEvents = function() {
      return _.pluck(this.venues, 'title');
    };
    return Venue;
  })();
  Event = (function() {
    __extends(Event, Backbone.Model);
    function Event() {
      this.url = __bind(this.url, this);
      Event.__super__.constructor.apply(this, arguments);
    }
    Event.prototype.type = 'event';
    Event.prototype.url = function() {
      return '/events/' + this.get('id');
    };
    Event.prototype.defaults = {
      type: 'event',
      created: new Date().getTime(),
      updated: new Date().getTime(),
      status: 0,
      title: null,
      text: {
        fr: null,
        en: null
      },
      date: null,
      images: null,
      links: null,
      category: null
    };
    Event.prototype.tags = [];
    Event.prototype.venues = [];
    Event.prototype.getUrl = function() {
      return this.url;
    };
    Event.prototype.getType = function() {
      return this.get('type');
    };
    Event.prototype.getTitle = function() {
      return this.get('title');
    };
    Event.prototype.getText = function(lang) {
      var text;
      text = this.get('text');
      if (lang) {
        return text[lang];
      } else {
        return text;
      }
    };
    Event.prototype.getCreated = function() {
      return new Date(this.get('date'));
    };
    Event.prototype.getUpdated = function() {
      return new Date(this.get('date'));
    };
    Event.prototype.getStatus = function() {
      return this.get('status');
    };
    Event.prototype.getImages = function(num) {
      var images;
      images = this.get('images');
      if (num) {
        return _.first(images, num);
      } else {
        return _.first(images);
      }
    };
    Event.prototype.getLinks = function(num) {
      var links;
      links = this.get('links');
      if (num) {
        return _.first(links, num);
      } else {
        return _.first(links);
      }
    };
    Event.prototype.getCategory = function() {
      return this.get('category');
    };
    Event.prototype.getTags = function() {
      return _.pluck(this.tags, 'title');
    };
    Event.prototype.getVenues = function() {
      return _.pluck(this.venues, 'title');
    };
    return Event;
  })();
  Venues = (function() {
    __extends(Venues, Backbone.Collection);
    function Venues() {
      Venues.__super__.constructor.apply(this, arguments);
    }
    Venues.prototype.type = 'venues';
    Venues.prototype.model = Venue;
    Venues.prototype.url = '/venues';
    return Venues;
  })();
  Events = (function() {
    __extends(Events, Backbone.Collection);
    function Events() {
      Events.__super__.constructor.apply(this, arguments);
    }
    Events.prototype.type = 'events';
    Events.prototype.model = Event;
    Events.prototype.url = '/events';
    return Events;
  })();
  VenuesNearby = (function() {
    __extends(VenuesNearby, Venues);
    function VenuesNearby() {
      VenuesNearby.__super__.constructor.apply(this, arguments);
    }
    VenuesNearby.prototype.db = {
      view: 'location'
    };
    return VenuesNearby;
  })();
  VenuesHere = (function() {
    __extends(VenuesHere, VenuesNearby);
    function VenuesHere() {
      VenuesHere.__super__.constructor.apply(this, arguments);
    }
    VenuesHere.prototype.type = 'venuesHere';
    VenuesHere.prototype.initialize = function() {
      this.db.limit = 20;
      this.db.startkey = 'gbwaaaaaa';
      this.db.endkey = 'gzwzzzzzz';
      return this.db.include_docs = true;
    };
    return VenuesHere;
  })();
  VenueView = (function() {
    __extends(VenueView, Backbone.View);
    function VenueView() {
      VenueView.__super__.constructor.apply(this, arguments);
    }
    return VenueView;
  })();
  BaseView = (function() {
    __extends(BaseView, Backbone.View);
    function BaseView() {
      BaseView.__super__.constructor.apply(this, arguments);
    }
    BaseView.prototype.el = 'body';
    BaseView.prototype.initialize = function() {
      return this.render();
    };
    BaseView.prototype.render = function() {
      $('li#nav-map > .inner').bind('click touchstart', function() {
        $('#navbar .button').removeClass('active');
        $(this).parent().addClass('active');
        return app.router.map();
      });
      $('li#nav-favorites> .inner').bind('click touchstart', function() {
        $('#navbar .button').removeClass('active');
        $(this).parent().addClass('active');
        return app.router.favorites();
      });
      $('li#nav-events > .inner').bind('click touchstart', function() {
        $('#navbar .button').removeClass('active');
        $(this).parent().toggleClass('active');
        return $('ul#events-menu').toggle();
      });
      return $('#navbar .menu li').bind('click touchstart', function() {
        var parent;
        $('#navbar .button').removeClass('active');
        parent = $(this).parent();
        return parent.hide();
      });
    };
    return BaseView;
  })();
  HomeView = (function() {
    __extends(HomeView, Backbone.View);
    function HomeView() {
      this.render = __bind(this.render, this);
      HomeView.__super__.constructor.apply(this, arguments);
    }
    HomeView.prototype.id = 'home';
    HomeView.prototype.className = 'content';
    HomeView.prototype.template = _.template($("#template-home").html());
    HomeView.prototype.initialize = function() {
      this.venues = new VenuesHere;
      return this.venues.fetch({
        success: __bind(function(collection) {
          this._mainView = new List({
            collection: this.venues,
            childConstructor: Element,
            childTag: 'div',
            childClass: 'venue',
            childTemplate: 'template-venue'
          });
          return this.render();
        }, this)
      });
    };
    HomeView.prototype.render = function() {
      var $el, area;
      area = $('#page > .inner');
      $el = $(this.el);
      $el.empty();
      return area.append($el.html(this._mainView.render().el));
    };
    return HomeView;
  })();
  List = (function() {
    __extends(List, Backbone.View);
    function List() {
      List.__super__.constructor.apply(this, arguments);
    }
    List.prototype.initialize = function(options) {
      _(this).bindAll("add", "remove");
      if (!options.childConstructor) {
        throw "no child view constructor provided";
      }
      if (!options.childTag) {
        throw "no child view tag name provided";
      }
      if (!options.childClass) {
        throw "no child view class provided";
      }
      if (!options.childTemplate) {
        throw "no child view template provided";
      }
      this._childConstructor = options.childConstructor;
      this._childTag = options.childTag;
      this._childClass = options.childClass;
      this._childTemplate = options.childTemplate;
      this._childViews = [];
      this.collection.each(this.add);
      this.collection.bind("add", this.add);
      return this.collection.bind("remove", this.remove);
    };
    List.prototype.add = function(model) {
      var childView;
      childView = new this._childConstructor({
        tagName: this._childTag,
        className: this._childClass,
        template: 'template-venue',
        model: model
      });
      this._childViews.push(childView);
      if (this._rendered) {
        return $(this.el).append(childView.render().el);
      }
    };
    List.prototype.remove = function(model) {
      var viewToRemove;
      viewToRemove = _(this._childViews).select(function(cv) {
        return cv.model === model;
      })[0];
      this._childViews = _(this._childViews).without(viewToRemove);
      if (this._rendered) {
        return $(viewToRemove.el).remove();
      }
    };
    List.prototype.render = function() {
      var that;
      that = this;
      this._rendered = true;
      $(this.el).empty();
      _(this._childViews).each(function(childView) {
        return $(that.el).append(childView.render().el);
      });
      return this;
    };
    return List;
  })();
  Element = (function() {
    __extends(Element, Backbone.View);
    function Element() {
      Element.__super__.constructor.apply(this, arguments);
    }
    Element.prototype.initialize = function(options) {
      return this.template = _.template($('#' + options.template).html());
    };
    Element.prototype.render = function() {
      var $el, content;
      content = this.model.toJSON();
      console.log('content', content);
      $el = $(this.el);
      $el.html(this.template(content));
      return this;
    };
    return Element;
  })();
  MapView = (function() {
    var initMap, onLocationError, onLocationFound;
    __extends(MapView, Backbone.View);
    function MapView() {
      MapView.__super__.constructor.apply(this, arguments);
    }
    MapView.prototype.id = 'map';
    MapView.prototype.className = 'content';
    MapView.prototype.initialize = function() {
      return this.render();
    };
    MapView.prototype.render = function() {
      var area;
      area = $('#page > .inner');
      $('.content').hide();
      $(this.el).css('height', window.innerHeight - 100);
      area.append(this.el);
      return initMap();
    };
    onLocationFound = function(e) {
      var circle, marker, radius;
      radius = e.accuracy / 2;
      marker = new L.Marker(e.latlng);
      map.addLayer(marker);
      marker.bindPopup("You are within " + radius + " meters from this point").openPopup();
      circle = new L.Circle(e.latlng, radius);
      return map.addLayer(circle);
    };
    onLocationError = function(e) {
      return alert(e.message);
    };
    initMap = function(e) {
      var MyIcon, cloudmade, cloudmadeAttribution, cloudmadeUrl, icon, map, paris;
      map = new L.Map('map');
      cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
      cloudmadeAttribution = 'Map data © 2011 OpenStreetMap contributors, Imagery © 2011 CloudMade';
      cloudmade = new L.TileLayer(cloudmadeUrl, {
        maxZoom: 18,
        attribution: cloudmadeAttribution
      });
      paris = new L.LatLng(48.8566, 2.3508);
      map.setView(paris, 13).addLayer(cloudmade);
      MyIcon = L.Icon.extend({
        iconUrl: 'http://leaflet.cloudmade.com/dist/images/marker.png'
      });
      return icon = new MyIcon();
    };
    return MapView;
  })();
  Router = (function() {
    __extends(Router, Backbone.Router);
    Router.prototype.routes = {
      "home": "home",
      "map": "map",
      "favorites": "favorites",
      "events": "events",
      "search": "search"
    };
    function Router() {
      Router.__super__.constructor.apply(this, arguments);
      this._views = {};
    }
    Router.prototype.base = function() {
      var _base;
      return (_base = this._views)['base'] || (_base['base'] = new BaseView);
    };
    Router.prototype.home = function() {
      var _base;
      console.log('a');
      return (_base = this._views)['home'] || (_base['home'] = new HomeView);
    };
    Router.prototype.favorites = function() {
      return console.log('a');
    };
    Router.prototype.events = function() {
      return console.log('a');
    };
    Router.prototype.map = function() {
      var _base;
      console.log('mapa');
      return (_base = this._views)['map'] || (_base['map'] = new MapView);
    };
    Router.prototype.search = function() {
      return console.log('a');
    };
    return Router;
  })();
  app.router = new Router();
  $(document).ready(function() {
    var events, venues;
    Backbone.history.start();
    app.router.base();
    app.router.home();
    venues = new Venues;
    events = new Events;
    return console.log(Backbone.couch_connector);
  });
  this.app = app;
  Calendar = (function() {
    __extends(Calendar, Backbone.Collection);
    function Calendar() {
      Calendar.__super__.constructor.apply(this, arguments);
    }
    Calendar.prototype.type = 'calendar';
    Calendar.prototype.model = Events;
    Calendar.prototype.url = '/calendar';
    Calendar.prototype.db = {
      view: 'date'
    };
    return Calendar;
  })();
  calendar = new Calendar;
  CalendarView = (function() {
    __extends(CalendarView, Backbone.View);
    function CalendarView() {
      this.render = __bind(this.render, this);      CalendarView.__super__.constructor.apply(this, arguments);
      _.bind(this.render, monobjet);
      this.el = app.activePage();
      this.model.bind('change', this.render);
      this.render();
    }
    CalendarView.prototype.render = function() {
      this.el.find('h1').text(this.model.getName());
      this.el.find('.ui-content').html(this.template({
        venue: this.model
      }));
      return app.reapplyStyles(this.el);
    };
    return CalendarView;
  })();
}).call(this);

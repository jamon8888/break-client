$ ->
  Backbone.couch_connector.config.db_name = "couchbreak"
  Backbone.couch_connector.config.ddoc_name = "couchbreak"
  Backbone.couch_connector.config.global_changes = false
  _.templateSettings = interpolate: /\{\{(.+?)\}\}/g
  UserModel = Backbone.Model.extend(defaults: name: "Anonymus")
  window.CurrentUser = new UserModel()
  MessageModel = Backbone.Model.extend(initialize: ->
    @set date: new Date().getTime()  unless @get("date")
  )
  MessagesList = Backbone.Collection.extend(
    db:
      view: "messages"
      changes: true
      filter: Backbone.couch_connector.config.ddoc_name + "/messages"

    url: "/messages"
    model: MessageModel
    comparator: (comment) ->
      comment.get "date"
  )
  Messages = new MessagesList()
  PrivateMessage = MessageModel.extend({})
  PrivateMessageList = Backbone.Collection.extend(
    db:
      view: "none__"
      changes: false
      filter: Backbone.couch_connector.config.ddoc_name + "/private_messages"

    url: "/private_messages"
    model: PrivateMessage
  )
  PrivateMessages = new PrivateMessageList()
  InputView = Backbone.View.extend(
    el: $("#input")
    regex: /@(\w+)/
    events:
      "click #send": "onSubmit"
      "keypress #message": "keypress"

    initialize: ->
      _.bindAll this, "onSubmit", "nameChanged", "keypress"
      CurrentUser.bind "change:name", @nameChanged

    onSubmit: ->
      message = $("#message").val()
      message = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
      if message.length > 0
        executed = @regex.exec(message)
        if executed?
          PrivateMessages.create
            from: CurrentUser.get("name")
            to: executed[1]
            message: message.replace(executed[0], "")
        else
          Messages.create
            from: CurrentUser.get("name")
            message: message
      $("#message").val ""

    nameChanged: ->
      $("#name").text CurrentUser.get("name")

    keypress: (ev) ->
      @onSubmit()  if ev.keyCode == 13

    fillAndFocus: (text) ->
      $("#message").val(text).focus()
  )
  EntryView = Backbone.View.extend(
    tagName: "li"
    template: _.template($("#entry-template").html())
    events: "click .delete": "delete_me"
    initialize: ->
      _.bindAll this, "render", "delete_me", "delete_row"
      @model.bind "change", @render
      @model.bind "remove", @delete_row

    render: ->
      content = @model.toJSON()
      $(@el).html @template(content)
      this

    delete_me: ->
      if CurrentUser.get("name") == @model.get("from")
        @model.destroy()
        @delete_row()
      else
        alert "You can only delete your own messages!"

    delete_row: ->
      $(@el).remove()
  )
  PrivateEntryView = EntryView.extend(
    className: "private"
    template: _.template($("#private-entry-template").html())
  )
  MessagesList = Backbone.View.extend(
    el: $("#messages")
    initialize: ->
      _.bindAll this, "reseted", "addRow", "addPrivateRow"
      Messages.bind "reset", @reseted
      Messages.bind "add", @addRow
      PrivateMessages.bind "add", @addPrivateRow

    addRow: (comment) ->
      view = new EntryView(model: comment)
      rendered = view.render().el
      @el.append rendered

    addPrivateRow: (private_message) ->
      view = new PrivateEntryView(model: private_message)
      rendered = view.render().el
      @el.append rendered

    reseted: ->
      @el.html ""
      Messages.each @addRow  if Messages.length > 0
  )
  UserSession = Backbone.Model.extend({})
  UserListCollection = Backbone.Collection.extend(
    db: changes: true
    url: "/user_list"
    model: UserSession
  )
  UserList = new UserListCollection()
  UserListEntry = Backbone.View.extend(
    tagName: "li"
    className: "user"
    initialize: ->
      _.bindAll this, "remove_me"
      @model.bind "remove", @remove_me

    render: ->
      @el = $(@el)
      @el.html ""
      @el.unbind()
      @el.text @model.get("name")
      temp = "@" + @model.get("name") + " "
      @el.click ->
        Input.fillAndFocus temp

      @el

    remove_me: ->
      that = this
      @el.fadeOut ->
        that.el.remove()
  )
  UserListView = Backbone.View.extend(
    el: $("#userlist")
    initialize: ->
      _.bindAll this, "reseted", "addRow"
      UserList.bind "add", @addRow
      UserList.bind "reset", @reseted

    addRow: (model) ->
      @el.append new UserListEntry(model: model).render()

    reseted: ->
      UserList.each @addRow
  )
  App = Backbone.Router.extend(initialize: ->
    UserList.fetch()
  )
  CurrentSession = null
  Input = new InputView()
  _.delay (->
    $(window).unload ->
      $.ajaxSetup async: false
      CurrentSession.destroy()  if CurrentSession?

    $("#login").couchLogin
      loggedIn: (user) ->
        CurrentUser.set user
        PrivateMessages.listen_to_changes()
        unless UserList.detect((user) ->
          user.get("name") == CurrentUser.get("name")
        )
          CurrentSession = UserList.create(
            name: CurrentUser.get("name")
            logged_in_at: new Date().getTime()
          )

      loggedOut: ->
        PrivateMessages.stop_changes()
        CurrentUser.set new UserModel().toJSON()
        CurrentUser.trigger "change:name"
        CurrentSession.destroy()  if CurrentSession?

    new MessagesList()
    new UserListView()
    new App()
  ), 100

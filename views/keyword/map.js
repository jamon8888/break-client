function(doc) {
  var keywords;
  if (doc.title) {
    keywords = doc.title.split(/[^A-Z0-9\-_]+/i);
    keywords.map(function(keyword) {
        emit(keyword, null);
    });
  }
}


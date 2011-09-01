function(doc) {
  if (doc.location && doc.location.geohash) {
    emit(doc.location.geohash, null);
  }
};

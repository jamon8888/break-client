function(doc) {
  if (doc.categories) {
    for (var i = 0; i< doc.length; i++)
    emit(doc.category[i], null);
  }
};

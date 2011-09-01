function(doc) {
  if (doc.tags) {
    for (i=0; i < doc.tags; i++)
    emit(doc.tags, null)
  }
};

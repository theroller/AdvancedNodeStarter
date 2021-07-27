const mongoose = require('mongoose');

const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.exec = function newExec(...args) {
  console.log('IM ABOUT TO RUN A QUERY');
  return exec.apply(this, args);
};

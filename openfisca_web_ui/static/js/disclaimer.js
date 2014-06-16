'use strict';

var $ = require('jquery');


function init (config) {
  $('.alert.disclaimer').on('close.bs.alert', function () {
    $.get(config.disclaimerClosedUrlPath);
  });
}

module.exports = {init: init};

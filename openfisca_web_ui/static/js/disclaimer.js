'use strict';

var $ = require('jquery'),
  request = require('superagent');


function init(options) {
  $('.alert.disclaimer').on('close.bs.alert', function() {
    request.get(options.disclaimerClosedUrlPath).end();
  });
}

module.exports = {init: init};

require(['domReady!', 'jquery', './config', 'korma/helpers'], function(doc, $, config, helpers) {

  console.log('config', config);

  var rootQuestion = helpers.factory({
    $rootElement: $('form.korma'),
    config: config.rootQuestion,
    parent: null
  });

  console.log('rootQuestion', rootQuestion);

});

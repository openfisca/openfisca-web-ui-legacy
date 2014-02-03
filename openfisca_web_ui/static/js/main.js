require(['domReady!', 'jquery', './config', 'korma/helpers'], function(doc, $, config, helpers) {

  console.log('config', config);

  var rootQuestion = helpers.factory({
    $rootElement: $('form.korma'),
    config: config.rootQuestion,
    parent: null
  });

  console.log('rootQuestion', rootQuestion);

  $('.btn-all-question').each(function() {
    $this = $(this);
    var id = $this.parent().find("input[type='hidden'][name$='id']");
    $this.attr('href', $this.attr('href') + '&idx=' + id.val());
  });
});

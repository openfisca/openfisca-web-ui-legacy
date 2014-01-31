require(['domReady!', 'jquery', './config', 'korma/helpers'], function(doc, $, config, helpers) {

  console.log('config', config);

  var rootQuestion = helpers.factory({
    $rootElement: $('form.korma'),
    config: config.rootQuestion,
    parent: null
  });

  console.log('rootQuestion', rootQuestion);

  $("select[name$='.prenom_condition.prenom']").on('change', function() {
    var $select = $(this);
    var modalSelector = '#' + $select.attr('name').replace('.prenom_condition.prenom', '.prenom_condition.' + $select.val() + '-modal').replace(/\./g, "\\.");

    $button = $("button[name='" + $select.attr('id').replace('.prenom_condition.prenom', '.editer') + "']");
    $button.attr('data-target', modalSelector);
  });
  $("select[name$='.prenom_condition.prenom']").trigger('change');
});

    <div class="modal fade" id="export-modal" tabindex="-1" role="dialog" aria-labelledby="export-modal-label" \
aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title" id="export-modal-label">${_(u'Export')}</h4>
          </div>
          <div class="modal-body">
            <a class="btn btn-primary" href="${urls.get_url(ctx, u'/api/1/test_cases/current')}" rel="external"
target="_blank">
              ${_(u'Export simulation input')}
            </a>
            <button class="btn btn-primary">${_(u'Export simulation output')}</button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Close')}</button>
          </div>
        </div>
      </div>
    </div>

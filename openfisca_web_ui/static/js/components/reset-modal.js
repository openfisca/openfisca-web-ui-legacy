    <div class="modal fade" id="reset-dialog" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">${_(u'Reset this simulation?')}</h4>
                </div>
                <div class="modal-body">
                    <p>${_(u'Data associated to this simulation will be deleted.')}</p>
                </div>
                <div class="modal-footer">
                    <a class="btn btn-danger btn-reset" \
href="${user.get_user_url(ctx, 'reset') if user is not None else '/'}">
                        ${_(u'Reset')}
                    </a>
                    <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Cancel')}</button>
                </div>
            </div>
        </div>
    </div>

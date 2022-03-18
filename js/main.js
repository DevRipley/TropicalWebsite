function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const updateTimes = (function () {
    const months = 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split`,`;

    function dateString(date, now) {
        return months[date.getMonth()] + ' ' + date.getDate() + (date.getFullYear() === now.getFullYear() ? '' : ' ' + date.getFullYear());
    }

    function timeString(date) {
        return date.toLocaleString(navigator.languages, {hour: 'numeric', minute: 'numeric'});
    }

    function durationString(seconds) {
        if (seconds < 60) {
            return 'a few seconds';
        }
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes + (minutes === 1 ? ' minute' : ' minutes');
        }
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours + (hours === 1 ? ' hour' : ' hours');
        }
        const days = Math.floor(hours / 24);
        if (days < 30.5) {
            return days + (days === 1 ? ' day' : ' days');
        }
        const months = Math.floor(days / 30.5);
        if (days < 365.25) {
            return months + (months === 1 ? ' month' : ' months');
        }
        const years = Math.floor(days / 365.25);
        return years + (years === 1 ? ' year' : ' years');
    }

    function update() {
        const now = new Date();

        document.querySelectorAll('time[data-format]').forEach(e => {
            const format = e.dataset.format;
            const date = new Date(parseInt(e.getAttribute('datetime')));
            if (format === 'datetime') {
                e.textContent = timeString(date) + ' ' + dateString(date, now);
            } else if (format === 'date') {
                e.textContent = dateString(date, now);
            } else if (format === 'datetime-natural') {
                const oneDay = 24 * 60 * 60 * 1000;
                const oneMinute = 60 * 1000;
                const dayDiff = Math.floor((date.getTime() - date.getTimezoneOffset() * oneMinute) / oneDay) - Math.floor((now.getTime() - now.getTimezoneOffset() * oneMinute) / oneDay);
                const timeStr = timeString(date);
                if (dayDiff === 0) {
                    e.textContent = timeStr + ' Today';
                } else if (dayDiff === 1) {
                    e.textContent = timeStr + ' Tomorrow';
                } else if (dayDiff === -1) {
                    e.textContent = timeStr + ' Yesterday';
                } else {
                    e.textContent = timeStr + ' ' + dateString(date, now);
                }
            } else if (format === 'ago') {
                const seconds = Math.floor((now - date) / 1000);
                e.textContent = durationString(seconds) + ' ago';
            } else if (format === 'until') {
                const seconds = Math.floor((date - now) / 1000);
                e.textContent = 'in ' + durationString(seconds);
            }
            if (!e.dataset.originalTitle) {
                e.dataset.originalTitle = timeString(date) + ' ' + dateString(date, now);
            }
        });
    }

    update();
    setInterval(update, 10000, 10000);

    return update;
})();

$('#modal').on('show.bs.modal', function (e) {
    var button = $(e.relatedTarget);
    var modalAjax = button.data('modal-ajax');
    if (modalAjax) {
        showModalLoading();
        $('#modal-content').load(modalAjax, function (response, status, xhr) {
            if (status === 'error') {
                showModalError(response);
            }
            updateTimes();
        });
    }
});

$('body').on('submit', '.ajax-post-modal', function (e) {
    e.preventDefault();
    $.post(
        $(this).attr('action'),
        $(this).serialize()
    ).done(function () {
        $('#modal').modal('hide');
        $(document).trigger('modal.post.success');
    }).fail(function (xhr, status, msg) {
        showModalError(xhr.responseText);
    });
});


$(document).on('click', '.crud-duration-input-field .duration-edit', function () {
    var field = $(this).parents('.crud-duration-input-field');
    field.children('.duration-value').hide();
    field.children('.duration-editor').show();
});

$(document).on('change', '.crud-multi-select-field .all-selector', function () {
    $(this).parents('.crud-multi-select-field').find('input:not(.all-selector)').attr('disabled', $(this).is(':checked'));
});

$('#reveal-ip').on('click', function () {
    $('#ip').load($(this).data('url'), function (response, status, xhr) {
        if (status == 'success') {
            $('#reveal-ip').remove();
        }
    });
});


$(document).on('click', '[data-href]', function () {
    window.location = $(this).data('href');
});

function showModalLoading() {
    $('#modal-content').html('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><div class="modal-title text-center"><i class="modal-loading fa fa-cog fa-spin fa-4x"></i></div></div><div class="modal-body"></div>');
}

function showModalError(msg) {
    $('#modal-content').find('.alert').remove();
    $('#modal-content').find('.modal-loading').remove();
    $('#modal').find('.modal-body').prepend('<div class="alert alert-danger">' + msg + '</div>');
}

$('#inline-login').on('shown.bs.dropdown', function () {
    $('#inline-login-username').focus();
});

$('#search').autocomplete({
    serviceUrl: '/search-autocomplete',
    onSelect: function (suggestion) {
        window.location = '/u/' + suggestion.value;
    }
});

// Initialize Tooltips
$(document).tooltip({
    selector: '[data-toggle="tooltip"]'
});

$(document).on('click', '.profile-friends-box button', function () {
    if ($(this).data('action')) {
        var holder = $(this).closest('.profile-friends-box');
        $(this).replaceWith('<button class="btn btn-default" disabled><i class="fa fa-spinner fa-spin"></i></button>');
        $.post(
            $(this).data('action'),
            {'csrfmiddlewaretoken': getCookie('csrftoken')}
        ).fail(function (xhr, status, msg) {
            var message = xhr.responseJSON && xhr.responseJSON['error'];
            if (message) {
                $('#modal-content').html('<div class="modal-header"><h5 class="modal-title">Error</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="alert alert-danger">' + message + '</div></div>');
                $('#modal').modal('show');
            }
        }).always(function () {
            holder.load(holder.data('url'));
        });
    }
});

$(document).on('submit', '.profile-comment-form', function (e) {
    e.preventDefault();
    var form = $(this);
    $('.profile-comment-form-error').html('');
    $.post(
        form.attr('action'),
        form.serialize()
    ).fail(function (xhr, status, msg) {
        var message = xhr.responseJSON && xhr.responseJSON['error'] || 'Error';
        form.siblings('.profile-comment-form-error').html('<div class="alert alert-danger">' + message + '</div>');
    }).done(function () {
        var comments = $('#comments');
        var page = form.data('page') || comments.data('page') || '';
        comments.load(comments.data('url') + page, updateTimes);
        comments.data('page', page);
    });
});

$(document).on('click', '.comments-block .paging a', function (e) {
    e.preventDefault();
    var href = $(this).attr('href');
    if (href) {
        var comments = $('#comments');
        comments.load(comments.data('url') + href, updateTimes);
        comments.data('page', href);
    }
});

$(document).on('submit', '.forum-reply-form', function (e) {
    e.preventDefault();
    var form = $(this);
    var parentId = form.find('[name="parent"]').val();
    $.post({
        url: form.attr('action'),
        data: form.serialize(),
        headers: {'X-CSRFToken': getCookie('csrftoken')}
    }).done(function (data) {
        form.removeClass('show');
        form.find('textarea').val('');
        form.find('.forum-reply-form-alert').html('');
        $('#reply-children-' + parentId).prepend(data);
    }).fail(function (xhr, status, msg) {
        var message = xhr.responseJSON && xhr.responseJSON['error'] || msg || 'Error';
        form.find('.forum-reply-form-alert').html('<div class="alert alert-danger errorlist-flat">' + message + '</div>');
    }).always(function () {
        updateTimes();
        form.find(':input').prop('disabled', false);
    });
    form.find(':input').prop('disabled', true);
});


$(document).on('click', '[data-load]', function () {
    var url = $(this).data('load');
    var target = $(this).data('target');
    $(target).load(url, updateTimes);
});

$(document).on('click', '[data-upvote]', function () {
    var btn = $(this);
    var restoreBtn = btn[0].outerHTML;
    btn.toggleClass('voted');
    var upvote = btn.hasClass('voted');
    var count = parseInt(btn.find('.count').text());
    count = count + (upvote ? 1 : -1);
    btn.find('.count').text(count);
    $.post({
        url: btn.data('upvote'),
        data: {upvote: upvote},
        headers: {'X-CSRFToken': getCookie('csrftoken')}
    }).done(function (data) {
        if (!data.success) {
            btn.replaceWith(restoreBtn);
        }
    }).fail(function () {
        btn.replaceWith(restoreBtn);
    });
});

$(document).on('show.bs.collapse', '#forum-replies .collapse', function () {
    $('#forum-replies .collapse.show').collapse('hide');
});

$(document).on('click', '[data-remove-friend] .remove-btn', function () {
    var item = $(this).closest('[data-remove-friend]');
    $.post({
        url: item.data('remove-friend'),
        headers: {'X-CSRFToken': getCookie('csrftoken')}
    });
    $(this).remove();
    item.addClass('removed');
});

$(document).on('click', '[data-accept-friend] .accept-btn', function () {
    var btn = $(this);
    var item = btn.closest('[data-accept-friend]');
    $.post({
        url: item.data('accept-friend'),
        headers: {'X-CSRFToken': getCookie('csrftoken')}
    }).fail(function (xhr, status, msg) {
        var message = xhr.responseJSON && xhr.responseJSON['error'];
        if (message) {
            $('#modal-content').html('<div class="modal-header"><h5 class="modal-title">Error</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="alert alert-danger">' + message + '</div></div>');
            $('#modal').modal('show');
        }
    }).done(function () {
        item.find('.deny-btn').remove();
        btn.remove();
        item.addClass('accepted');
    });
});

$(document).on('click', '[data-deny-friend] .deny-btn', function () {
    var item = $(this).closest('[data-deny-friend]');
    $.post({
        url: item.data('deny-friend'),
        headers: {'X-CSRFToken': getCookie('csrftoken')}
    });
    item.find('.accept-btn').remove();
    $(this).remove();
    item.addClass('removed');
});

window.onload = function() {
    setTimeout(clearNotifications, 7500);
};

$(document).on('click', '#toggle-dark-mode', function() {
    var darkMode = localStorage.getItem('lunar-dark-mode');
    localStorage.setItem('lunar-dark-mode', darkMode && darkMode == "true" ? false : true);
    location.reload();
});

function clearNotifications() {
    $(".timed-alert").fadeTo(200, 0).slideUp(200, function() {
        $(this).remove(); 
    });
}

// https://stackoverflow.com/questions/55065316/copy-text-present-in-button-attribute-to-clipboard
$('#ticket-ign-copy').on('click', function(e) {
    e.preventDefault();
  
    var copyText = $(this).attr('data-ign');
  
    toClipboard(copyText);
})

$('#ticket-uuid-copy').on('click', function(e) {
    e.preventDefault();
  
    var copyText = $(this).attr('data-uuid');
  
    toClipboard(copyText);
})

function toClipboard(input) {
    var textarea = document.createElement("textarea");
    textarea.textContent = input;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy"); 
  
    document.body.removeChild(textarea);
}
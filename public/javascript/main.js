/**
 * Initialize socket.io
 */

var socket = io.connect();

$(function () {

  /**
   * Auto focus
   */

  $('.chat').live('click', function (ev) {
    if ($(ev.target).is('input')) return;
    $(this).find('input').focus();
  });

  /**
   * Capture form submission for both user and admin
   */

  $('form').live('submit', function () {
    var chat = $(this).parents('.chat')
      , input = $(this).find('input')
      , msg = input.val();

    chat.find('.messages')
      .append($('<li>').append('<b>You: </b>').append($('<span>').text(msg)))
      .get(0).scrollTop = 1000000000;

    input.val('');

    if (chat.attr('id') == 'chat') {
      socket.emit('user message', msg)
    } else {
      socket.emit('admin message', chat.attr('data-id'), msg);
    }

    return false;
  });

  /**
   * User events
   */

  if ($('#chat').length) {
    socket.on('ready', function (id) {
      $('#chat').attr('data-id', id).addClass('highlight');
    });

    socket.on('admin message', function (msg) {
      window.focus();
      $('#chat .messages')
        .append($('<li>').append('<b>Admin: </b>').append($('<span>').text(msg)))
        .get(0).scrollTop = 1000000000;
    });
  }

  /**
   * Admin events
   */

  if ($('#chats').length) {
    socket.emit('admin');

    socket.on('user message', function (id, msg) {
      if (!$('#chat-' + id).length) {
        var div = $('<div class="chat"><ul class="messages"/><form>'
          + '<input type="text"><button>Send</button></div>')
          .attr('id', 'chat-' + id)
          .attr('data-id', id)
          .appendTo('#chats');

        setTimeout(function () {
          div.addClass('highlight');
        }, 100)
      }

      $('#chat-' + id + ' .messages')
        .append($('<li>').append('<b>User: </b>').append($('<span>').text(msg)))
        .get(0).scrollTop = 1000000000;
    });

    socket.on('user disconnect', function (id) {
      $('#chat-' + id).remove();
    });
  }

});

/**
 * Capture assets loaded.
 */

$(window).load(function () {
  $('body').addClass('loaded');
});

var doSubmit;

$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#chatresult');
    var input = $('#input');
    var output = $('#output');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
            + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return; 
    }

    // open connection
    var connection = new WebSocket('ws://sej-node-ws.herokuapp.com');

    connection.onopen = function () {
        // first we want users to enter their names
        if(myIndex in people){
            myColor = people[myIndex].body.color;
        }
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
        output.val(myName).css('color', myColor).css('font-weight', 'bold');
        input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                 json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
             json.data.color, new Date(json.data.time));
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
        
        content.animate({ scrollTop: content[0].scrollHeight}, 1000);
    };

    doSubmit = function(){
       myName = output.val();

       var msg = input.val();
       if (!msg) {
        return;
    }

    var obj = {
        type:'message',
        text: msg,
        author: myName
    };


        // send the message as an ordinary text
        connection.send(JSON.stringify(obj));
        input.val('');
        // disable the input field to make the user wait until server
        // sends back response
        //input.attr('disabled', 'disabled');
    }

    /**
     * Send mesage when user presses Enter key
     */

     input.keydown(function(e) {
        if (e.keyCode === 13) {
         doSubmit();
     }
 });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
     setInterval(function() {
        if (connection.readyState !== 1) {
            output.val('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
               + 'with the WebSocket server.');
        }
    }, 3000);

    /**
     * Add message to the chat window
     */
     function addMessage(author, message, color, dt) {
        var conColor  = "green";

        content.append('<p><strong><span style="color:' + color + '">' + author + '</span></strong> @ ' +
           + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
           + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
           + ': ' + '<span style="color:'  + conColor + '">' + message + '</span></p>');        
    }
});
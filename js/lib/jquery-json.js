;(function($) {
    var JsonValue = function(value) {
        console.log(value);
        this.decoded = JSON.parse(value);
        this.mode = this.categorizeValue(this.decoded);
    };
    
    var utilities = {
        render_ARRAY : function(values) {
            var template =
              '<div class="row json-value-row">' +
              '<div class="col-sm-1"><button type="button">&times;</button></div>' +
              '<div class="col-sm-11 json-value-arrayval">:CONTENT</div>' +
              '</div>';
            var outputHtml = '';
            for (var i=0; i < values.length; i++) {
                var value = values[i];
                outputHtml += template.replace(/:CONTENT/,
                    (value instanceof JsonValue)?value.render():value);
            }
            return outputHtml;
        },
        render_HASH : function(values) {
            var template =
              '<div class="row json-value-row">' +
              '<div class="col-sm-1"><button type="button">&times;</button></div>' +
              '<div class="col-sm-4 json-value-hashkey">:CONTENT_KEY</div>' +
              '<div class="col-sm-7 json-value-hashval">:CONTENT_VAL</div>' +
              '</div>';
            var outputHtml = '';
            console.log(values);
            for (var k in values) {
                var v = values[k];
                outputHtml += template
                              .replace(/:CONTENT_KEY/, this.render_SCALAR(k) )
                              .replace(/:CONTENT_VAL/, (v instanceof JsonValue)?v.render():v );
            }
            return outputHtml;
        },
        render_SCALAR : function(value) {
            var template = '<input type="text" class="col-sm-12" value=":CONTENT">';
            return template.replace(/:CONTENT/, value);
        }
    }
    
    JsonValue.prototype = {
        categorizeValue : function(value) {
            if ($.isArray(value)) {
                return 'ARRAY';
            } else if ($.isPlainObject(value)) {
                return 'HASH';
            } else {
                return 'SCALAR';
            }    
        },
        render: function() {
            return utilities['render_' + this.mode](this.unpack());
        },
        unpack: function() {
            if (this.mode == 'ARRAY') {
                return this.decoded.reduce(function(previous, current, index, array) {
                    previous.push( new JsonValue(JSON.stringify(current)));
                    return previous;
                }, []);
            } else if (this.mode == 'HASH') {
                var decoded = this.decoded;
                return Object.keys(decoded).reduce(function(previous, current, index, array) {                    
                    previous[current] = new JsonValue(JSON.stringify(decoded[current]));
                    return previous;
                }, {});
            } else {
                return this.decoded;
            }
        },
        toString: function() {
            return JSON.stringify(this.decoded);
        },
        addValue: function() {
            if (this.mode == 'ARRAY') {
                if (arguments.length == 1 ) {
                    var argument = arguments[0];                    
                    this.decoded.push((argument instanceof JsonInput)?argument.decoded:argument);
                } else {
                    console.log('Invalid argument.');
                }
            } else if (this.mode == 'HASH') {
                if (arguments.length == 2) {
                    this.decoded[arguments[0]] =
                      (arguments[1] instanceof JsonInput)?arguments[1].decoded:arguments[1];
                } else {
                    console.log('Invalid argument.');
                }
            } else {
                console.log('Invalid operation.');
            }         
        }        
    };

    var test = new JsonValue('[{"wonder":"ful"},{"key":1,"anotherkey":["a","b"]}]');
    console.log(test.render());
    $('#test-a').html(test.render());
    
})(jQuery);

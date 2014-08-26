;(function($) {
    var JsonValue = function(value, options) {
        this.decoded = JSON.parse(value);
        this.mode = this.categorizeValue(this.decoded);
        this.options = $.extend({}, options);
    };
    
    var utilities = {        
        render_ARRAY : function(values) {
            var template =
                    '<div class="row json-value-row">' +             
                    '<div class="col-sm-10 json-value-arrayval">:CONTENT</div>' +             
                    '</div>';                                              
            var outputHtml = '';
            for (var i=0; i < values.length; i++) {
                var value = values[i];
                value.options = $.extend(value.options, {tag: '-'});
                outputHtml += template.replace(/:CONTENT/, value.render());
            }
            outputHtml += this.render_btn_record_add('array');                   
            return this.render_json_delimiter('ARRAY', 'left') + outputHtml + this.render_json_delimiter('ARRAY', 'right');
        },
        render_HASH : function(values) {
            var template =
                    '<div class="row json-value-row">' +                   
                    '<div class="col-sm-4 json-value-hashkey">:CONTENT_KEY</div>' +
                    '<div class="col-sm-7 json-value-hashval">:CONTENT_VAL</div>' +
                    '</div>';                                    
            var outputHtml = '';
            for (var k in values) {
                var v = values[k];
                v.options = $.extend(v.options, {tag: 'value'});
                outputHtml += template
                            .replace(/:CONTENT_KEY/, this.render_SCALAR(k, {tag: 'key'}) )
                            .replace(/:CONTENT_VAL/, v.render());
            }
            outputHtml += this.render_btn_record_add('hash');                    
            return this.render_json_delimiter('HASH', 'left') + outputHtml + this.render_json_delimiter('HASH', 'right');
        },
        render_SCALAR : function(value, options) {
            var template;
            if (options.hasOwnProperty('tag')) {
                template =
                    '<div class="col-sm-12 input-group">' +
                    '<span class="input-group-addon">' + options.tag + '</span>' +    
                    '<input type="text" class="form-control" value=":CONTENT">' + 
                    '</div>';
            } else {
                template = 
                    '<div class="col-sm-12 input-group">' +
                    '<span class="input-group-addon">' + 'scalar' + '</span>' +    
                    '<input type="text" class="form-control" value=":CONTENT">' + 
                    '</div>';
            }          
            return template.replace(/:CONTENT/, value);
        },
        render_json_delimiter : function(mode, position) {
            var symbol, dropdown;
            var template = 
                    '<div class="input-group-btn json-delimiter">' +
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">:CONTENT<span class="caret"></span></button>' +
                    '<ul class="dropdown-menu" role="menu">:DROPDOWN</ul>' +
                    '</div>';
            
            if (mode === 'ARRAY') {
                symbol = (position === 'left')?'[':']';
                dropdown = '<li><a href="#">{...}</a></li>' + '<li><a href="#">...</a></li>';
            } else if (mode === 'HASH') {
                symbol = (position === 'left')?'{':'}';
                dropdown = '<li><a href="#">[...]</a></li>' + '<li><a href="#">...</a></li>';
            } else {
                symbol = null;
                dropdown = '<li><a href="#">[...]</a></li>' + '<li><a href="#">{...}</a></li>';
            }
            if (symbol) {
                return template.replace(/:CONTENT/, symbol).replace(/:DROPDOWN/, dropdown);
            } else {
                return '';
            }
        },
        render_btn_record_add : function(text){
            return  '<div class="row json-value-row-ctl">' +
                    '<div class="col-sm-10"><button type="button" class="add">Add to '+ text +'</button></div>' +
                    '</div>';
        }
    };
    
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
            return utilities['render_' + this.mode](this.unpack(), this.options);
        },
        unpack: function() {
            if (this.mode === 'ARRAY') {
                return this.decoded.reduce(function(previous, current, index, array) {
                    previous.push( new JsonValue(JSON.stringify(current)));
                    return previous;
                }, []);
            } else if (this.mode === 'HASH') {
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
            if (this.mode === 'ARRAY') {
                if (arguments.length === 1 ) {
                    var argument = arguments[0];                    
                    this.decoded.push((argument instanceof JsonInput)?argument.decoded:argument);
                } else {
                    console.log('Invalid argument.');
                }
            } else if (this.mode === 'HASH') {
                if (arguments.length === 2) {
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
    $('#test-a').html(test.render());
    
})(jQuery);

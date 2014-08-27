;(function($) {
    var JsonValue = function(value, options) {
        this.decoded = JSON.parse(value);
        this.mode = this.categorizeValue(this.decoded);
        this.options = $.extend({}, options);
    };
    
    var utilities = {        
        render_ARRAY : function(values, options) {
            var template =
                    '<div class="row json-value-row">' +             
                    '<div class="col-sm-11 json-value-composite">:CONTENT</div>' +
                    '</div>';                                                          
            if ($.isArray(values)) {
                var outputHtml = '';
                for (var i=0; i < values.length; i++) {
                    var value = values[i];                
                    value.options = $.extend(value.options, {deletable: true});
                    outputHtml += template.replace(/:CONTENT/, value.render());
                }
                outputHtml += this.render_btn_record_add('ARRAY');                   
                return this.render_json_delimiter('ARRAY', 'left') + outputHtml + this.render_json_delimiter('ARRAY', 'right', options.appendSeparator);
            } else {               
                return template.replace(/:CONTENT/, this.render_SCALAR('', {deletable: true}));
            }
        },
        render_HASH : function(values, options) {
            var template =
                    '<div class="row json-value-row">' +                   
                    '<div class="col-sm-4 json-value-hashkey">:CONTENT_KEY</div>' +
                    '<div class="col-sm-7 json-value-composite">:CONTENT_VAL</div>' +
                    '</div>';
            if ($.isPlainObject(values)) {
                var outputHtml = '';
                for (var k in values) {
                    var v = values[k];
                    v.options = $.extend(v.options, {tag: 'value', deletable: true});
                    outputHtml += template
                                  .replace(/:CONTENT_KEY/, this.render_SCALAR(k, {tag: 'key'}) )
                                  .replace(/:CONTENT_VAL/, v.render());
                }
                outputHtml += this.render_btn_record_add('HASH');                    
                return this.render_json_delimiter('HASH', 'left') + outputHtml + this.render_json_delimiter('HASH', 'right', options.appendSeparator);
            } else {
                return template
                       .replace(/:CONTENT_KEY/, this.render_SCALAR("", {tag: 'key'}))
                       .replace(/:CONTENT_VAL/, this.render_SCALAR("", {tag: 'value', deletable: true}));
                
            }
        },
        render_SCALAR : function(value, options) {
            var template;
            if (options.hasOwnProperty('tag')) {
                template =
                    '<div class="col-sm-12 input-group">' +
                    '<span class="input-group-addon">' + options.tag + '</span>' +    
                    '<input type="text" class="form-control" value=":CONTENT">' +
                    '<span class="input-group-addon record-del">X</span>' +
                    '</div>';
            } else {
                template = 
                    '<div class="col-sm-12 input-group">' +
                    '<span class="input-group-addon">' + 'scalar' + '</span>' +    
                    '<input type="text" class="form-control" value=":CONTENT">' + 
                    '</div>';
            }
            template =
              '<div class="col-sm-12 input-group">' +
              '<span class="input-group-addon">' +
              (options.hasOwnProperty('tag')?options.tag:'-') +
              '</span>' +
              '<input type="text" class="form-control" value=":CONTENT">' +
              (options.hasOwnProperty('deletable')?'<span class="input-group-addon btn record-del glyphicon glyphicon-minus-sign glyphicon-alert"></span>':'')+
              '</div>';
            
            return template.replace(/:CONTENT/, value);
        },
        render_json_delimiter : function(mode, position, appendSeparator) {
            var symbol, dropdown;
            var template_left = '<div class="input-group-btn json-delimiter">' +
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">:CONTENT<span class="caret"></span></button>' +
                    '<ul class="dropdown-menu" role="menu">:DROPDOWN</ul>' +
                    '</div>';
            var template_right = '<div class="json-delimiter"><span>:CONTENT</span></div>';
            var template = (position === 'left')?template_left:template_right; 
            
            if (mode === 'ARRAY') {
                symbol = (position === 'left')?'[':(']' + (appendSeparator?' ,':''));
                dropdown = '<li><a href="#">{...}</a></li>' + '<li><a href="#">...</a></li>';
            } else if (mode === 'HASH') {
                symbol = (position === 'left')?'{':('}' + (appendSeparator?' ,':''));
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
        render_btn_record_add : function(mode){
            var text = mode.toLowerCase();
            return  '<div class="row json-value-row-ctl">' +
                    '<div class="col-sm-10"><button type="button" class="record-add" data-mode="' + mode + '">Add to '+ text +'</button></div>' +
                    '</div>';
        },
        add_record: function($target, mode) {
            var contentHtml = this['render_' + mode](null);
            $target.before(contentHtml);
            $('span.record-del').on('click.record-del', function() {
                $(this).closest('.json-value-row').remove();
            });
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
        after_render: function() {        
            $('button.record-add').on('click.record-add', function() {
                utilities.add_record($(this).closest('.json-value-row-ctl'), $(this).data('mode'));
            });
            $('span.record-del').on('click.record-del', function() {
                $(this).closest('.json-value-row').remove();
            });
        },
        unpack: function() {
            if (this.mode === 'ARRAY') {
                return this.decoded.reduce(function(previous, current, index, array) {
                    var params = (index === array.length -1)?{}:{appendSeparator: true};
                    previous.push( new JsonValue(JSON.stringify(current), params));
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
        }             
    };

    

    var test = new JsonValue('[{"wonder":"ful"},{"key":1,"anotherkey":["a","b"]}]');   
    $('#test-a').html(test.render());
    test.after_render();
    
})(jQuery);

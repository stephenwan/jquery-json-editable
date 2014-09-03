;(function($) {
    
    var default_parameters = {
        tag_array_value : 'array value',
        tag_hash_key : 'hash key',
        tag_hash_value : 'hash value',
        tag_scalar : 'scalar',
        cancel_form_submit : false,
        hide_original_input : false,
        lock_original_input : false
    };

    var JsonValue = function(value, options, parameters) {
        this.options(options);
        this.parameters(parameters);
        this.decoded = JSON.parse(value);
        this.mode = this.categorizeValue(this.decoded);      
    };
    
    JsonValue.prototype = {
        options: function() {
            if (arguments.length === 0) {
                return this._options;
            } else {
                this._options = $.extend({composite: true}, this._option, arguments[0]);
                return this;
            }            
        },
        parameters: function() {
            if (arguments.length === 0) {
                return this._parameters;
            } else {                               
                this._parameters = $.extend({}, default_parameters, this._parameters, arguments[0]);                
                return this;
            }            
        },
        categorizeValue : function(value) {
            return $.isArray(value)?'ARRAY':($.isPlainObject(value)?'HASH':'SCALAR');
        },
        render: function() {            
            return utilities['render_' + this.mode](this.unpack());
        },        
        unpack: function() {
            var parameters = this.parameters();
            if (this.mode === 'ARRAY') {
                return this.decoded.reduce(function(previous, current, index, array) {                   
                    previous.push( new JsonValue(JSON.stringify(current), {}, parameters));
                    return previous;
                }, []);
            } else if (this.mode === 'HASH') {
                var decoded = this.decoded;
                return Object.keys(decoded).reduce(function(previous, current, index, array) {                    
                    previous[current] = new JsonValue(JSON.stringify(decoded[current]), {}, parameters);
                    return previous;
                }, {});
            } else {
                return this;
            }
        }           
    };
    
    var utilities = {
        empty_value : function(mode) {
            var value = (mode === 'ARRAY')?'[]':(mode=== 'HASH'?'{}':'""');
            return new JsonValue(value);
        },
        render_ARRAY : function(values) {           
            var template =
                    '<tr class="json-value-row" data-mode="ARRAY">' +
                    '<td>:CONTENT_DEL</td>' +
                    '<td class="json-array-value json-switch">:CONTENT</td>' +
                    '</tr>';
            template = template.replace(/:CONTENT_DEL/, this.button_del.render());
            if ($.isArray(values)) {
                var outputHtml = '';
                for (var i=0; i < values.length; i++) {
                    var value = values[i];                
                    outputHtml += template.replace(/:CONTENT/, value.parameters({tag_scalar: default_parameters.tag_array_value}).render());
                }

                outputHtml += this.button_add.render('ARRAY');                   
                return '<table class="json-value-composite">' +
                       this.render_json_delimiter('ARRAY', 'left') +
                       outputHtml +
                       this.render_json_delimiter('ARRAY', 'right') +
                       '</table>';
            } else {
                var value = this.empty_value('SCALAR')                         
                            .parameters({'tag_scalar': default_parameters.tag_array_value });
                return template.replace(/:CONTENT/, this.render_SCALAR(value));
            }
        },
        render_HASH : function(values) {
            var template =
                    '<tr class="json-value-row" data-mode="HASH">' +
                    '<td>:CONTENT_DEL</td>' +
                    '<td class="json-hash-key">:CONTENT_KEY</td>' +
                    '<td class="json-hash-value json-switch">:CONTENT_VAL</td>' +
                    '</tr>';
            template = template.replace(/:CONTENT_DEL/, this.button_del.render());            
            if ($.isPlainObject(values)) {
                var outputHtml = '';
                for (var k in values) {
                    var v = values[k];
                    outputHtml += template
                                  .replace(/:CONTENT_KEY/, this.render_SCALAR(k, {tag_scalar: default_parameters.tag_hash_key}))
                                  .replace(/:CONTENT_VAL/, v.parameters({tag_scalar: default_parameters.tag_hash_value}).render());
                }
                outputHtml += this.button_add.render('HASH');                    
                return '<table class="json-value-composite">' +
                       this.render_json_delimiter('HASH', 'left') +
                       outputHtml +
                       this.render_json_delimiter('HASH', 'right') +
                       '</table>';
            } else {
                var k = this.empty_value('SCALAR')
                        .options({composite: false})
                        .parameters({tag_scalar: default_parameters.tag_hash_key});  
                k.parameters({tag_scalar: default_parameters.tag_hash_key});
                var v = this.empty_value('SCALAR')
                        .parameters({tag_scalar: default_parameters.tag_hash_value});
                return template
                       .replace(/:CONTENT_KEY/, this.render_SCALAR(k))
                       .replace(/:CONTENT_VAL/, this.render_SCALAR(v));                
            }
        },
        render_SCALAR : function(value, parameters) {
            var options;
            if (value instanceof JsonValue) {
                options = value.options();
                parameters = value.parameters(parameters).parameters();
                value = value.decoded;
            } else {
                options = {composite: false};
            }
            var template = '<input type="text" ' +
                           (options.composite?' class="json-value-composite" ':'') +
                           ' value=":CONTENT_VAL" placeholder=":CONTENT_PH">' +
              (options.composite?this.button_switch.render('SCALAR'):'');                
            return template.replace(/:CONTENT_VAL/, value).replace(/:CONTENT_PH/, parameters.tag_scalar);
        },
        render_json_delimiter : function(mode, position) {
            var colspan = (mode === 'ARRAY')?1:(mode=== 'HASH'?2:1);
            var template = '<tr class="json-delimiter-row">' +
                           '<td class="json-delimiter-value json-switch" data-mode="' + mode + '">:CONTENT</td>' +
                           '<td colspan="' + colspan +'"></td>' +
                           '</tr>';

            var symbol;
            if (position === 'right') {
                symbol = (mode === 'ARRAY')?']':(mode=== 'HASH'?'}':'');               
            } else {
                symbol = (mode === 'ARRAY')?'[':(mode=== 'HASH'?'{':'');
            }
            var content = '<div>' + symbol + '</div>' + (position === 'left'?this.button_switch.render(mode):'');
            return template.replace(/:CONTENT/, content);
        },
        button_switch: {
            render: function(mode) {
                var template = '<div class="json-switch-triangle"></div>' +
                               '<ul class="json-switch-dropdown">:DROPDOWN</ul>'
                
                var dropdown;
                if (mode === 'ARRAY') {
                    dropdown = '<li><a href="#" data-mode="HASH">{...}</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>';
                } else if (mode === 'HASH') {
                    dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>'; 
                } else {
                    dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="HASH">{...}</a></li>';
                }
                return template.replace(/:DROPDOWN/, dropdown);              
            },
            after_render: function($scope, $target, utilities) {
                $target.children('.json-switch-dropdown').find('a').off('click.record-switch');
                $target.children('.json-switch-dropdown').find('a').on('click.record-switch', function() {   
                    var mode = $(this).data('mode');
                    var $composite;
                    if ($target.hasClass('json-delimiter-value')) {
                        $composite = $target.closest('.json-value-composite');
                    } else {
                        $composite = $target.children('.json-value-composite');
                    }
                    var value = utilities.empty_value(mode);                                                            
                    if ($composite.closest('td').hasClass('json-array-value')) {
                        value.parameters({tag_scalar: default_parameters.tag_array_value});
                    }
                    else if ($composite.closest('td').hasClass('json-hash-value')) {
                        value.parameters({tag_scalar: default_parameters.tag_hash_value});
                    }                     
                    $composite.closest('td').html(value.render()); 
                    utilities.updated($scope);
                });
            }
        },        
        button_del: {
            render: function() {
                return '<button type="button" class="record-del">&#9747;</button>';
            },
            after_render: function($scope, $target) { 
                $target.off('click.record-del');
                $target.on('click.record-del', function() {                   
                   $(this).closest('.json-value-row').remove(); 
                });
            }
        },
        button_add: {
            render: function(mode) {
                var colspan = (mode === 'ARRAY')?1:(mode=== 'HASH'?2:1);
                var text = mode.toLowerCase();
                return  '<tr class="json-value-row-ctl">' +
                        '<td></td>' +
                        '<td colspan=' + colspan + '><button type="button" class="record-add" data-mode="' + mode +
                        '">Add to '+ text +'</button></td>' +
                        '</tr>';
            },
            after_render: function($scope, $target, mode, utilities) {
                var contentHtml = utilities['render_' + mode](null);
                $target.off('click.record-add');
                $target.on('click.record-add', function() {                    
                    $(this).closest('.json-value-row-ctl').before(contentHtml);
                    utilities.updated($scope);
                });                                
            }    
        },      
        updated: function($scope) {                    
            $scope.find('.record-add').each(function() {
                utilities.button_add.after_render($scope, $(this), $(this).data('mode'), utilities);
            });
            $scope.find('.record-del').each(function() {
                utilities.button_del.after_render($scope, $(this)); 
            });
            $scope.find('.json-switch').each(function() {             
                utilities.button_switch.after_render($scope, $(this), utilities); 
            });                   
        },
        eval_composite: function($target) {
            var utility = this;
            var delimiters = $target.children().children('.json-delimiter-row').children('.json-delimiter-value');            
            var mode = null;
            if (delimiters.length !== 0) {                              
                mode = delimiters.data('mode');
            }
            if (mode === 'ARRAY') {
                var return_value = [];
                $target.children('tbody').children('.json-value-row').each(function() {
                    $(this).children('.json-array-value').children('.json-value-composite').each(function() {                     
                        return_value.push(utility.eval_composite($(this)));
                    });
                });
                return return_value;
            } else if (mode === 'HASH') {
                var return_value = {};
                $target.children('tbody').children('.json-value-row').each(function() {                   
                    var key = $(this).children('.json-hash-key').find('input').val();   
                    if (key !== '') {
                        return_value[key] = utility.eval_composite($(this).children('.json-hash-value').children('.json-value-composite'));
                    }                    
                });                
                return return_value;
            } else {                       
                return $target.val();            
            }     
        }
    };

    $.fn.editableJsonInput = function(parameters){
        $.extend(default_parameters, parameters);        
        var bind_input = function($input) {
            $input.next('.json-value-composite').remove();
            var jsonValue = new JsonValue($input.val());
            $input.after(jsonValue.render());
            utilities.updated($input.next('.json-value-composite'));
        };        
        var $input = $(this);
        if (default_parameters.hide_original_input) $input.addClass('hidden');
        if (default_parameters.lock_original_input) {
            $input.attr('readonly', 'readonly');
        } else {
            $input.on('focusout', function() {bind_input($input);});
        }        
        bind_input($input);
        $input.parents('form').submit(function() {          
           var $scope = $input.next('.json-value-composite');
           $input.val(JSON.stringify(utilities.eval_composite($scope))) ;         
           return default_parameters.cancel_form_submit?false:true;          
        });
    };      
})(jQuery);

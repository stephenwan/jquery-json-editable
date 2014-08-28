;(function($) {
    
    var default_parameters = {
        tag_array_value : 'a',
        tag_hash_key : 'k',
        tag_hash_value : 'v',
        tag_scalar : 'scalar'        
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
                this._options = $.extend({composite: true, deletable: true}, this._option, arguments[0]);
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
                    previous.push( new JsonValue(JSON.stringify(current), {deletable: true}, parameters);
                    return previous;
                }, []);
            } else if (this.mode === 'HASH') {
                var decoded = this.decoded;
                return Object.keys(decoded).reduce(function(previous, current, index, array) {                    
                    previous[current] = new JsonValue(JSON.stringify(decoded[current]), {deletable: false}, parameters;
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
                    '<div class="row json-value-row" data-mode="ARRAY">' +             
                    '<div class="col-xs-12 json-array-value json-value-composite">:CONTENT</div>' +
                    '</div>';                                                          
            if ($.isArray(values)) {
                var outputHtml = '';
                for (var i=0; i < values.length; i++) {
                    var value = values[i];                
                    outputHtml += template.replace(/:CONTENT/, value.parameters({tag_scalar: default_parameters.tag_array_value}).render());
                }

                outputHtml += this.button_add.render('ARRAY');                   
                return this.render_json_delimiter('ARRAY', 'left') +
                       outputHtml +
                       this.render_json_delimiter('ARRAY', 'right');
            } else {
                var value = this.empty_value('SCALAR')
                            .options({deletable: true})
                            .parameters({'tag_scalar': default_parameters.tag_array_value });
                return template.replace(/:CONTENT/, this.render_SCALAR(value));
            }
        },
        render_HASH : function(values) {
            var template =
                    '<div class="row json-value-row" data-mode="HASH">' +                   
                    '<div class="col-xs-5 json-hash-key">:CONTENT_KEY</div>' +
                    '<div class="col-xs-7 json-hash-value json-value-composite">:CONTENT_VAL</div>' +
                    '</div>';
            if ($.isPlainObject(values)) {
                var outputHtml = '';
                for (var k in values) {
                    var v = values[k];
                    outputHtml += template
                                  .replace(/:CONTENT_KEY/, this.render_SCALAR(k, {tag_scalar: default_parameters.tag_hash_key}))
                                  .replace(/:CONTENT_VAL/, v.parameters({tag_scalar: default_parameters.tag_hash_value}).render());
                }
                outputHtml += this.button_add.render('HASH');                    
                return this.render_json_delimiter('HASH', 'left') +
                       outputHtml +
                       this.render_json_delimiter('HASH', 'right');
            } else {
                var k = this.empty_value('SCALAR')
                        .options({composite: false, deletable: true})
                        .parameters({tag_scalar: default_parameters.tag_hash_key});  
                k.parameters({tag_scalar: default_parameters.tag_hash_key});
                var v = this.empty_value('SCALAR')
                        .options({deletable: false})
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
                options = {composite: false, deletable: true};
            }
            var template;
            if (options.composite) {
             
                template =
                  '<div class="col-xs-12 input-group">' + 
                  (options['deletable']?this.button_del.render():'') +
                  this.button_switch.render('SCALAR', parameters.tag_scalar) +
                  '<input type="text" class="form-control" value=":CONTENT">' +                    
                  '</div>';
            } else {
                template = 
                  '<div class="col-xs-12 input-group">' +
                  (options['deletable']?this.button_del.render():'') + 
                  '<span class="input-group-addon">' + parameters.tag_scalar + '</span>' +    
                  '<input type="text" class="form-control" value=":CONTENT">' + 
                  '</div>';
            }            
            return template.replace(/:CONTENT/, value);
        },
        render_json_delimiter : function(mode, position) {
            var symbol;
            if (position === 'right') {
                symbol = (mode === 'ARRAY')?']':(mode=== 'HASH'?'}':'');
                return '<div class="json-delimiter" data-mode="' + mode + '"><span>'+ symbol +'</span></div>';
            } else {
                symbol = (mode === 'ARRAY')?'[':(mode=== 'HASH'?'{':'');
                return this.button_switch.render(mode, symbol, {btn_class: 'json-delimiter' } );
            }            
        },
        button_switch: {
            render: function(mode, content, options) {
                options = typeof options !== 'undefined'? options : {};
                var template =
                  '<div class="input-group-btn '+ (options.hasOwnProperty('btn_class')?options['btn_class']:'' ) +'" data-mode="' + mode +'">' +
                  '<span class="btn btn-default dropdown-toggle record-switch" data-toggle="dropdown">' +
                  ':CONTENT' + 
                  '<span class="caret"></span></span>' +
                  '<ul class="dropdown-menu" role="menu">' +
                  ':DROPDOWN' +
                  '</ul></div>';
                
                var dropdown;
                if (mode === 'ARRAY') {
                    dropdown = '<li><a href="#" data-mode="HASH">{...}</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>';
                } else if (mode === 'HASH') {
                    dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>'; 
                } else {
                    dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="HASH">{...}</a></li>';
                }
                return template.replace(/:CONTENT/, content).replace(/:DROPDOWN/, dropdown);              
            },
            after_render: function($scope, $target, utilities) {
                $target.next('.dropdown-menu').find('a').off('click.record-switch');
                $target.next('.dropdown-menu').find('a').on('click.record-switch', function() {   
                    var mode = $(this).data('mode');
                    var $composite = $target.closest('.json-value-composite');
                    var value = utilities.empty_value(mode);
                                                            
                    if ($composite.hasClass('json-array-value')) {
                        value.parameters({tag_scalar: default_parameters.tag_array_value})
                             .options({deletable: true});                        
                    }
                    else if ($composite.hasClass('json-hash-value')) {
                        value.parameters({tag_scalar: default_parameters.tag_hash_value})
                             .options({deletable: false});                                                
                    } 
                    
                    $composite.html(value.render()); 
                    utilities.updated($scope);
                });
            }
        },        
        button_del: {
            render: function() {
                return '<span class="input-group-addon btn record-del glyphicon glyphicon-minus-sign invisible"></span>';
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
                var text = mode.toLowerCase();
                return  '<div class="row json-value-row-ctl">' +
                        '<div class="col-xs-10"><button type="button" class="btn record-add" data-mode="' + mode + '">Add to '+
                        text +'</button></div>' +
                        '</div>';
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
            $scope.find('.btn.record-add').each(function() {
                utilities.button_add.after_render($scope, $(this), $(this).data('mode'), utilities);
            });
            $scope.find('.btn.record-del').each(function() {
                utilities.button_del.after_render($scope, $(this)); 
            });
            $scope.find('.btn.record-switch').each(function() {             
                utilities.button_switch.after_render($scope, $(this), utilities); 
            });                   
        },
        eval_composite: function($target) {
            var utility = this;
            var delimiters = $target.children('.json-delimiter');            
            var mode = null;
            if (delimiters.length !== 0) {                              
                mode = delimiters.data('mode');
            }
            if (mode === 'ARRAY') {
                var return_value = [];
                $target.children('.json-value-row').each(function() {
                    $(this).children('.json-value-composite').each(function() {
                        return_value.push(utility.eval_composite($(this)));
                    });
                });
                return return_value;
            } else if (mode === 'HASH') {
                var return_value = {};
                $target.children('.json-value-row').each(function() {
                    var key = $(this).children('.json-hash-key').find('input').val();                    
                    if (key !== '') {
                        return_value[key] = utility.eval_composite($(this).children('.json-hash-value'));
                    }                    
                });
                return return_value;
            } else {       
                return $target.find('input').val();            
            }     
        }
    };

    $.fn.editableJsonInput = function(parameters){
        $.extend(default_parameters, parameters);
        var $input = $(this);
        $input.attr('readonly', 'readonly');
        var jsonValue = new JsonValue($input.val());
        $input.after('<div class="json-value-composite">' +jsonValue.render() +'</div>');
        utilities.updated($input.next('.json-value-composite'));
        $input.parents('form').submit(function() {          
           var $scope = $input.next('.json-value-composite');
           $input.val(JSON.stringify(utilities.eval_composite($scope))) ;
           return false;
        });
    };      
})(jQuery);

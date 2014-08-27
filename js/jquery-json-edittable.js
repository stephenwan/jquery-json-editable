;(function($) {
    var JsonValue = function(value, options) {
        this.decoded = JSON.parse(value);
        this.mode = this.categorizeValue(this.decoded);
        this.options = $.extend({}, options);
    };    
    var utilities = {
        empty : function(mode) {
            if (mode === 'ARRAY')
                return [];
            else if (mode === 'HASH')
                return {};
            else 
                return '';
        },
        render_ARRAY : function(values, options) {
            var template =
                    '<div class="row json-value-row" data-mode="ARRAY">' +             
                    '<div class="col-xs-12 json-array-value json-value-composite">:CONTENT</div>' +
                    '</div>';                                                          
            if ($.isArray(values)) {
                var outputHtml = '';
                for (var i=0; i < values.length; i++) {
                    var value = values[i];                
                    value.options = $.extend(value.options, {tag: 'a', deletable: true, composite: true});
                    outputHtml += template.replace(/:CONTENT/, value.render());
                }
                outputHtml += this.button_add.render('ARRAY');                   
                return this.render_json_delimiter('ARRAY', 'left') + outputHtml + this.render_json_delimiter('ARRAY', 'right', options.appendSeparator);
            } else {               
                return template.replace(/:CONTENT/, this.render_SCALAR('', {tag: 'a', deletable: true, composite: true}));
            }
        },
        render_HASH : function(values, options) {
            var template =
                    '<div class="row json-value-row" data-mode="HASH">' +                   
                    '<div class="col-xs-5 json-hash-key">:CONTENT_KEY</div>' +
                    '<div class="col-xs-7 json-hash-value json-value-composite">:CONTENT_VAL</div>' +
                    '</div>';
            if ($.isPlainObject(values)) {
                var outputHtml = '';
                for (var k in values) {
                    var v = values[k];
                    v.options = $.extend(v.options, {tag: 'v', composite: true});
                    outputHtml += template
                                  .replace(/:CONTENT_KEY/, this.render_SCALAR(k, {tag: 'k', deletable:true}) )
                                  .replace(/:CONTENT_VAL/, v.render());
                }
                outputHtml += this.button_add.render('HASH');                    
                return this.render_json_delimiter('HASH', 'left') + outputHtml + this.render_json_delimiter('HASH', 'right', options.appendSeparator);
            } else {
                return template
                       .replace(/:CONTENT_KEY/, this.render_SCALAR("", {tag: 'k', deletable:true}))
                       .replace(/:CONTENT_VAL/, this.render_SCALAR("", {tag: 'v', composite: true}));
                
            }
        },
        render_SCALAR : function(value, options) {
            var template;
            if (options.hasOwnProperty('composite') && options.composite) {
                template =
                    '<div class="col-xs-12 input-group">' + 
                    this.button_del.render(options['deletable']) +  
                    '<div class="input-group-btn">' +
                    '<span class="btn btn-default dropdown-toggle record-switch" data-toggle="dropdown">' +
                    (options.hasOwnProperty('tag')?options.tag:'-') + 
                    '<span class="caret"></span></span>' +
                    '<ul class="dropdown-menu" role="menu">' +
                    '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="HASH">{...}</a></li>' +        
                    '</ul></div>' +                                       
                    '<input type="text" class="form-control" value=":CONTENT">' +                    
                    '</div>';
            } else {
                template = 
                    '<div class="col-xs-12 input-group">' +
                     this.button_del.render(options['deletable']) +  
                    '<span class="input-group-addon">' + 
                    (options.hasOwnProperty('tag')?options.tag:'-') +
                    '</span>' +    
                    '<input type="text" class="form-control" value=":CONTENT">' + 
                    '</div>';
            }            
            return template.replace(/:CONTENT/, value);
        },
        render_json_delimiter : function(mode, position) {
            var symbol, dropdown;
            var template_left = '<div class="input-group-btn json-delimiter" data-mode="' + mode + '">' +
                    '<button type="button" class="btn btn-default dropdown-toggle record-switch" data-toggle="dropdown">:CONTENT<span class="caret"></span></button>' +
                    '<ul class="dropdown-menu" role="menu">:DROPDOWN</ul>' +
                    '</div>';
            var template_right = '<div class="json-delimiter" data-mode="' + mode + '"><span>:CONTENT</span></div>';
            var template = (position === 'left')?template_left:template_right; 
            
            if (mode === 'ARRAY') {
                symbol = (position === 'left')?'[':']' ;
                dropdown = '<li><a href="#" data-mode="HASH">{...}</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>';
            } else if (mode === 'HASH') {
                symbol = (position === 'left')?'{':'}' ;
                dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="SCALAR">...</a></li>';
            } else {
                symbol = 'scalar';
                dropdown = '<li><a href="#" data-mode="ARRAY">[...]</a></li>' + '<li><a href="#" data-mode="HASH">{...}</a></li>';
            }
            if (symbol) {
                return template.replace(/:CONTENT/, symbol).replace(/:DROPDOWN/, dropdown);
            } else {
                return '';
            }
        },
        button_switch: {
            render: function(mode) {
                
            },
            after_render: function($scope, $target, utilities) {
                $target.next('.dropdown-menu').find('a').off('click.record-switch');
                $target.next('.dropdown-menu').find('a').on('click.record-switch', function() {   
                    var mode = $(this).data('mode');
                    var $composite = $target.closest('.json-value-composite');
                    var tag, deletable;
                    if ($composite.hasClass('json-array-value')) {
                        tag = 'a';
                        deletable = true;
                    }
                    else if ($composite.hasClass('json-hash-value')) {
                        tag = 'v';
                        deletable = false;
                    } else {
                        deletable = false;
                        tag = 'scalar';
                    }                 
                    var html = utilities['render_' + mode](utilities.empty(mode), {tag: tag, deletable: deletable, composite: true});                                
                    $target.closest('.json-value-composite').html(html); 
                    utilities.updated($scope);
                });
            }
        },        
        button_del: {
            render: function(deletable) {
                return deletable?
                '<span class="input-group-addon btn record-del glyphicon glyphicon-minus-sign invisible"></span>':'';
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
                        '<div class="col-xs-10"><button type="button" class="btn record-add" data-mode="' + mode + '">Add to '+ text +'</button></div>' +
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
            $scope.find('.json-delimiter:first-of-type').mousemove(function(){
                $(this).closest('.json-value-composite').addClass('json-value-composite-focused');
            }).mouseleave(function() {
                $(this).closest('.json-value-composite').removeClass('json-value-composite-focused');
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
        }           
    };

    $.fn.editableJsonInput = function(){
        var $input = $(this);
        $input.attr('readonly', 'readonly');
        var jsonValue = new JsonValue($input.val());
        $input.after('<div class="json-value-composite">' +jsonValue.render() +'</div>');
        $scope = $input.next('.json-value-composite');       
        utilities.updated($scope);
        $input.parents('form').submit(function() {          
           var $scope = $input.next('.json-value-composite');
           $input.val(JSON.stringify(utilities.eval_composite($scope))) ;
           return false;
        });
    };      
})(jQuery);

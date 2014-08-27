require.config({
  baseUrl: 'js/lib',
  paths: {
    jquery: 'jquery-1.11.1.min',
    bootstrap: 'bootstrap.min',
    app: '../app'
  }
});


requirejs(['jquery', 'bootstrap', 'jquery-json', 'app/index'],
function($, bootstrap, jj) {
    
    $(function() {
        console.log('page ready');
       
    }) ;             
});
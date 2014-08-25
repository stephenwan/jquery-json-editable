require.config({
  baseUrl: 'js/lib',
  paths: {
    jquery: 'jquery-1.11.1.min',
    bootstrap: 'bootstrap.min',
    app: '../app'
  }
});


requirejs(['jquery', 'bootstrap', 'jquery-json'],
function($, bootstrap, jkv) {
//  $('.jkv').kvJsonInput();
    
})
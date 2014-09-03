# jQuery Json-input editor Plugin

A not so light-weight jQuery plugin that enables web-based editing of Json-value and feeding the result straight into the text input field 
inside a HTML form. 

For a simpler implementation that is capable to edit plain key-value type Json-value, please use  
[jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input) instead.


## Usage

Include the js file after the jQuery library

``` html

<script src="/path/to/jquery-json-editable.js"></script>


```

Link the css file, which is necessary to style the input fields and related controls


``` html

<link rel="stylesheet" type="text/css" href="/path/to/jquery-json-editable.css">


```

Finally enable json-edit for a normal text input field

``` javascript

$('input[name="configDataJson"]).editableJsonInput();


```

 
## Demo

[jsfilddle](http://jsfiddle.net/7m0x29m3/)
[http://mojolite-wecook.rhcloud.com/json](http://mojolite-wecook.rhcloud.com/json)
 


## Configuration

<table>
<th>
<td>parameter</td>
<td>default </td>
<td>description </td>
</th>
<tr>
<td>cancel_form_submit</td><td>false</td><td>Click form button will update the input value but will not submit form. Used for debugging and demo. </td>
</tr>
<tr>
<td>hide_original_input</td><td>false</td><td>Hide the original input field</td>
</tr>
<tr>
<td>lock_original_input</td><td>false</td><td>Change the original input field to read-only </td>
</tr>
<tr>
<td>tag_hash_key</td><td>'hash key'</td><td>Input field place-holder for hash-key</td>
</tr>
<tr>
<td>tag_hash_value</td><td>'hash value'</td><td>Input field place-holder for hash-value</td>
</tr>
<tr>
<td>tag_array_value</td><td>'array value'</td><td>Input field place-holder for array-value</td>
</tr>
<tr>
<td>tag_scalar</td><td>'scalar'</td><td>Input field place-holder for scalar</td>
</tr>
</table>

## Dependency

### jQuery

* Version 1.9.1

Other version should works as well but have not been tested.


## Acknowledgement 

This project is inspired by the [jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input) plugin.
I also want to thank its author for many helpful discussions and technical assistances.



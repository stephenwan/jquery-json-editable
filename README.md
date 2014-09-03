# jQuery Json-input editor Plugin

This is a not so light-weight jQuery plugin that enables web-based editing of Json values. 
The plugin transforms the original text input field that contains a Json string into a group of
editable text input fields which obey and simulate the original Json value structure. 

For a simpler implementation that is capable of editing key-value-like Json value with no nesting, 
please refer to [jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input) instead.


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

$('input[name="configDataJson"']).editableJsonInput();


```

 
## Demo

* (JsFiddle)(http://jsfiddle.net/7m0x29m3/2/)


 


## Configuration

<table>
<tr>
<th>parameter</th>
<th>default </th>
<th>description </th>
</tr>
<tr>
<td>cancel_form_submit</td><td>false</td><td>The form-submit button will trigger input value update instead of form submit. Used for debugging and demo. </td>
</tr>
<tr>
<td>hide_original_input</td><td>false</td><td>Hide the original input field</td>
</tr>
<tr>
<td>lock_original_input</td><td>false</td><td>Turn the original input field to read-only </td>
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

Other versions should work as well but have not been tested.


## Acknowledgement

This project was inspired by [jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input).
I would also like to thank its author for many helpful discussions.


# jQuery Plugin for JSON Value Input 

This is a light-weight jQuery plugin to facilitate editing JSON values inside HTML forms. 
When applied to a text input field with JSON value, it will destructure the JSON and spawn a collection of
extra input fields as JSON leaf-nodes to contain the strings, through which the JSON value in the original field can be modified. These input fields with their affiliated control buttons provide an easy and complete way for editing the JSON value inside HTML forms.

For a simpler implementation that is capable of editing key-value-like JSON value without nesting, 
please use [jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input) instead.


## Usage

Include the js file after the jQuery library

``` html
<script src="/path/to/jquery-json-editable.js"></script>
```

Link the css file, which is necessary to style the input fields and related controls


``` html
<link rel="stylesheet" type="text/css" href="/path/to/jquery-json-editable.css">
```

Now we can switch on json-editor for any text input field that is expected to contain JSON value

``` javascript
$('input[name="configDataJson"']).editableJsonInput();
```

## Demo

* [jsfiddle](http://jsfiddle.net/7m0x29m3/16/)



## Instructions

* Editing the JSON value will cause the editor to refresh itself automatically.
* Edit values in the editor and submit the form to have the JSON value updated inside the target input box.
* Inside the editor, mouseover a row and use the `x` button to remove it.
* Inside the editor, mouseover the green-triangle and use the panel buttons to switch among SCALAR, ARRAY, and HASH values.
* Inside the editor, use the `Add to ...` button to insert a new row.
* The JSON value in the target input field needs to be valid, otherwise the editor will not be rendered.


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

## Known Issue

* Since every scalar value is treated as a string, other valid JSON data types such as 
integer and boolean will be automatically converted into string and the original
type information will be lost.


## Acknowledgement

This project was inspired by [jquery-kv-json-input](https://github.com/whuhacker/jquery-kv-json-input).
I would also like to thank its author for many helpful discussions.


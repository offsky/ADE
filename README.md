## AngularJS Datatype Editors (ADE)

ADE is a bunch of filters and directives for displaying and editing various types of data in an <a href="http://angularjs.org/">AngularJS</a> App.  For example, if you have a unix timestamp that you want to display and make editable, ADE can display a formatted date string and make a popup calendar for editing. 

Try our <a href="http://toodledo.github.com/ADE/index.html">Demo</a>. Take a look at the demo examples in our source files.

ADE currently supports the following datatypes:

- Text (short)
- Text (long)
- URL
- Email Address
- Phone number
- Date
- Date + Time
- Year
- Time
- Money
- Decimal
- Integer
- Percent
- Length
- List (pick one)
- List (pick multiple)
- Rating
- Boolean
- Icon


## Dependencies

All ADE datatypes depend on the following packages:

* angular 1.0.7
* jquery 1.10.2

The following packages are needed by their respective ADE datatypes:

* angular-sanitize 1.0.7: email and url
* bootstrap: date, email, icon, list, phone, rich, time, url
* font-awesome: icon directive
* select2: list directive
* tinymce 4.0.4 (for rich directive only) Use our modified version if you want keyboard commands to work.

The following packages included in ADE were modified to support a variety of use cases. You can use the unmodified packages available in bower, but we have not tested the results yet.

* datejs: date and time
* bootstrap-datepicker: date
* bootstrap-timepicker: time
* select2 (js): list

We are working to reduce external dependencies as much as possible.


## Installation

1) Install ADE using bower:

	bower install ADE

Or download <a href="http://toodledo.github.com/ADE/build/ade-1.2.zip">zip file</a>.

2) Add ADE's css and file to your HTML file:

CSS

	<link rel="stylesheet" href="../bower_components/bootstrap/docs/assets/css/bootstrap.css"/>  
	<link rel="stylesheet" href="../bower_components/ADE/dist/build/ade-0.2.1.min.css"/>

JavaScript

	<script src="../bower_components/jquery/jquery.js"></script>
	<script src="../bower_components/angular/angular.js"></script>
	<script src="../bower_components/angular-sanitize/angular-sanitize.js"></script>

	<script src="../bower_components/ADE/dist/build/ade-0.2.1.min.js"></script>

3) Inject ADE in your angular project:

	var app = angular.module('app', ['ADE', 'ngSanitize']);

4) Use the directives and filters in your HTML:

	<div class="sample" ade-url='{"className":"input-medium"}' ng-model="dataurl" ng-bind-html="dataurl | url"></div>

### Individual datatypes

You can also choose individual ADE datatypes to include in your project. Take a look at the example source files to know which files to include.

The decimal, integer, money and percent ADE datatypes require the number directive. This directive is available at "app/common/number_directive.js". The email, phone and url ADE datatypes require the url direcive. This directive is available at "app/common/number_directive.js".

* number: decimal, integer, money and percent
* url: email, phone and url


## Build

You can build the project for your specific use case. For example, you may want to pick several components and have their minifed/uglified result available in dist/build.

1. Install node and grunt on your system
2. Install node modules by running "npm install"
3. Run our build script "scripts/build.sh"


## Licence

ADE is freely distributable under the terms of the MIT license.
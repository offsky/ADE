## AngularJS Datatype Editors (ADE)

ADE is a bunch of filters and directives for displaying and editing various types of data in an <a href="http://angularjs.org/">AngularJS</a> App.  For example, if you have a unix timestamp that you want to display and make editable, ADE can display a formatted date string and make a popup calendar for editing. 

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

<a href="http://toodledo.github.com/ADE/index.html">Demo</a>


## Dependencies

### External Dependencies

We are working to reduce external dependencies as much as possible.

#### All components

* angular 1.0.7
* jquery 1.10.2

#### Component specific

* angular-sanitize 1.0.7
* bootstrap: date, email, icon, list, phone, rich, time, url
* font-awesome: icon directive
* select2: list directive
* tinymce 4.0.4 (for rich directive only) Use our modified version if you want keyboard commands to work.

#### Modified packages

The following packages included in ADE were modified to support a variety of use cases. You can use the unmodified packages available in bower, but we have not tested the results yet.

* datejs: date and time
* bootstrap-datepicker: date
* bootstrap-timepicker: time
* select2 (js): list

### Internal Dependencies (available in common directory)

* number: decimal, integer, money and percent
* url: email, phone and url


## Installation

1) Install ADE using bower:

	bower install ADE

Or download <a href="http://toodledo.github.com/ADE/build/ade-1.2.zip">zip file</a>.

2) Add ADE, and its appropriate dependencies, to your HTML file:

CSS

	<link rel="stylesheet" href="../bower_components/bootstrap/docs/assets/css/bootstrap.css"/>  
	<link rel="stylesheet" href="../common/ade.css"/>

JavaScript

	<script src="../bower_components/jquery/jquery.js"></script>
	<script src="../bower_components/angular/angular.js"></script>
	<script src="../bower_components/angular-sanitize/angular-sanitize.js"></script>
	<script src="../common/ade.js"></script>

	<script src="../common/url_directive.js"></script>
	<script src="url_filters.js"></script>

3) Inject ADE in your angular project

	var app = angular.module('app', ['ADE', 'ngSanitize']);

4) Use the directives and filters

	<div class="sample" ade-url='{"className":"input-medium"}' ng-model="dataurl" ng-bind-html="dataurl | url"></div>


## Build

You can build the project for your specific use case. For example, you may want to pick several components and have their minifed/uglified result available in dist/build.

1. Install node and grunt on your system
2. Install node modules by running "npm install"
3. Run our build script "scripts/build.sh"


## Licence

ADE is freely distributable under the terms of the MIT license.
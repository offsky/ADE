/* =========================================================
	Modifications made by https://github.com/Toodledo/ADE

	1) Added comments so I could better understand the code
	2) Better handling for case where no date is preset
	3) Allows canceling of the calendar without setting a date
	4) Enabled full text parsing of unrecognized dates via an external date.js library.
		So you can type "next week" and it should work
	5) Got rid of date formatting and allowed caller to take care of this
	6) Method for destroying the calendar DOM object
	7) Remove unnecessary changeDate events
	8) Added wasClick boolean to event so we can tell how the date was changed
	9) Supresses notifications when nothing actually changed
	10) Make full screen on small windows
	11) Get popup calendar to position correctly on resize/scroll of window
 * ========================================================= */


/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function($) {

	//Initialization
	var Datepicker = function(element, options) {
		this.element = $(element);
		this.picker = $(DPGlobal.template)
							.appendTo('body')
							.on({
								click: $.proxy(this.click, this),
								touchend: $.proxy(this.touched, this),
								mousedown: $.proxy(this.mousedown, this)
							});
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

		if (this.isInput) {
			this.element.on({
				focus: $.proxy(this.show, this),
				blur: $.proxy(this.hide, this),
				keyup: $.proxy(this.update, this)
			});
		} else {
			if (this.component) {
				this.component.on('click', $.proxy(this.show, this));
			} else {
				this.element.on('click', $.proxy(this.show, this));
			}
		}
		this.minViewMode = options.minViewMode || this.element.data('date-minviewmode') || 0;
		if (typeof this.minViewMode === 'string') {
			switch (this.minViewMode) {
				case 'months':
					this.minViewMode = 1;
					break;
				case 'years':
					this.minViewMode = 2;
					break;
				default:
					this.minViewMode = 0;
					break;
			}
		}
		this.viewMode = options.viewMode || this.element.data('date-viewmode') || 0;
		if (typeof this.viewMode === 'string') {
			switch (this.viewMode) {
				case 'months':
					this.viewMode = 1;
					break;
				case 'years':
					this.viewMode = 2;
					break;
				default:
					this.viewMode = 0;
					break;
			}
		}
		this.startViewMode = this.viewMode;
		this.weekStart = options.weekStart || this.element.data('date-weekstart') || 0;
		this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
		this.onRender = options.onRender;
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		show: function(e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			$(window).off('resize.boot');
			$(window).on('resize.boot', $.proxy(this.place, this));
			$(document).off('scroll.boot');
			$(document).on('scroll.boot', $.proxy(this.place, this));
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			if (!this.isInput) {
				$(document).off('mousedown.boot');
				$(document).on('mousedown.boot', $.proxy(this.hide, this));
			}
			$(document).off('touchstart.boot');
			$(document).on('touchstart.boot', $.proxy(this.touchstart, this));

			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},

		//Added to support touch devices like iOS
		touchstart: function() {
			// console.log("touchstart");
			$(document).off('touchmove.boot');
			$(document).off('touchend.boot');
			$(document).on('touchend.boot', $.proxy(this.touchend, this));
			$(document).on('touchmove.boot', function() {
				//if we moved, its not a touch anymore, so cancel the touchend
				// console.log("touchmove");
				$(document).off('touchmove.boot');
				$(document).off('touchend.boot');
			});
		},

		touchend: function() {
			$(document).off('touchmove.boot');
			$(document).off('touchend.boot');

			// console.log("touchend",this.touchTimeout);
			var that = this;
			if(this.touchTimeout) { //double tap 
				//cancel previous and do nothing. Allow OS to zoom
				// console.log("double clear");
				clearTimeout(this.touchTimeout);
				this.touchTimeout = false;
				return;
			}	
			this.touchTimeout = setTimeout(function() {
				// console.log("touch timeout");
				if(that.isInput) {
					that.element.blur();
				} else {
					that.hide();
				}
				that.touchTimeout = false;
			},350); //wait a little bit (at least 300ms) before bluring to allow a valid touch to cancel the blur
		},

		hide: function() {
			// console.log("hide");
			this.picker.hide();
			$(window).off('resize.boot');
			$(document).off('scroll.boot');
			this.viewMode = this.startViewMode;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown.boot');
			}
			$(document).off('touchstart.boot');
			$(document).off('touchend.boot');
			$(document).off('touchmove.boot');

			this.wasClick=false;
			this.set();
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},

		//You can pass in the event when a return key is pressed on the parent input
		//and use this to hide the calendar the first time it is pressed
		//the second time it is pressed it will do the default action (submit form perhaps)
		typedReturn: function(e) {
			if(this.picker.is(':visible')) {
				e.preventDefault();
				e.stopPropagation();
				this.hide();
			}
		},

		remove: function() {
			this.picker.remove();
		},

		//value is set by clicking, on hide, or external setting
		set: function() {

			if(this.touchTimeout) { //cancel the touch timeout because we don't want to blur for this touch
				// console.log("set clear");
				clearTimeout(this.touchTimeout);
				this.touchTimeout = false;
			}

			// var returnObj = [];
			// if (this.date) {
			//  	returnObj = [this.date.getTime(), this.date.getTime()-this.date.getTimezoneOffset()*60000, this.date.getTimezoneOffset()];
			// } else {
			//   	returnObj = null;
			// }

			this.element.trigger({
				type: 'changeDate',
				date: this.date ? this.date.getTime() : null,
				wasClick: this.wasClick
				//date: returnObj
			});
			return;
		},

		//a public function to programatically update the selected date
		setValue: function(newDate) {
			this.wasClick = false;
			var oldDate = this.date;

			if (!newDate) {
				this.date = null;
			} else if (typeof newDate === 'string') {
				this.date = DPGlobal.parseDate(newDate);
			} else {
				this.date = new Date(newDate * 1000);
			}
			
			if(!oldDate || !this.date || oldDate.getTime()!=this.date.getTime()) {
				// console.log("setValue",oldDate,this.date);
				this.set(); //only set if it has changed
			}

			if (newDate && this.date) {
				this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			} else {
				this.viewDate = new Date();
			}
			this.fill();
		},

		//place the popup in the proper place on the screen
		place: function() {
			var offset = this.component ? this.component.offset() : this.element.offset();
			var windowW = $(window).width();
			var scroll = $(window).scrollLeft();

			this.picker.removeClass("rarrow");
			if(windowW<=480) {
				offset.left = scroll+5;
			} else {
				var pickerRight = offset.left + this.picker[0].offsetWidth;

				//Move to the left if it would be off the right of page
				if (pickerRight-scroll > windowW) {
					offset.left = offset.left - this.picker[0].offsetWidth + 30;
					this.picker.addClass("rarrow");
				}
			}
			this.picker.css({ top: offset.top + this.height, left: offset.left });
			
			//flip up top if off bottom of page
			var windowH = $(window).height();
			var scroll = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
			var pickerHeight = this.picker[0].offsetTop + this.picker[0].offsetHeight;

			if (pickerHeight - scroll > windowH) {
				this.picker.css({
					top: offset.top - this.picker[0].offsetHeight - 5
				}).addClass("flipped");
			} else {
       	 	this.picker.removeClass("flipped");
      	}
		},

		//each time a keystroke is fired on the input
		update: function(newDate) {
			this.date = DPGlobal.parseDate(
				typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date'))
			);

			if (this.date) {
				this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			} else {
				this.viewDate = new Date();
			}
			this.fill();
		},

		//draws the days of week
		fillDow: function() {
			var dowCnt = this.weekStart;
			var html = '<tr>';
			while (dowCnt < this.weekStart + 7) {
				html += '<th class="dow">' + DPGlobal.dates.daysMin[(dowCnt++) % 7] + '</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		//draws the month picker
		fillMonths: function() {
			var html = '';
			var i = 0;
			while (i < 12) {
				html += '<span class="month">' + DPGlobal.dates.monthsShort[i++] + '</span>';
			}
			this.picker.find('.datepicker-months td').append(html);
		},

		//redraws the calendar
		fill: function() {
			var d = new Date(this.viewDate);
			var year = d.getFullYear();
			var month = d.getMonth();
			var today = new Date();
			var todayDay = today.getDate();
			var todayMonth = today.getMonth();

			//set currentDate to timestamp of date without time component
			var currentDate = null;
			if (this.date) {
				currentDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()).valueOf();
			}

			// console.log("fill",currentDate);

			this.picker.find('.datepicker-days th:eq(1)').text(DPGlobal.dates.months[month] + ' ' + year); //updates the calendar month/year title

			//setup previous and next month objects for edges of calendar
			var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0);
			var day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			prevMonth.setDate(day); //sets to last day of the month
			prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7) % 7); //moves it back to the begining of this week
			var nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42); //42 is the number of cells displayed on the calendar
			nextMonth = nextMonth.valueOf(); //sets to unix timestamp to the last visible day in the calendar
			var html = [];
			var clsName,
				prevY,
				prevM;
			while (prevMonth.valueOf() < nextMonth) { //loop through first day to last day of visible days
				if (prevMonth.getDay() === this.weekStart) {
					html.push('<tr>');
				}
				clsName = this.onRender(prevMonth);
				prevY = prevMonth.getFullYear();
				prevM = prevMonth.getMonth();
				if ((prevM < month &&  prevY === year) ||  prevY < year) {
					clsName += ' old';
				} else if ((prevM > month && prevY === year) || prevY > year) {
					clsName += ' new';
				}
				if (prevMonth.valueOf() === currentDate) {
					clsName += ' active';
				}
				if (prevMonth.getMonth() === todayMonth && prevMonth.getDate() === todayDay) {
					clsName += ' today';
				}
				html.push('<td class="day' + clsName + '">' + prevMonth.getDate() + '</td>');
				if (prevMonth.getDay() === this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate() + 1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			//updates month picker
			var currentYear = this.date ? this.date.getFullYear() : null;
			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear === year) {
				var currentMonth = this.date ? this.date.getMonth() : null;
				if (currentMonth) months.eq(currentMonth).addClass('active');
			}

			//updates year picker
			html = '';
			year = parseInt(year / 10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + '">' + year + '</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		touched: function(e) {
			// console.log("touched",e);
			this.click(e);
		},

		//updates the calendar's state and selected value and sends the message that the value changed
		click: function(e) {
			// console.log("click",e);
			e.stopPropagation();
			e.preventDefault();

			if(this.touchTimeout) { //cancel the touch timeout because we don't want to blur for this touch
				// console.log("click clear");
				clearTimeout(this.touchTimeout);
				this.touchTimeout = false;
			}

			var target = $(e.target).closest('span, td, th');
			if (target.length === 1) {
				switch (target[0].nodeName.toLowerCase()) {
					case 'th':
						switch (target[0].className) {
							case 'switch': //clicked on the month/year to enter the switcher
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								this.viewDate['set' + DPGlobal.modes[this.viewMode].navFnc].call(
									this.viewDate,
									this.viewDate['get' + DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) +
									DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
								);
								this.fill();
								this.set();
								break;
						}
						break;
					case 'span':
						if (target.is('.month')) {
							var month = target.parent().find('span').index(target);
							this.viewDate.setMonth(month);
						} else {
							var year = parseInt(target.text(), 10) || 0;
							this.viewDate.setFullYear(year);
						}
						if (this.viewMode !== 0) {
							this.date = new Date(this.viewDate);
							// ADE: Dont need this hear because it happens in set() three lines down
							// this.element.trigger({
							// 	type: 'changeDate',
							// 	date: this.date,
							// 	viewMode: DPGlobal.modes[this.viewMode].clsName
							// });
						}
						this.wasClick = true;
						this.showMode(-1);
						this.fill();
						this.set();
						break;
					case 'td':
						if (target.is('.day')) {
							var day = parseInt(target.text(), 10) || 1;
							var month = this.viewDate.getMonth();
							if (target.is('.old')) {
								month -= 1;
							} else if (target.is('.new')) {
								month += 1;
							}
							var year = this.viewDate.getFullYear();
							var oldDate = this.date;
							this.date = new Date(year, month, day, 0, 0, 0, 0);
							this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);
							this.wasClick = true;
							this.fill();
							
							if(!oldDate || oldDate.getTime()!=this.date.getTime()) {
								// console.log("click",oldDate,this.date);
								this.set(); //only set if it has changed
							}
					 		// ADE: Dont need this hear because it happens in set() one line up
							//this.element.trigger({
							//	type: 'changeDate',
							//	date: this.date,
							//	viewMode: DPGlobal.modes[this.viewMode].clsName
							//});
						}
						break;
				}
			}
		},

		mousedown: function(e) {
			// console.log("mousedown");
			e.stopPropagation();
			e.preventDefault();
		},

		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
		}
	};

	$.fn.datepicker = function(option, val) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data) {
				$this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults, options))));
			}
			if (typeof option === 'string') data[option](val);
		});
	};

	$.fn.datepicker.defaults = {
		onRender: function(date) {
			return '';
		}
	};
	$.fn.datepicker.Constructor = Datepicker;

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		dates: {
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		isLeapYear: function(year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		
		parseFormat: function(format){
			var separator = format.match(/[.\/\-\s].*?/),
				parts = format.split(/\W+/);
			if (!separator || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separator: separator, parts: parts};
		},
		
		//attemps to parse the incoming date into day, month and year.
		parseDate: function(dateStr) {
			if (!dateStr) return null;
			var date = new Date.parse(dateStr);
			if(typeof date.getTime === "undefined") date = new Date();

			if(!date) return null;
			return date;
		},

		//templates for making the calendar HTML
		headTemplate: '<thead>' +
							'<tr>' +
								'<th class="prev">&lsaquo;</th>' +
								'<th colspan="5" class="switch"></th>' +
								'<th class="next">&rsaquo;</th>' +
							'</tr>' +
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
	};
	DPGlobal.template = '<div class="datepicker dropdown-menu">' +
							'<div class="datepicker-days">' +
								'<table class=" table-condensed">' +
									DPGlobal.headTemplate +
									'<tbody></tbody>' +
								'</table>' +
							'</div>' +
							'<div class="datepicker-months">' +
								'<table class="table-condensed">' +
									DPGlobal.headTemplate +
									DPGlobal.contTemplate +
								'</table>' +
							'</div>' +
							'<div class="datepicker-years">' +
								'<table class="table-condensed">' +
									DPGlobal.headTemplate +
									DPGlobal.contTemplate +
								'</table>' +
							'</div>' +
						'</div>';

}(window.jQuery);

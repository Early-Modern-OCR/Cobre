/*!
 * jQuery.SerialScroll
 * Copyright (c) 2007-2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 06/14/2009
 *
 * @projectDescription Animated scrolling of series.
 * @author Ariel Flesler
 * @version NA
 *
 * @id jQuery.serialScroll
 * @id jQuery.fn.serialScroll
 * @param {Object} settings Hash of settings, it is passed in to jQuery.ScrollTo, none is required.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @link {http://flesler.blogspot.com/2008/02/jqueryserialscroll.html Homepage}
 *
 * Notes:
 *	- The plugin requires jQuery.ScrollTo.
 *	- The hash of settings, is passed to jQuery.ScrollTo, so its settings can be used as well.
 *
 * - Heavily modified on 2010/09/27 for local use
 */
;(function( $ ){

	var $serialScroll = $.serialScroll = function( settings ){
		return $(window).serialScroll( settings );
	};

	// Many of these defaults, belong to jQuery.ScrollTo, check it's demo for an example of each option.
	// @link {http://demos.flesler.com/jquery/scrollTo/ ScrollTo's Demo}
	$serialScroll.defaults = {// the defaults are public and can be overriden.
		duration:1000, // how long to animate.
		axis:'x', // which of top and left should be scrolled
		event:'click', // on which event to react.
		step:1, // how many elements to scroll on each action
		lock:true,// ignore events if already animating
		cycle:true, // cycle endlessly ( constant velocity )
		constant:true, // use contant speed ?
		autostart:false // autostart the animation, requires interval to be set
		/*
		start:null, // first element (zero-based index)
		navigation:null,// if specified, it's a selector a collection of items to navigate the container
		target:window, // if specified, it's a selector to the element to be scrolled.
		interval:0, // it's the number of milliseconds to automatically go to the next
		lazy:false,// go find the elements each time (allows AJAX or JS content, or reordering)
		stop:false, // stop any previous animations to avoid queueing
		force:false,// force the scroll to the first element on start ?
		jump: false,// if true, when the event is triggered on an element, the pane scrolls to it
		items:null, // selector to the items (relative to the matched elements)
		prev:null, // selector to the 'prev' button
		next:null, // selector to the 'next' button
		onBefore: function(){}, // function called before scrolling, if it returns false, the event is ignored
		exclude:0 // exclude the last x elements, so we cannot scroll past the end
		*/
	};
	
	var methods = {
		init : function( options ) {
			return this.each(function(){
				var settings = $.extend({}, $serialScroll.defaults, options);
				
				var	
					context = settings.target ? this : document, // if a target is specified, then everything's relative to 'this'.
					$pane = $(settings.target || this, context),// the element to be scrolled (will carry all the events)
					pane = $pane[0], // will be reused, save it into a variable
					items = settings.items, // will hold a lazy list of elements
					active = settings.start, // active index
					auto = settings.interval, // boolean, do auto or not
					nav = settings.navigation, // save it now to make the code shorter
					timer; // holds the interval id
				
				if (typeof $pane.data('serialScroll') != 'undefined') return;
				
				var data = {
					settings: settings,
					active: 0,
					context: pane,
					container: $pane,
					timer: null,
					items: null,
					bound: false,
					auto: false
				};
				
				if (settings.autostart) {
					data.auto = true;
					if (typeof settings.start == 'undefined' || settings.start !== null) settings.start = 0;
				}
				
				$pane.data('serialScroll', data);
				
				$pane.bind('goto.serialScroll', function(event, target) {
					event.preventDefault();
					var n,
						duration=data.settings.duration;
					
					// No target argument, pull target from the event data if available
					if (typeof target != 'number') {
						if (typeof event.data == 'number') {
							target = event.data;
						} else {
							throw "jump called with no target index";
						}
					}
					
					var items = $pane.serialScroll('items');
					if (typeof data.settings.exclude == 'number') items = items.slice(0,-data.settings.exclude);
					var element = items[target],
						limit = items.length;
					
					if( !element ){ // exceeded the limits
						n = target < 0 ? 0 : limit - 1;
						if( data.active != n ) {
							// we exceeded for the first time
							target = n;
						}
						else if( !data.settings.cycle ) {
							// this is a bad case
							if ( data.auto ) {
								$pane.trigger('stop.serialScroll');
							}
							return;
						} else {
							target = limit - n - 1;// invert, go to the other side
						}
						element = items[target];
					}
					
					if( data.auto && data.settings.interval ) {
						if (data.timer) clearTimeout(data.timer);
						data.timer = setTimeout( function() {$pane.trigger('next');}, data.settings.interval ); 
					}
					
					if( !element || data.settings.lock && $pane.is(':animated') || // no animations while busy
						event && data.settings.onBefore &&
						data.settings.onBefore(event, element, $pane, $pane.serialScroll('items'), target) === false ) return;
					
					var onbefore = $.Event('onbefore.serialScroll');
					$pane.trigger(onbefore, [event, element, target]);
					if (onbefore.isDefaultPrevented()) return;
					
					if( data.settings.stop )
						$pane.queue('fx',[]).stop();// remove all its animations
	
					if( data.settings.constant )
						duration = Math.abs(duration/data.settings.step * (data.active - target ));// keep constant velocity
					
					$pane.scrollTo(element, duration, data.settings);
					$pane.trigger('notify.serialScroll', [target]);
				});
				
				$pane.bind('move.serialScroll', function(event, delta) {
					if (typeof delta != 'number') {
						if (typeof event.data != 'number') {
							throw 'move triggered with no delta specified';
						}
						delta = event.data;
					}
					
					event.type = 'goto.serialScroll';
					
					return $(this).trigger(event, [delta + data.active]);
				});
				
				$pane.bind('prev.serialScroll', function(event) {
					if (typeof event != 'undefined') {
						event.type = 'move.serialScroll';
						return $(this).trigger(event, [-data.settings.step]);
					} else {
						return $(this).trigger('move.serialScroll', [-data.settings.step]);
					}
				});
				
				$pane.bind('next.serialScroll', function(event) {
					if (typeof event != 'undefined') {
						event.type = 'move.serialScroll';
						return $(this).trigger(event, [data.settings.step]);
					} else {
						return $(this).trigger('move.serialScroll', [data.settings.step]);
					}
				});
				
				$pane.bind('start.serialScroll', function( event ) {
					if (typeof data.settings.interval == 'undefined') {
						throw "An interval must be set before starting auto scrolling";
					}
					
					if (!data.auto && data.settings.interval) {
						if (data.timer) {
							clearTimeout(data.timer);
							data.timer = null;
						}
						data.auto = true;
						$(this).trigger('next');
					}
					return this;	
				});
				
				$pane.bind('stop.serialScroll', function ( event ) {
					if (data.timer) {
						clearTimeout(data.timer);
						data.timer = null;
					}
					data.auto = false;
					return this;	
				});
				
				$pane.bind('notify.serialScroll', function( event, element ) {
					if (typeof element == 'undefined') {
						if (typeof event.data == 'undefined') {
							throw "notify triggered with no target element specified";
						}
						element = event.data;
					}
					
					element = $pane.serialScroll('index', element);
					
					if (element > -1) data.active = element;
					
					return this;
				});
								
				if (typeof settings.start != 'undefined' && settings.start !== null) {
					$pane.trigger('goto', settings.start);
				}
				
				if (typeof settings.prev != 'undefined') {
					$pane.find(settings.prev).bind(settings.event, function(event) {
						event.preventDefault();
						$pane.trigger('prev.serialScroll');
					});
				}
				
				if (typeof settings.next != 'undefined') {
					$pane.find(settings.next).bind(settings.event, function(event) {
						event.preventDefault();
						$pane.trigger('next.serialScroll');
					});
				}
			});
		},
		data: function() {
			if (typeof this.data('serialScroll') == 'undefined') {
				throw "serialScroll has not been initialized yet";
			}
			return this.data('serialScroll');
		},
		current: function() {
			return this.serialScroll('data').active;
		},
		interval: function( value ) {
			if (typeof value == 'number') {
				$(this).serialScroll('data').settings.interval = value;
			}
			return $(this).serialScroll('data').settings.interval;
		},
		jump: function( target ) {
			this.trigger('goto.serialScroll', target);
		},
		items: function( selector ) {
			var data = this.serialScroll('data');
			
			if (typeof selector == 'string') {
				data.settings.items = selector;
				if (!data.settings.lazy) data.items = $(selector, data.context);
				else data.items = null;
			}
			
			if (data.items) return data.items;
			
			return $(data.settings.items, data.context);
		},
		index: function ( element ) {
			if (typeof element == 'number') return element;
			var i,
				data = this.serialScroll('data'),
				items = this.serialScroll('items');
			
			while(( i = items.index(element)) == -1 &&
					element != data.context )// see if it matches or one of its ancestors
				element = element.parentNode;
			return i;
		},
		notify: function( element ) {
			return this.trigger('notify.serialScroll', element);
		},
		move: function( delta ) {
			return this.trigger('move.serialScroll', [delta]);
		},
		next: function( ) {
			return this.trigger('next.serialScroll');
		},
		previous: function( event ) {
			return this.trigger('prev.serialScroll');
		},
		start: function( ) {
			return this.trigger('start.serialScroll');
		},
		stop: function( ) {
			return this.trigger('stop.serialScroll');
		}
	};
	
	$.fn.serialScroll = function( method ){
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.serialScroll' );
		}
	};

})( jQuery );
(function($) {
	var lockedOnBeforeHandler = function(event, baseEvent, element, target) {
		var $this = $(this);
		
		if (!baseEvent.relatedTarget && $this.filmstrip('data').locked) {
			var others = $this.parent().siblings('div.filmstripWrapper').find('div.filmstrip');
			var offset = target - $this.serialScroll('current');
			var relatedTarget = this;
			
			others.each(function() {
				var oevent = $.Event('move.serialScroll');
				oevent.relatedTarget = relatedTarget;
				$(this).trigger(oevent, offset);
			});
		}
	};
	
	var lock = function(event) {
		event.preventDefault();
		$(this).parent().filmstrip('lock');
	};
	
	var unlock = function(event) {
		event.preventDefault();
		$(this).parent().filmstrip('unlock');
	};
	
	var unlockedHandler = function(event) {
		var $this = $(this),
			link = $this.find('a.lockable');
		
		$this.removeClass('locked');
		$this.addClass('unlocked');
		
		link.unbind('click', unlock);
		link.bind('click', lock);
		
		link.removeClass('unlock');
		link.addClass('lock');
		link.text('Lock');
		link.attr('title','Lock the filmstrips');
	};
	
	var lockedHandler = function(event) {
		var $this = $(this),
			link = $this.find('a.lockable');
		
		$this.removeClass('unlocked');
		$this.addClass('locked');
		
		link.unbind('click', lock);
		link.bind('click', unlock);
		
		link.removeClass('lock');
		link.addClass('unlock');
		link.text('Unlock');
		link.attr('title','Unlock the filmstrips');
	};
	
	var lockHandler = function(event) {
		var $this = $(this),
			filmstrips = $this.find('.filmstripWrapper > div.filmstrip'),
			i=0;
		
		for (i=0; i < filmstrips.length; i++) {
			$(filmstrips[i]).filmstrip('data').locked = true;
		}
		
		$this.trigger('locked.filmstrip');
	};
	
	var unlockHandler = function(event) {
		var $this = $(this),
			filmstrips = $this.find('.filmstripWrapper > div.filmstrip'),
			i=0;
		
		for (i=0; i < filmstrips.length; i++) {
			$(filmstrips[i]).filmstrip('data').locked = false;
		}
		
		$this.trigger('unlocked.filmstrip');
	};
	
	var startHandler = function(event) {
		event.preventDefault();
		var e = $(this);
		e.unbind('click', startHandler);
		e.bind('click', stopHandler);
		e.parents('div.filmstripWrapper').find('div.filmstrip').filmstrip('start');
	};
	
	var stopHandler = function(event) {
		event.preventDefault();
		var e = $(this);
		e.unbind('click', stopHandler);
		e.bind('click', startHandler);
		e.parents('div.filmstripWrapper').find('div.filmstrip').filmstrip('stop');
	};
	
	var methods = {
		init : function( options ) { 
			var settings = {
				buttons: true,
				slider: true,
				mousewheel: true,
				global: true,
				lockable: true,
				slideshow: true,
				synchronizable: true,
				scrollSettings: {},
				offset: 1,
				autoExclude: true,
				locked: false,
				statusDisplay: true,
				sizeClass: null,
				sizeSelection: true,
				sizeOptions: [{klass: 'small', title: 'Small'},
				              {klass: 'medium', title: 'Medium'},
				              {klass: 'large', title: 'Large'}]
			};
			
			var scrollSettings = {
				items: 'li',
				jump: false,
				autostart: false,
				lock: false,
				stop: true,
				force: false,
				cycle: false,
				duration: 10,
				interval: 1000,
				easing: 'swing'
			}
			
			if (this.length == 0) return this;
			
			this.addClass('filmstrip');
			
			if (this.length == 1) settings.global = false; 
			
			if (typeof options == 'object') {
				$.extend(settings, options);
				if (typeof options.serialScroll == 'object') {
					$.extend(scrollSettings, options.serialScroll);
				}
			}
			
			if (settings.global) {
				this.wrapAll('<div class="filmstripsWrapper" />');
				var container = this.parent();
				container.append('<div class="globalFilmstripControls" />');
				
				if (settings.sizeClass) container.addClass(settings.sizeClass);
			}
			
			this.wrap('<div class="filmstripWrapper"><div class="filmstrip" /></div>');
			this.parent().data('filmstrip', {settings: settings, scrollSettings: scrollSettings});
			this.parent().after('<div class="filmstripControls" />');
			
			if (settings.sizeClass) {
				this.parent().addClass(settings.sizeClass);
				this.parents('.filmstripWrapper').addClass(settings.sizeClass);
			}
			
			if (settings.buttons) {
				this.parents('.filmstripWrapper').prepend('<a href="#" class="prev">&nbsp;</a><a href="#" class="next">&nbsp;</a>');
				
				this.parents('.filmstripWrapper').find('a.prev').click(function() {
					$(this).siblings('.filmstrip').trigger('prev.serialScroll');
					return false;
				});
				this.parents('.filmstripWrapper').find('a.next').click(function() {
					$(this).siblings('.filmstrip').trigger('next.serialScroll');
					return false;
				});
			}
			
			if (settings.slider) {
				this.parent().bind('onbefore.serialScroll', function(event, baseEvent, element, target) {
					$(this).parent().find('.slider').slider('value', target);
					return true;
				});
				
				this.each(function(offset, element) {
					element = $(element);
					var slider = $('<div class="slider" />');
					element.parents('.filmstripWrapper').find('.filmstripControls').prepend(slider);
					slider.after('<div class="clear" />');
					var max = element.children().length - 1;
					if (typeof scrollSettings.exclude == 'number') max -= scrollSettings.exclude;
					
					slider.slider({
						max: max,
						slide: function(event, ui) {
							$(this).parents('.filmstripWrapper').find('div.filmstrip').trigger('goto', [ui.value]);
						}
					});
				});
				
				if (typeof container != 'undefined') {
					container.bind('locked.filmstrip', function(event) {
						var $this = $(this), active=-1, current=-1, i, length=-1,
							filmstrips=$this.find('.filmstripWrapper > div.filmstrip'),
							filmstrip=null;
						
						if (filmstrips.length < 2) return false;
						
						for (i=0; i < filmstrips.length; i++) {
							filmstrip = $(filmstrips[i]);
							current = filmstrip.serialScroll('current');
							if (active > -1 && current != active) {
								return false;
							} else if (length > -1 && length != filmstrip.serialScroll('items').length) {
								return false;
							} else if (active == -1) {
								active = current;
							}
						}
						
						$this.find('.filmstripWrapper .slider:not(:last)').hide();
					});
					
					container.bind('unlocked.filmstrip', function(event) {
						$(this).find('.filmstripWrapper .slider').show();
					});
				}
			}
			
			if (settings.sizeSelection) {
				var controls = '';
				
				for (var i=0; i < settings.sizeOptions.length; i++) {
					controls += '<a href="#'+settings.sizeOptions[i].klass + '" \
						class="resizer ' + settings.sizeOptions[i].klass + '" \
						title="Change size to ' + settings.sizeOptions[i].title + '"\
						>' + settings.sizeOptions[i].title + '</a>';
				}
				
				if (settings.global) {
					container.find('.globalFilmstripControls').append(controls);
					
				} else {
					this.parents('.filmstripWrapper').find('.filmstripControls').append(controls);
				}
				
				$('.filmstripControls .resizer, .globalFilmstripControls .resizer').live('click',function(event) {
					event.preventDefault();
					$(this).parent().parent().find('div.filmstrip').filmstrip('resize',$(this).attr('href').substring(1));
				});
			}
			
			if (settings.mousewheel) {
				this.mousewheel(function(event, delta) {
					event.preventDefault();
					if (delta > 0) $(this).trigger('prev.serialScroll');
					else if (delta < 0) $(this).trigger('next.serialScroll');
				});
			}
			
			this.parent().serialScroll(scrollSettings);
			this.parent().filmstrip('resize');
			
			if (settings.global && settings.lockable) {
				container.find('.globalFilmstripControls').append('<a href="#" class="lock lockable" title="Lock the filmstrips">Lock</a>');
				
				container.find('.lock').bind('click',lock);
				
				this.bind('lock.filmstrip',function(event) {
					container.trigger('lock.filmstrip');
				});
				
				this.bind('unlock.filmstrip', function(event) {
					container.trigger('unlock.filmstrip');
				});
				
				this.parent().bind('lock.filmstrip',function(event) {
					container.trigger('lock.filmstrip');
				});
				
				this.parent().bind('unlock.filmstrip',function(event) {
					container.trigger('unlock.filmstrip');
				});
				
				container.bind('lock.filmstrip', lockHandler);
				container.bind('unlock.filmstrip', unlockHandler);
				container.bind('locked.filmstrip', lockedHandler);
				container.bind('unlocked.filmstrip', unlockedHandler);
				
				this.parent().bind('onbefore.serialScroll', lockedOnBeforeHandler);
			}
			
			if (settings.global && settings.synchronizable) {
				var controls = this.parents('.filmstripWrapper').find('.filmstripControls');
				
				controls.append('<a href="#" class="synchronize" title="Synchronize to this filmstrip">Synchronize to this filmstrip</a>');
				
				controls.find('.synchronize').click(function(event) {
					event.preventDefault();
					var wrapper = $(this).parents('div.filmstripWrapper');
					var filmstrip = wrapper.find('div.filmstrip');
					var others = wrapper.siblings('div.filmstripWrapper').find('div.filmstrip');
					var current = filmstrip.serialScroll('current');
						
					others.each(function(i, element) {
						$(element).serialScroll('jump', current);
					});
				});
				
				container.bind('locked.filmstrip', function(event) {
					$(this).find('.synchronize').hide();
				});
				container.bind('unlocked.filmstrip', function(event) {
					$(this).find('.synchronize').show();
				});
			}
			
			if (settings.slideshow) {
				var controls = this.parents('.filmstripWrapper').find('.filmstripControls');
				
				if (!scrollSettings.autostart) {
					controls.append('<a href="#" class="slideshowControl start">Start</a>');
					controls.find('.slideshowControl').bind('click', startHandler);
				} else {
					controls.append('<a href="#" class="slideshowControl stop">Stop</a>');
					controls.find('.slideshowControl').bind('click', stopHandler);
				}
				
				controls.append('<div class="slideshowSpeedControl"><select>' +
						'<option value="4000">0.25x</option>' +
						'<option value="2000">0.5x</option>' +
						'<option value="1000" selected="true">1x</option>' + 
						'<option value="500">2x</option>' +
						'<option value="250">4x</option>' + 
						'<option value="125">8x</option></select></div>');
				
				controls.find('.slideshowSpeedControl select').bind('change', function(event) {
					var $this = $(this),
						target = $this.parents('.filmstripWrapper').find('div.filmstrip'),
						container = target.parents('.filmstripsWrapper');
					
					if (container.length == 1 && target.filmstrip('data').locked) {
						container.find('div.filmstrip').filmstrip('interval', parseInt(this.value));
					} else {
						target.filmstrip('interval', parseInt(this.value));
					}
				});
				
				this.parent().bind('stop.filmstrip', function (event) {
					var $this = $(this),
						data = $this.serialScroll('data');
					
					$this.parent().removeClass('running');
					$this.parent().addClass('stopped');
					$this.parent().find('.slideshowControl').removeClass('stop');
					$this.parent().find('.slideshowControl').addClass('start')
					$this.parent().find('.slideshowControl').text('Start');
					
					if (typeof data.originalDuration != 'undefined' && data.originalDuration != null) {
						data.settings.duration = data.originalDuration;
						data.originalDuration = null;
					}
					
					if (typeof data.originalEasing != 'undefined' && data.originalEasing != null) {
						data.settings.easing = data.originalEasing;
						data.originalEasing = null;
					}
					
					$this.trigger('stop.serialScroll');
				});
				
				this.parent().bind('start.filmstrip', function (event) {
					var $this = $(this),
						data = $this.serialScroll('data');
					$this.parent().removeClass('stopped');
					$this.parent().addClass('running');
					$this.parent().find('.slideshowControl').removeClass('start');
					$this.parent().find('.slideshowControl').addClass('stop')
					$this.parent().find('.slideshowControl').text('Stop');
					
					if (typeof data.settings.easing == 'undefined') {
						data.settings.easing = 'swing';
					}
					
					if (typeof data.originalDuration == 'undefined' || data.originalDuration == null) {
						data.originalDuration = data.settings.duration;
						data.originalEasing = data.settings.easing;
					}
					
					data.settings.duration = data.settings.interval;
					data.settings.easing = 'linear';
					
					$this.trigger('start.serialScroll');
				});
				
				if (typeof container != 'undefined') {
					container.bind('locked.filmstrip', function(event) {
						var $this = $(this),
							targets = $this.find('div.filmstrip:not(:last)'),
							last = $this.find('div.filmstrip:last'),
							interval = last.filmstrip('interval');
						
						$(this).find('.filmstripControls:not(:last) .slideshowControl').hide();
						
						last.trigger('stop.filmstrip');
						
						targets.each(function(i, elem) {
							$(elem).filmstrip('interval',interval);
						})
					});
					container.bind('unlocked.filmstrip', function(event) {
						var $this = $(this);
						
						$this.find('.filmstripControls').show();
						$this.find('div.filmstrip').trigger('stop.filmstrip');
						$this.find('.filmstripControls .slideshowSpeedControl select').trigger('change');
					});
					
					container.find('div.filmstrip:last').bind('start.filmstrip', {container: container}, function (event) {
						var $this = $(this),
							targets = event.data.container.find('div.filmstrip:not(:last)');
						
						if ($this.filmstrip('data').locked) {
							targets.trigger('start.filmstrip');
						}
					});
					
					container.find('div.filmstrip:last').bind('stop.filmstrip', {container: container}, function (event) {
						var $this = $(this),
							targets = event.data.container.find('div.filmstrip').not(':last');
						
						if ($this.filmstrip('data').locked) {
							targets.each(function(i, elem) { $(elem).trigger('stop.filmstrip') });
						}
					});
				}
			}
			
			if (settings.statusDisplay) {
				this.each(function(offset, element) {
					element = $(element).parent();
					var display = $('<div class="display"> </div>');
					element.parents('.filmstripWrapper').find('.filmstripControls').append(display);
                    element.parents('.filmstripWrapper').find('.display').html('Page 0-' + (element.filmstrip('numberOfItemsVisible') - 1) + ' of ' + element.serialScroll('items').length);
				});
                
        		this.parent().bind('onbefore.serialScroll', function(event, baseEvent, element, target) {
                    $(this).parent().find('.display').html('Page ' + target + '-' + (target + $(this).filmstrip('numberOfItemsVisible') - 1) + ' of ' + $(this).serialScroll('items').length);
					return true;
				});
			}
			
			//onload handler to drop the spinny image once the real image loads
			$('ul.filmstrip li a img').load(function () {
			    $(this).closest('li').css("background-image", "none");			    
			    $(this).closest('li').css("background-color", "black");			    
            });            
            		
			//book_comparison.html template always insists on putting the metadata blocks together at the end of the filmstripWrapper, so we pick them all out and put them in their proper place.
			$('.inline-filmstrip-metadata-block').each(function(){
				var metadataID = $(this).attr('id');
				var genericID = metadataID.substring(0, metadataID.indexOf("-"));
				var pagesSelector = "ul#" + genericID + "-pages";
				$(pagesSelector).parent().parent().before($(this));
				
			});
			
			return this;
		},
		lock : function() {
			return this.trigger('lock.filmstrip'); 
		},
		unlock : function() {
			return this.trigger('unlock.filmstrip');
		},
		start : function() {
			return this.trigger('start.filmstrip'); 
		},
		stop : function() {
			return this.trigger('stop.filmstrip');
		},
		interval : function(value) {
			var data = this.serialScroll('data');
			
			if (typeof data.originalDuration == 'number' && typeof value == 'number') {
				data.settings.interval = value;
				data.settings.duration = value;
				return this;
			}
			
			return this.serialScroll('interval', value);
		},
		data : function() {
			return this.data('filmstrip');
		},
		resize: function(klass) {
			this.trigger('onBeforeResize.filmstrip',[klass]);
			
			if (typeof klass != 'undefined') {
				for (var i=0; i < this.length; i++) {
					var temp = $(this[i]),
						size = temp.filmstrip('data').settings.sizeClass;
					if (typeof size != 'undefined' && size != null && size != klass) {
						temp.removeClass(size);
						temp.parents('.filmstripWrapper,.filmstripsWrapper').removeClass(size);
					}
				}
				
				this.addClass(klass);
				this.parents('.filmstripWrapper,.filmstripsWrapper').addClass(klass);
				for (var i=0; i < this.length; i++) {
					$(this[i]).filmstrip('data').settings.sizeClass = klass;
				}
			}
			
			for (var i=0; i < this.length; i++) {
				var temp = $(this[i]),
					settings = temp.filmstrip('data').settings,
					scrollSettings = temp.serialScroll('data').settings,
					items = temp.serialScroll('items');
				
				
				var width = 400;
				for (var j=0; j < items.length; j++) {
					width += $(items[j]).outerWidth(true);
				}
				
				$(temp.children()[0]).width(width);
				
				if (typeof settings.offset == 'number' && settings.offset > 0) {
					scrollSettings.offset = 0;
					for (var j=0; j < settings.offset && j < items.length; j++) {
						scrollSettings.offset -= $(items[j]).outerWidth(true);
					}
				}
				
				if (settings.autoExclude && items.length > 0) {
					var width = $(items[0]).outerWidth(true);
					var available = temp.parent().innerWidth();
					if (typeof scrollSettings.offset == 'number') available += scrollSettings.offset;
					scrollSettings.exclude = Math.floor(available/width) - 2;
				}
				
				if (settings.slider) {
					var slider = temp.parents('div.filmstripWrapper').find('div.slider');
					var max = items.length;
					
					//if (typeof settings.offset == 'number') max += settings.offset;
					if (typeof scrollSettings.exclude == 'number') max -= scrollSettings.exclude;
					
					slider.slider('option','max',max);
				}
				
				temp.serialScroll('jump',temp.serialScroll('current'));
			}
			
			return this;
		},
		numberOfItemsVisible: function() {
			if (this.length > 1) return 0;
			
			var items = this.serialScroll('items'),
				count = 0,
				size = this.innerWidth();
			
			for (var i= this.serialScroll('current'); i < items.length && size > 0; i++) {
				size -= $(items[i]).outerWidth(true);
				count++;
			}
			
			return count;
		}
	};
	
	$.fn.filmstrip = function( method ) {
		// Method calling logic
		if ( method != 'init' && methods[method] ) {
			if (!this.is('div.filmstrip')) {
				if (this.is('div.filmstripsWrapper,div.filmstripWrapper')) {
					var obj = this.find('div.filmstrip');
				} else if (this.parents('div.filmstrip').length > 0) {
					var obj = this.parents('div.filmstrip');
				} else {
					var obj = this;
				}
			} else {
				var obj = this;
			}
			
			return methods[ method ].apply( obj, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.filmstrip' );
		}
	};
})(jQuery);
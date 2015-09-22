(function($) {
	var appendImage = function(url, size) {
		$.ajax({
			url:url,
			cache: true,
			dataType: 'html',
			success: function(data) {
				data = $(data.replace('svc.scale.value',size));
				var clone = data.clone();
				clone.hide();
				$('body').append(clone);
				clone.find('img.pageImage').load(function(event) {
					var img = $(this),
						content = img.parent();
					
					content.show();
					$('#' + content.attr('id')).replaceWith(content);
					
					if ($('#facebox div.content > *').length > 1) {
						content.find('li.contract').show();
					} else {
						content.find('li.expand').show();
					}
					fixFaceboxWidth();
				});
				
				data.find('img.pageImage').attr('src',$.facebox.settings.loadingImage);
				$.facebox.reveal(data);
				fixFaceboxWidth();
			}
		});
	};
	
	var fixFaceboxWidth = function() {
		var children = $('#facebox div.content > *'),
			width = 4,
			options = {duration: 250, queue: false};
		
		for (var i=0; i < children.length; i++) {
			width += $(children[i]).outerWidth();
		}
		
		$('#facebox div.content').width(width);
		$('#facebox').animate({left: $(window).width() / 2 - ($('#facebox').outerWidth() / 2)}, options);
	}
	
	var displayImages = function(primary_id) {
		var $item = $("#page_"+primary_id+":has(a):has(img)");
		
		if ($item.length != 1) return false;
		
		var item = $item[0],
			filmstrip = $item.parents('div.filmstrip'),
			filmstrips = filmstrip.parents('div.filmstripsWrapper').find('div.filmstripWrapper div.filmstrip'),
			displayOffset = filmstrip.serialScroll('index', item) - filmstrip.serialScroll('current'),
			thumbnails = [],
			urls = [];
		
		for (var i=0,j=0; i < filmstrips.length; i++) {
			var filmstrip = $(filmstrips[i]),
				item = filmstrip.serialScroll('items')[filmstrip.serialScroll('current')+displayOffset],
				anchor = $(item).find('a'),
				thumbnail = $(item).find('img');
			
			if (anchor.length != 1 || thumbnail.length != 1)  continue;
			
			urls[j] = anchor.attr('href');
			thumbnails[j] = thumbnail;
			j++;
		}
		
		var constraints = calculateImageConstraints(thumbnails);
		
		for (var i=0; i < urls.length; i++) {
			appendImage(urls[i], constraints[i]);
		}
		
		return true;
	};
	
	var displayImage = function(id) {
		var $item = $("#page_"+id+":has(a):has(img)");
		
		if ($item.length != 1) return false;
		
		var thumbnails = [$item.find('img')],
			constraints = calculateImageConstraints(thumbnails);
		
		appendImage($item.find('a').attr('href'), constraints[0]);
		
		return true;
	};
	
	var calculateImageConstraints = function(thumbnails) {
		var width=0,
			height=0,
			i=0,
			length=thumbnails.length,
			windowWidth = $(window).width()-100,
			windowHeight = $(window).height()-300,
			constraints = [];
		
		for (i=0; i<length; i++) {
			width += thumbnails[i].width();
			if (thumbnails[i].height() > height) height = thumbnails[i].height();
		}
		
		if (height / width >= windowHeight / windowWidth) {
			for (i=0; i<length; i++) {
				constraints[i] = '0,' + windowHeight;
			}
		} else {
			for (i=0; i<length; i++) {
				constraints[i] = Math.floor(thumbnails[i].width() * windowWidth / width) + ',0';
			}
		}
		
		return constraints;
	};
	
	$(document).ready(function() {
		$('.pages').filmstrip();
		
		$.facebox.settings.opacity = 0.75;
		
		$(document).bind('close.facebox', function(e) {
			$('#facebox div.content').css('width','auto');
		});
		
		//display the facebox for a page if it is clicked 
		$('.pages li > a').click(function(event) {
			event.preventDefault();
			
			var $this = $(this),
				id = $this.parent().attr('id').replace('page_',''),
				filmstrip = $this.parents('div.filmstrip'),
				result;
			
			$.facebox.loading();
			
			if (filmstrip.filmstrip('data').locked) {
				result = displayImages(id);
			} else {
				result = displayImage(id);
			}
			
			if (!result) $.facebox.close();
		});
		
		$('#facebox a.expand').live('click',function(event) {
			$.facebox.loading();
			$('#facebox div.content').css('width','auto');
			displayImages($(this).parents('div.pageImage').attr('id').replace('pageImage_',''));
		});
		
		$('#facebox a.contract').live('click',function(event) {
			$.facebox.loading();
			$('#facebox div.content').css('width','auto');
			displayImage($(this).parents('div.pageImage').attr('id').replace('pageImage_',''));
		});
	});
})(jQuery);

(function($) {
	var resizePages = function() {
		var min=550,
			imgs=$('#pages-wrapper .page-image:not(.loading)');
		
		for (var i=0; i < imgs.length; i++) {
			if ($(imgs[i]).outerHeight() < min) min = $(imgs[i]).outerHeight();
		}
		
		$('img.page-image:not(.loading)').height(min);
	};
	
	
	var loadPages = function(url) {
		if (url.indexOf('://') != -1) return false;
		
		window.location.hash = url;
		var wrapper = $('#pages-wrapper'); 
		wrapper.empty();
		wrapper.append('<img src="/theme/imgs/facebox/loading.gif" class="loading ajax-loading" />');
        
        var nextPageString = url.substring(url.indexOf('=')+1);
        var nextPageNum = Number(nextPageString) + 1;
        var nextPage = url.substring(0, url.indexOf('=')+1) + nextPageNum;
        //alert('9: ' + url + ' ' + nextPageString + ' ' + nextPageNum + ' ' + nextPage);  
		
		$.ajax({
			url:url,
			cache: true,
			dataType: 'html',
			success: function(data) {
				data = $(data).find('div.page-div');
				var clone = data.find('img').clone();
				clone.hide();
				$('body').append(clone);
				clone.load(function(event) {
					var $this = $(this);
					$this.show();
					$('#'+$this.attr('id')).replaceWith($this);
					resizePages();
					$('div.loading-reading-page').remove();				
				});
				data.find('img').attr('src',"/theme/imgs/facebox/loading.gif");
				data.find('img').addClass('loading');
				data.find('img').addClass('page-loading');
				
				wrapper.empty();
				
				wrapper.append(data);
                },                
            complete: function(data) {
                $.ajax({
                    url: nextPage,
                    cache: true,
           			dataType: 'html',
                    success: function(data) {
                        data = $(data).find('div.page-div');
                        var clone = data.find('img').clone();
                        clone.hide();
                        }
                    });
                }
		});
        
		return true;
	}
    
    var cachePages = function(url) {
		if (url.indexOf('://') != -1) return false;
		
		$.ajax({
			url:url,
			cache: true,
			dataType: 'html',
			success: function(data) {
				data = $(data).find('div.page-div');
				var clone = data.find('img').clone();
				clone.hide();
			}
		});
		
		return true;
	}
	
	$(document).ready(function() {
        
         
    
		$(document).keydown(function(event) {
			if (event.keyCode == 37)  $('.page-div .page-nav-previous').click();
			if (event.keyCode == 39) $('.page-div .page-nav-next').click();
		});
		
		$('div.page-div a.page-nav').live('click',function(event) {
			event.preventDefault();
			loadPages($(this).attr('href'));
		});
		
		var url = window.location.hash;
		
		if (url == '' || url == '#')  return;
		else if (url[0] == '#') loadPages(url.substring(1));
	});
})(jQuery);
(function($) {
	if (typeof window.tamulib.libros == 'undefined' || 
			typeof window.tamulib.libros.comparisons != 'undefined') return;
	
	window.tamulib.libros.comparisons = {
		selectors: {
			portlet: '#portlet-compare',
			link: 'a.comparison'
		},
		url: null,
		namespace: 'tamulib_libros_comparisons'
	};
	
	var tlc = window.tamulib.libros.comparisons;
		
	tlc.update_links = function() {
		var event = 'click.'+ tamulib.libros.comparisons.namespace,
			link = tlc.selectors.link,
			portlet = tlc.selectors.portlet;
		
		$(link).unbind(event);
		
		if ($(portlet).length == 1) {
			$(link).bind(event, function(e) {
				e.preventDefault();
				$.ajax({
					url:$(this).attr('href'),
					complete: function() {
						tlc.refresh();
					},
					cache: false,
					dataType: 'json'
				});
			});
		} else {
			$(link).bind(event, function(e) {
				e.preventDefault();
				$.ajax({
					url: $(this).attr('href'),
					complete: function() {
						window.location.reload();
					},
					cache: false,
					dataType: 'json'
				});
			});
		}
	};
	
	tlc.refresh = function() {
		var portlet = tlc.selectors.portlet;
		
		if (tlc.url == null || $(portlet).length < 1) return;
		
		$(portlet).load(tlc.url + ' ' + portlet +' > *', tlc.update_links);
	};
})(jQuery);
(function($) {
	var updateCounts = function() {
		var count = $('.editing li').length;
		var oldCount = $('dd.numPages').html();
		var oldMax = $('.editing').parents('.filmstripWrapper').find('.slider').slider('option','max');
		
		$('dd.numPages').html(count);
		$('dd.numMissingPages').html($('.editing li > div').length);
		try {
			oldCount = parseInt(oldCount);
		} catch (ex) { }

		if (oldCount) {
			$('.editing').parents('.filmstripWrapper').find('.slider').slider('option','max',oldMax + (count - oldCount));
		}
	};
	
	var deletePage = function(id, success) {
		$.ajax({
			url: '/page/' + id + '/delete/',
			cache: false,
			dataType: 'json',
			success: function(data, status, request) {
				if (typeof data.deleted != "number") {
					//alert('There was an error deleting the page');
					return false;
				}
				if ($.isFunction(success)) {
					return success(data, status, request);
				}
			},
			error: function(request, status, error) {
				//alert('There was an error deleting the page');
			}
		});
	};
	
	var deleteEditingPage = function(id) {
		return deletePage(id, function(data, status, request) {
			$('.editing #page_'+data.deleted).remove();
			$('a.save_order').click();
			updateCounts();
			return true;
		});
	};
	
	var deleteExteriorPage = function(id) {
		var page = $('.exterior #page_'+id),
			container = page.children('div'),
			title = container.attr('id').replace('exterior_','');
		$.ajax({
			url: '/page/' + id + '/edit/',
			type: 'POST',
			data: {
				sequence: '0',
				title: title,
				internal: 'False'
			},
			success: function(data, status, request) {
				if (typeof data.updated == 'number') {
					page.find('img').remove();
					page.find('div.overlay').removeClass('overlay');
					page.children('div').addClass('missingPage');
					enableConversionDroppable(page);
				}
			}
		});
	};
	
	var enableConversionDraggable = function(selector) {
		$(selector).draggable({
			connectToSortable: '.editing',
			helper: 'clone',
			revert: 'invalid'
		});
	}
	
	var enableConversionDroppable = function(selector) {
		$(selector).droppable({accept: '.editing li:has(img)'});
	}
	
	var toggleAnnotationAction = function() {
		var scroll = $('#annotations').data('annotations_scroll');
		if (scroll == null) scroll=false;
		
		$('.annotations a').unbind('click.bookreader_editor');
		if (scroll) {
			$('.annotations a').bind('click.bookreader_editor', function(event) {
				event.preventDefault();
				return editAnnotation($(this));
			});
		} else {
			$('.annotations a').bind('click.bookreader_editor', function(event) {
				event.preventDefault();
				$('.pages').serialScroll('jump', parseInt($(this).attr('href').replace('#','')));
			});
			$('#annotations').data('annotations_scroll', true);
		}
		$('#annotations').data('annotations_scroll', !scroll);
	};
	
	var editAnnotation = function(annotation) {
		var id = parseInt(annotation.attr('id').replace('annotation_',''));
		
		if ($('#edit_annotation_'+id).length > 0) {
			$.facebox($('#edit_annotation_'+id));
		} else {
			$.facebox(function() {
				$.get('/annotation/' + id + '/edit/', function(data) {
					$.facebox('<div id="edit_annotation_'+id+'">' +
						'<form id="edit_annotation_'+id+'_form" class="edit_annotation_form annotation_form" method="POST" action="/annotation/'+id+'/edit/">' + 
						data + 
						'<p><input type="submit" name="submitAction" value="Save" /></p></form>' +
						'<p><a href="/annotation/'+id+'/delete/" class="delete_annotation">Delete this annotation</a></p>' + 
						'</div>');
				});
			});
		}
	};
	
	var addAnnotation = function(url) {
		$.facebox(function() {
			$.get(url, function(data) {
				$.facebox('<div>' +
					'<form class="add_annotation_form annotation_form" method="POST" action="'+url+'">' + 
					data + 
					'<p><input type="submit" name="submitAction" value="Save" /></p></form>' + 
					'</div>');
			});
		});
	};
	
	var enableCanonicalDroppable = function(selector) {
		$(selector).droppable({accept:'ul.copy li'});
	}
	
	$(document).ready(function() {
		updateCounts();
		
		$.facebox.settings.opacity = 0.75;
		
		var options = {
			slideshow: false,
			serialScroll: {
				offset: -58}};
		
		$('.pages').filmstrip(options);
		$('.exterior').filmstrip(options);
		$('.pages a').click(function (event) {
			event.preventDefault();
		});
		
		$('.editing').sortable({
			//axis: 'x',
			items: 'li',
			revert: true,
			forceHelperSize: true,
			forcePlaceholderSize: true,
			opacity: 0.75,
			stop: function(event, ui) {
				if (ui.item.hasClass('newBlankPage')) {
					var data = {internal: true,
							    count: $('input[name="numberNewPages"]').val()};
					
					if (ui.item.hasClass('syncPage')) data.title = 'Sync Page';
					
					$.ajax({
						url: $('a.add_page').attr('href'),
						data: data,
						type: 'POST',
						cache: false,
						dataType: 'json',
						success: function(data, status, request) {
							if (typeof data.added == "undefined") {
								ui.item.remove();
								return;
							}
							
							ui.item.removeClass('newBlankPage');
							
							if (typeof data.added == "number") data.added = [data.added];
							
							ui.item.attr('id','page_'+data.added[0]);
							
							for (var i=1; i < data.added.length; i++) {
								var clone = ui.item.clone();
								clone.attr('id','page_'+data.added[i]);
								ui.item.after(clone);
							}
							
							$('a.save_order').click();
							updateCounts();
							ui.item.parent().filmstrip('resize');
						},
						error: function(request, status, error) {
							ui.item.remove();
						}
					});
				}
			},
			update: function(event, ui) {
				if (!ui.item.hasClass('exteriorPage')) {
					$('a.save_order').click();
					updateCounts();
				}
			}
		});

		$('#contentSource li.newBlankPage').draggable({
			connectToSortable: '.editing',
			helper: 'clone',
			revert: 'invalid'
		});

		$('#contentSource li.trashCan').droppable({
			accept: 'ul.editing li, ul.exterior li',
			drop: function(event, ui) {
				var id = ui.draggable.attr('id').replace('page_','');
				if (ui.helper.parents('ul.editing').length > 0) {
					var del = deleteEditingPage;
				} else {
					var del = deleteExteriorPage;
				}
				
				if (ui.draggable.find('img').length == 0) {
					return del(id);
				}
				
				if (confirm("Are you sure you want to remove this page?")) {
					return del(id);
				}
				
				return false;
			}
		});
		
		$('#contentSource li.exteriorConversion').droppable({
			accept: '.editing li',
			drop: function(event, ui) {
				convertPage(ui.draggable.attr('id').replace('page_',''));
			}
		});

		$('a.save_order').click(function(event) {
			event.preventDefault();
			$.ajax({
				url: $(this).attr('href'),
				data: $('.editing').sortable('serialize',{key:'page'}),
				dataType: 'json',
				type: 'POST',
				cache: false,
				success: function(data, status, request) {
					if (!data.success) alert(data.error); 
				},
				error: function(request, status, error) {
					//alert('There was an error saving the order');
				}
			});
		});
		
		toggleAnnotationAction();
		
		$('#edit_annotations').click(function(event) {
			toggleAnnotationAction();
			$this = $(this);
			
			if ($('#annotations').data('annotations_scroll')) {
				$this.attr('title','Edit Annotations');
				$this.removeClass('stop_editing_annotations');
				$this.addClass('edit_annotations');
			} else {
				$this.attr('title','Stop Editing Annotations');
				$this.removeClass('edit_annotations');
				$this.addClass('stop_editing_annotations');
			}
		});
		
		
		$('form.annotation_form').live('submit',function(event) {
			event.preventDefault();
			var $this = $(this);
			$.ajax({
				type: $this.attr('method'),
				url: $this.attr('action'),
				data: $this.serialize(),
				dataType: 'json',
				success: function(data) {
					if (typeof data.errors != 'undefined') {
						alert(data.errors);
						return;
					}
					$(document).trigger('close.facebox');
					$('#reload_annotations').click();
				},
				error: function(request, status, error) {
					alert(status);
				}
			});
		});
		
		$('a.delete_annotation').live('click', function(event) {
			event.preventDefault();
			
			if (confirm("Are you sure you want to delete the annotation?")) {
				$.ajax({
					url: $(this).attr('href'),
					dataType: 'json',
					success: function(data) {
						$(document).trigger('close.facebox');
						$('#reload_annotations').click();
					},
					error: function(request, status, error) {
						alert(status);
					}
				});
			}
		});
		
		$('form.page_form').live('submit', function(event) {
			event.preventDefault();
			var $this = $(this);
			
			if ($this.hasClass('convert_page_form')) {
				$this.find('input[name=sequence]').val(0);
				$this.find('input[name=internal]').val('False');
			}
			
			$.ajax({
				type: $this.attr('method'),
				url: $this.attr('action'),
				data: $this.serialize(),
				dataType: 'json',
				success: function(data) {
					if (typeof data.errors != 'undefined') {
						alert(data.errors);
						return;
					}
					$(document).trigger('close.facebox');
					$('.editing #page_'+data.updated).remove();
					$('a.save_order').click();
					updateCounts();
				},
				error: function(request, status, error) {
					alert(status);
				}
			});
		});
		
		$('a#add_annotation').click(function(event) {
			event.preventDefault();
			addAnnotation($(this).attr('href'));
		});
		
		$('#reload_annotations').click(function(event) {
			event.preventDefault();
			$('#annotationsWrapper').load($(this).attr('href'),function() {
				toggleAnnotationAction();
				toggleAnnotationAction();
			});
		});
		
		enableConversionDraggable('.exterior li:has(img)');
		enableConversionDroppable('.exterior li:not(:has(img))');
		
		$('.exterior li:not(:has(img))').live('drop', function(event, ui) {
			var id = ui.draggable.attr('id').replace('page_',''),
				$this = $(this),
				container = $this.children('div'),
				title = container.attr('id').replace('exterior_','');
			
			deletePage($this.attr('id').replace('page_',''));
			
			$.ajax({
				url: '/page/' + id + '/convert/',
				type: 'POST',
				data: {
					title: title,
					internal: 'False',
					sequence: '0'
				},
				success: function(data, status, request) {
					if (typeof data.updated == 'number') {
						$('.editing #page_'+id).remove();
						$this.droppable('destroy');
						// Replace blank page with draggable element and add overlay div for title
						container.removeClass('missingPage');
						container.children('div').addClass('overlay');
						container.prepend(ui.draggable.find('img'));
						$this.attr('id', ui.draggable.attr('id'));
						
						// Enable draggable on $(this)
						enableConversionDraggable($this);
						$('a.save_order').click();
					}
				}
			});
		});
		
		$('.editing').bind('sortstop',function(event, ui) {
			if (ui.item.find('div.overlay').length > 0) {
				var id = ui.item.attr('id').replace('page_',''),
					original = $('.exterior #'+ui.item.attr('id')),
					title = original.children('div').attr('id').replace('exterior_','');
				
				$.ajax({
					url: '/page/' + id + '/convert/',
					type: 'POST',
					data: {
						title: '',
						internal: 'True',
						sequence: '0'
					},
					success: function(data, status, request) {
						if (typeof data.updated != 'undefined') {
							ui.item.find('div.overlay').remove();
							ui.item.removeClass('exteriorPage');
							original.draggable('destroy');
							$('a.save_order').click();
						}
					}
				});
				
				$.ajax({
					url: $('a.add_page').attr('href'),
					type: 'POST',
					data: {
						title: title,
						internal: 'False',
						sequence: '0'
					},
					success: function(data, status, request) {
						if (typeof data.added == 'number') {
							original.find('img').remove();
							original.find('div.overlay').removeClass('overlay');
							original.children('div').addClass('missingPage');
							original.attr('id','page_'+data.added);
							enableConversionDroppable(original);
						}
					}
				});
			}
		});
		
		$('.page-annotations').facebox({overlay:false});
		
		$('.annotation-toggle').click(function(event) {
			event.preventDefault();
			$('#annotationsWrapper').slideToggle('slow');
		});
		
		enableCanonicalDroppable('ul.editing.frankenbook li');
		
		$('ul.copy li:has(img)').draggable({
			helper:'clone',
			revert:false
		});
		
		
		$('ul.editing.frankenbook li').live('drop', function(event, ui) {
			var $this=$(this),
				id=$this.attr('id').replace('page_','');
			
			if (!id) return;
			
			$.ajax({
				url:'/page/'+id+'/edit-urls/',
				type: 'POST',
				data: {
					jp2:ui.draggable.children('a').attr('href'),
					thumbnail:ui.draggable.find('img.repository-thumbnail').attr('src')},
				success: function(data, status, request) {
					$this.empty();
					$this.append(ui.draggable.children().clone(false));
					updateCounts();
				}
			});
		});
		

		$('.editing').bind('sortreceive sortremove',function(event, ui) {
			$(this).filmstrip('resize');
		});
		
		$('ul.editing.frankenbook').bind('sortstop',function(event,ui){
			enableCanonicalDroppable(ui.item);
		});
	});
	
})(jQuery);
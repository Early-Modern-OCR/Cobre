(function($) {
	$(document).ready(function() {
	
		$(document).bind('reveal.facebox', function(){ 
			$('div.transcription-facebox-text').hide();
			$('div.current-transcription').show();
			
			
		});

		$('form.edit_transcription_form').live('submit',function(event) {
			event.preventDefault();
			var $this = $(this);
			
			//show the add button if we're in the facebox
			$('img.add_transcription_facebox_icon').show();
			
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
					if( $('div.facebox-transcriptions-div').length == 0)
					{
						$(document).trigger('close.facebox');
						//$('#reload_transcriptions').click();
						window.location.reload(true);
					}
					else
					{
						showNav();
						var text = '(<span class="trans-author">' + $this.find('input#id_authorName').attr('value') + '</span>) ' + 
									'<span class="trans-text">' + $this.find('textarea').val() + '</span>';
									
						$this.parent('div').prev('div.transcription-facebox-text').html(text).show().addClass('current-transcription').attr('vetted', $this.find('input#id_vetted').is(':checked')).attr('author_id', $this.find('input#id_author').val());
						$this.parents('div.edit_transcription_container').remove();						
					}
						
				},
				error: function(request, status, error) {
					alert(status);
				}
			});
		});
		
		
		$('form.add_transcription_form').live('submit',function(event) {
			event.preventDefault();
			var $this = $(this);
			
      if($this.parents('div.pageImage').size() > 0)
      {
        //alert('found pageImage');
        var pageID = $this.parents('div.pageImage').attr('id').replace('pageImage_', '');
			}
      else
      {
        //alert('no pageImage');
        var pageID = $this.find('input#id_page').attr('value');
      }

			//alert('adding transcription to page ' + pageID);
			
			//show the add button if we're in the facebox
			$('img.add_transcription_facebox_icon').show();
			
			$.ajax({
				type: $this.attr('method'),
				url: $this.attr('action'),
				data: $this.serialize(),
				dataType: 'json',
				success: function(data) {
				
					//retrieve from the response the new database key of the added transcription
					var id = parseInt($.param(data).replace('added=',''));
					if (typeof data.errors != 'undefined') {
						alert(data.errors);
						return;
					}
					if( $('div.facebox-transcriptions-div').length == 0)
					{
						$(document).trigger('close.facebox');
						//$('#reload_transcriptions').click();
						window.location.reload(true);
					}
					else
					{
						showNav();
						var text = '(<span class="trans-author">' + $this.find('input#id_authorName').attr('value') + '</span>) ' + 
							'<span class="trans-text">' + $this.find('textarea').val() + '</span>';

						
						var transcriptionHtml = '<div class="transcription-facebox-text current-transcription" id="transcription-text-' + id + '" vetted="' + $this.find('input#id_vetted').is(':checked') + '" author_id="' +  $this.find('input#id_author').val() + '">' + text + '</div>' ;
							
						
						if($this.parent('div').prevAll('div.transcription-facebox-text.current-transcription').length > 0)
						{
							$this.parent('div').prevAll('div.transcription-facebox-text.current-transcription').removeClass('current-transcription').after(transcriptionHtml);
						}
						else
						{
							$this.parent('div').before(transcriptionHtml);
						}
							
						$this.parents('div.add_transcription_container').remove();
						displayCurrentTranscriptions();
					}
						
				},
				error: function(request, status, error) {
					alert(status);
				}
			});
		});
		
		
		$('#add_transcription').live('click', function(event) {
				event.preventDefault();
				addTranscription($(this).attr('href'));				
		});
		
		
		$('div.transcription-text').live('click', function(event) {
				event.preventDefault();
				
				var userId = $('input#current-user').attr('user_id');
				var userSu = $('input#current-user').attr('user_su');
				
				if ($(this).attr('author_id') == userId || userSu == "True")				
				{
					editTranscription($(this));				
				}
		});	
		
		$('a.delete-transcription').live('click', function(event) {
			event.preventDefault();
			var $this = $(this);
			if (confirm("Are you sure you want to delete the transcription?")) {
				$.ajax({
					url: $(this).attr('href'),
					dataType: 'json',
					success: function(data) {
						if( $('div.facebox-transcriptions-div').length == 0)
						{
							$(document).trigger('close.facebox');
							//$('#reload_transcriptions').click();
							window.location.reload(true);
						}
						else
						{
							showNav();
							//$this.css('border', '3px solid blue');
							//$this.parents('div.edit_transcription_container').css('border', '3px solid green');
							
							
							var $formToClose = $this.parents('div.edit_transcription_container');
							var $deletedElement = $formToClose.prev('div.current-transcription');
							var pageID = parseInt($deletedElement.parents('div.pageImage').attr('id').replace('pageImage_', ''));
							
							
							
							$formToClose.remove();
							$deletedElement.remove();
							
							firstTranscription(pageID);
						}

					},
					error: function(request, status, error) {
						alert(status);
					}
				});
			}
		});
		
		$('.add_transcription_facebox_icon').live('click', function(event) {
				event.preventDefault();
				var pageID = parseInt($(this).parents('.facebox-transcriptions-div').attr('id').replace('facebox-transcriptions-',''));
				
				//hide the transcription being viewed on this page
				$('div#facebox-transcriptions-' + pageID + '.facebox-transcriptions-div').children('.current-transcription').hide();
				
				//conceal the navigation while editing
				concealNav();
				
				//hide the add buttons while editing
				$('img.add_transcription_facebox_icon').hide();
				
				addFaceboxTranscription($(this).attr('href'));				
		});
		
		$('div.transcription-facebox-text').live('click', function(event) {
				event.preventDefault();
				
				var userId = $('input#current-user').attr('user_id');
				var userSu = $('input#current-user').attr('user_su');

				if ($(this).attr('author_id') == userId || userSu == "True")				
				{
					$(this).hide();
					//conceal the navigation while editing
					concealNav();
					//hide the add buttons while editing
					$('img.add_transcription_facebox_icon').hide();
					editFaceboxTranscription($(this));								
				}
		});	
		
		$('span.facebox-transcriptions-previous').live('click', function(event) {
			var pageID = parseInt($(this).parents('.facebox-transcriptions-div').attr('id').replace('facebox-transcriptions-',''));
			prevTranscription(pageID);
		});
		
		$('span.facebox-transcriptions-next').live('click', function(event) {
			var pageID = parseInt($(this).parents('.facebox-transcriptions-div').attr('id').replace('facebox-transcriptions-',''));
			nextTranscription(pageID);
		});
		
		
	});
	
	var firstTranscription = function(pageID) {
		$('div#facebox-transcriptions-' + pageID + ' div.transcription-facebox-text').first().addClass('current-transcription');
		displayCurrentTranscriptions();
	};
	
	var nextTranscription = function(pageID) {
		//if the current transcription is the last one, make the first one current.
		//otherwise, make the next one current.
		if( $('div#facebox-transcriptions-' + pageID + ' div.transcription-facebox-text').last().hasClass('current-transcription'))
		{
			$('div#facebox-transcriptions-' + pageID + ' div.current-transcription').removeClass('current-transcription');
			$('div#facebox-transcriptions-' + pageID + ' div.transcription-facebox-text').first().addClass('current-transcription');
		}
		else
		{
			$('div#facebox-transcriptions-' + pageID + ' div.current-transcription').removeClass('current-transcription').next('div.transcription-facebox-text').addClass('current-transcription');
		}
		
		displayCurrentTranscriptions();
	};
	
	var prevTranscription = function(pageID) {
		//if the current transcription is the first one, make the last one current.
		//otherwise, make the previous one current.
		if( $('div#facebox-transcriptions-' + pageID + ' div.transcription-facebox-text').first().hasClass('current-transcription'))
		{
			$('div#facebox-transcriptions-' + pageID + ' div.current-transcription').removeClass('current-transcription');
			$('div#facebox-transcriptions-' + pageID + ' div.transcription-facebox-text').last().addClass('current-transcription');
		}
		else
		{
			$('div#facebox-transcriptions-' + pageID + ' div.current-transcription').removeClass('current-transcription').prev('div.transcription-facebox-text').addClass('current-transcription');
		}
		
		displayCurrentTranscriptions();

	};
	
	var displayCurrentTranscriptions = function() {
		$('div.transcription-facebox-text').hide();
		$('div.current-transcription').show();
	};
	
	var concealNav = function() {
		$('div.facebox-transcriptions-nav').hide();
	}
	
	var showNav = function() {
		$('div.facebox-transcriptions-nav').show();
	}

	
		
	var addTranscription = function(url) {
	
		var viewportRightPos = $('div#viewer').position().left + $('div#viewer').width();
		
		$(document).bind('reveal.facebox', function(){ $('div#facebox').css("left", viewportRightPos) });
	
		$.facebox(function() {
			
			$.get(url, function(data) {
				$.facebox('<div id="add-transcription-facebox">' +
					'<form class="add_transcription_form transcription_form" method="POST" action="'+url+'">' +
					'<p><a id="jfontsize-minus" class="jfontsize-button" href="#">A-</a>' + 
					'<a id="jfontsize-default" class="jfontsize-button" href="#">A</a>' + 
					'<a id="jfontsize-plus" class="jfontsize-button" href="#">A+</a></p>' + 
					data + 
					'<p><input type="submit" name="submitAction" value="Save" /></p></form>' + 
					'</div>');	
				$('.font-size-adjustable').jfontsize();
			});
		});		
	};


	var editTranscription = function(transcription) {
		if($('div#viewer').length > 0)
		{
			var viewportRightPos = $('div#viewer').position().left + $('div#viewer').width();
		}
		
		$(document).bind('reveal.facebox', function(){ $('div#facebox').css("left", viewportRightPos) });
	
		var id = parseInt(transcription.attr('id').replace('transcription-text-',''));
		
		if ($('#edit_transcription_'+id).length > 0) {
			$.facebox($('#edit_transcription_'+id));
			$('.font-size-adjustable').jfontsize();
		} else {
			$.facebox(function() {
				$.get('/page/' + id + '/edit-transcription/', function(data) {
					$.facebox('<div id="edit_transcription_'+id+'">' +
						'<form id="edit_transcription_'+id+'_form" class="edit_transcription_form transcription_form" method="POST" action="/page/'+id+'/edit-transcription/">' + 
						'<p><a id="jfontsize-minus" class="jfontsize-button" href="#">A-</a>' + 
						'<a id="jfontsize-default" class="jfontsize-button" href="#">A</a>' + 
						'<a id="jfontsize-plus" class="jfontsize-button" href="#">A+</a></p>' + 
						data + 
						'<p><input type="submit" name="submitAction" value="Save" /></p></form>' +
						'<p><a href="/page/'+id+'/delete-transcription/" class="delete-transcription">Delete this transcription</a></p>' + 
						'</div>');	
					$('.font-size-adjustable').jfontsize();
				});
			});
		}
	};
	
	
	var addFaceboxTranscription = function(url) {
		
		var pageID = parseInt(url.replace('/page/','').replace('/add-transcription/',''));
		var userId = $('input#current-user').attr('user_id');
		var userSu = $('input#current-user').attr('user_su');
		var userName = $('span#user_name').html();
		
		

		
		var vettBox = "";
		
		if (userSu == "True")
		{
			vettBox = 	'<p>'+
							'<label for="id_vetted">Vetted: </label>' +
							'<input type="checkbox" id="id_vetted" name="vetted">' + 
						'</p>';
		}
		else {
			vettBox =	'<p>'+
							'<input type="hidden" id="id_vetted" name="vetted">' + 
						'</p>';
		}
		
		
		$('div#facebox-transcriptions-'+pageID).append(
			'<div class="add_transcription_container">' +
					'<form class="add_transcription_form transcription_form" method="POST" action="'+url+'">' + 
					'<p><a id="jfontsize-minus" class="jfontsize-button" href="#">A-</a>' + 
					'<a id="jfontsize-default" class="jfontsize-button" href="#">A</a>' + 
					'<a id="jfontsize-plus" class="jfontsize-button" href="#">A+</a></p>' + 
					'<p>'+
						'<textarea class="font-size-adjustable" id ="id_text" name="text" editable="true" rows="20" cols="20"></textarea>' +
						'<select name="page" value="'+ pageID + '" id="id_page" hidden="true"><option value="'+ pageID + '"/></select>' +
						'<input type="hidden" id="id_author" value="' + userId + '" name="author">' +
						'<input type="hidden" id="id_authorName" value="' + userName + '" name="authorName">' +
					'</p>' +
					vettBox +
					'<p><input type="submit" name="submitAction" value="Save" /></p></form>' + 
			'</div>'
		);
		$('.font-size-adjustable').jfontsize();
		
	};
	
	
	var editFaceboxTranscription = function(transcription) {
		
		var pageID = $(transcription).parents('div.pageImage').attr('id').replace('pageImage_', '');
		var id = parseInt(transcription.attr('id').replace('transcription-text-',''));
		var text = $('div#transcription-text-' + id + ' span.trans-text').html();
		var vetted = $(transcription).attr('vetted').toLowerCase();
		var authorId = $(transcription).attr('author_id');
		var authorName = $('div#transcription-text-' + id + ' span.trans-author').html();
		
		var userId = $('input#current-user').attr('user_id');
		var userSu = $('input#current-user').attr('user_su');
		var userName = $('span#user_name').html();
		
		
		var vettBox = "";
		if (userSu == "True")
		{
			vettBox = 	'<p>'+
							'<label for="id_vetted">Vetted: </label>' +
							'<input type="checkbox" id="id_vetted" name="vetted" ';
							
			if (vetted == "true") {
				vettBox += 'checked="checked"';
			}
				
							
			vettBox += ' >' + 
						'</p>';
		}
		else {
			vettBox =	'<p>'+
							'<input type="hidden" id="id_vetted" name="vetted" value="' + vetted + '">' + 
						'</p>';
		}
				
		$('div#transcription-text-' + id).hide();
		
		$('div#transcription-text-' + id).after(
			'<div class="edit_transcription_container" id="edit_transcription_'+id+'">' +
						'<form id="edit_transcription_'+id+'_form" class="edit_transcription_form transcription_form" method="POST" action="/page/'+id+'/edit-transcription/">' + 
						'<p><a id="jfontsize-minus" class="jfontsize-button" href="#">A-</a>' + 
						'<a id="jfontsize-default" class="jfontsize-button" href="#">A</a>' + 
						'<a id="jfontsize-plus" class="jfontsize-button" href="#">A+</a></p>' + 
						'<p>' +
							'<textarea class="font-size-adjustable" id ="id_text" name="text" editable="true" rows="20" cols="20">' + text + '</textarea>' +
							'<input name="page" value="'+ pageID + '" id="id_page" hidden="true"><option value="' + pageID + '"/></input>' +
							'<input type="hidden" id="id_author" value="' + authorId + '" name="author">' +
							'<input type="hidden" id="id_authorName" value="' + authorName + '" name="authorName">' +
						'</p>' +	
						vettBox +
						'<p><input type="submit" name="submitAction" value="Save" /></p></form>' +
						'<p><a href="/page/'+id+'/delete-transcription/" class="delete-transcription">Delete this transcription</a></p>' + 
			'</div>'
		);
		$('.font-size-adjustable').jfontsize();
				
	};
	

})(jQuery);	

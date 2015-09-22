
function load_page(rft_id) {
	OpenLayers.Layer.OpenURL.djatokaURL = '';
	//OpenLayers.Layer.OpenURL.viewerWidth = 512; 
	//OpenLayers.Layer.OpenURL.viewerHeight = 512; 
	
	var metadataUrl = djatoka_metadata_base +'?rft_id='+rft_id;
	
	var layer = new OpenLayers.Layer.OpenURL('OpenURL', djatokaBaseUrl,
		{layername: 'basic', format: 'image/jpeg', rft_id: rft_id,
		 metadataUrl: metadataUrl});
	// Don't mess with the argument order, it's important :(
	//layer.djatokaURL = '';
	var metadata = layer.getImageMetadata();
	
	if (globalMap) {
		globalMap.destroy();
	}
	
    globalMap = new OpenLayers.Map('viewer', {
    	resolutions: layer.getResolutions(),
    	maxExtent: new OpenLayers.Bounds(0, 0, metadata.width, metadata.height),
    	tileSize: layer.getTileSize()});
    globalMap.addLayer(layer);
    
    globalMap.setCenter(new OpenLayers.LonLat(metadata.width / 2, metadata.height / 2), 0);
    globalMap.zoomToMaxExtent();
    jQuery('#additionalActions a').show();
}

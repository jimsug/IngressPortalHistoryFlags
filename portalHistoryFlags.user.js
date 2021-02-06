// ==UserScript==
// @id portalHistoryFlags
// @name IITC Plugin: Portal History Flags
// @category Layer
// @version 0.0.5
// @namespace	https://github.com/jimsug/IngressPortalHistoryFlags
// @downloadURL	https://github.com/jimsug/IngressPortalHistoryFlags/raw/main/portalHistoryFlags.user.js
// @homepageURL	https://github.com/jimsug/IngressPortalHistoryFlags
// @description Shows Visited/Captured/Scouted status
// @author jimsug
// original author: EisFrei
// @include		https://intel.ingress.com/*
// @match		https://intel.ingress.com/*
// @grant			none
// ==/UserScript==

function wrapper(plugin_info) {

    // Make sure that window.plugin exists. IITC defines it as a no-op function,
	// and other plugins assume the same.
	if (typeof window.plugin !== "function") window.plugin = function () {};

	const KEY_SETTINGS = "plugin-portal-history-flags";

	window.plugin.PortalHistoryFlags = function () {};

	const thisPlugin = window.plugin.PortalHistoryFlags;
	// Name of the IITC build for first-party plugins
	plugin_info.buildName = "PortalHistoryFlags";

	// Datetime-derived version of the plugin
	plugin_info.dateTimeVersion = "202102061410";

	// ID/name of the plugin
	plugin_info.pluginId = "portalhistoryflags";


    function svgToIcon(str, x) {
        const url = ("data:image/svg+xml," + encodeURIComponent(str)).replace(/#/g,'%23');
        return new L.Icon({
            iconUrl: url,
            iconSize:     [10, 10],
            iconAnchor:   [x, 24],
        })
    }

    thisPlugin.addToPortalMap = function (data) {
        if( data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 14 ){
            data.portal.options.data.agentVisited = false;
            data.portal.options.data.agentCaptured = false;
            data.portal.options.data.agentScouted = false;
        }
        if (data.portal.options.ent.length !== 3 || data.portal.options.ent[2].length < 14 || ( data.portal.options.ent[2].length >= 18 && !(data.portal.options.ent[2][18] > 0))) {
            return;
        }
        data.portal.options.data.agentVisited = (data.portal.options.ent[2][18] & 0b1) === 1;
        data.portal.options.data.agentCaptured = (data.portal.options.ent[2][18] & 0b10) === 2;
        data.portal.options.data.agentScouted = (data.portal.options.ent[2][18] & 0b100) === 4;
        drawPortalFlags(data.portal);
    }

    function drawPortalFlags(portal) {
        if (portal.options.data.agentVisited) {
            L.circle(portal._latlng,
                portal.options.radius + 10, thisPlugin.ornamentVisited
            ).addTo(thisPlugin.layerGroup);
        } else {
            L.circle(portal._latlng,
                portal.options.radius + 10, thisPlugin.ornamentUnVisited
            ).addTo(thisPlugin.invLayerGroup);
            L.circle(portal._latlng,
                portal.options.radius + 10, thisPlugin.ornamentUnVisited
            ).addTo(thisPlugin.unvisited);
        }

        if (portal.options.data.agentCaptured) {
            L.circle(portal._latlng,
                portal.options.radius + 15, thisPlugin.ornamentCaptured
            ).addTo(thisPlugin.layerGroup);
        } else {
            L.circle(portal._latlng,
                portal.options.radius + 15, thisPlugin.ornamentUnCaptured
            ).addTo(thisPlugin.invLayerGroup);
            L.circle(portal._latlng,
                portal.options.radius + 10, thisPlugin.ornamentUnCaptured
            ).addTo(thisPlugin.uncaptured);
        }

        if (portal.options.data.agentScouted) {
            L.circle(portal._latlng,
                portal.options.radius + 20, thisPlugin.ornamentScouted
            ).addTo(thisPlugin.layerGroup);
        } else {
            L.circle(portal._latlng,
                portal.options.radius + 20, thisPlugin.ornamentUnScouted
            ).addTo(thisPlugin.invLayerGroup);
            L.circle(portal._latlng,
                portal.options.radius + 10, thisPlugin.ornamentUnScouted
            ).addTo(thisPlugin.unscouted);
        }

    }

    function drawAllFlags() {
        thisPlugin.layerGroup.clearLayers();
        for (let portal of window.portals) {
            drawPortalFlags(portal);
        }
    }
    thisPlugin.unvisitedHighlight = function(data){
        let style = {};
        if((data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && (data.portal.options.ent[2][18] & 0b1) === 1)){
            style.fillOpacity = 0;
            style.stroke = false;
        } else {
            style.fillOpacity = 0.5;
            style.stroke = true;
        }
        data.portal.setStyle(style);
    }
    thisPlugin.uncapturedHighlight = function(data){
        let style = {};
        if((data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && (data.portal.options.ent[2][18] & 0b10) === 2)){
            style.fillOpacity = 0;
            style.stroke = false;
        } else {
            style.fillOpacity = 0.5;
            style.stroke = true;
        }
        data.portal.setStyle(style);
    }
    thisPlugin.unscoutedHighlight = function(data){
        let style = {};
        if((data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && (data.portal.options.ent[2][18] & 0b100) === 4)){
            style.fillOpacity = 0;
            style.stroke = false;
        } else {
            style.fillOpacity = 0.5;
            style.stroke = true;
        }
        data.portal.setStyle(style);
    }
	function setup() {
        thisPlugin.ornamentVisited = {color:"#9538ff", opacity:1, fillOpacity:0, weight:2, clickable:false}
        thisPlugin.ornamentCaptured = {color:"#ff0000", opacity:1, fillOpacity:0, weight:2, clickable:false}
        thisPlugin.ornamentScouted = {color:"#ff9c00", opacity:1, fillOpacity:0, weight:2, clickable:false}

        thisPlugin.ornamentUnVisited = {color:"#9538ff", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10,6]}
        thisPlugin.ornamentUnCaptured = {color:"#ff0000", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10,6]}
        thisPlugin.ornamentUnScouted = {color:"#ff9c00", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10,6]}


        thisPlugin.layerGroup = new L.LayerGroup();
        thisPlugin.invLayerGroup = new L.LayerGroup();
        thisPlugin.uncaptured = new L.LayerGroup();
        thisPlugin.unvisited = new L.LayerGroup();
        thisPlugin.unscouted = new L.LayerGroup();
        window.addLayerGroup('Portal History', thisPlugin.layerGroup, false);
        window.addLayerGroup('Portal History (Inverted)', thisPlugin.invLayerGroup, false);
        window.addLayerGroup('Portal History (Unvisited)', thisPlugin.unvisited, false);
        window.addLayerGroup('Portal History (Uncaptured)', thisPlugin.uncaptured, false);
        window.addLayerGroup('Portal History (Unscouted)', thisPlugin.unscouted, false);

        window.addHook('portalAdded', thisPlugin.addToPortalMap);

        window.addPortalHighlighter("Portal History: Unvisited Portals Only", thisPlugin.unvisitedHighlight);
        window.addPortalHighlighter("Portal History: Uncaptured Portals Only", thisPlugin.uncapturedHighlight);
        window.addPortalHighlighter("Portal History: Unscouted Portals Only", thisPlugin.unscoutedHighlight);
    }
    	setup.info = plugin_info; //add the script info data to the function as a property
	// if IITC has already booted, immediately run the 'setup' function
	if (window.iitcLoaded) {
		setup();
		} else {
			if (!window.bootPlugins) {
				window.bootPlugins = [];
			}
		window.bootPlugins.push(setup);
	}
}



(function () {
	const plugin_info = {};
	if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
		plugin_info.script = {
			version: GM_info.script.version,
			name: GM_info.script.name,
			description: GM_info.script.description
		};
	}
	// Greasemonkey. It will be quite hard to debug
	if (typeof unsafeWindow != 'undefined' || typeof GM_info == 'undefined' || GM_info.scriptHandler != 'Tampermonkey') {
	// inject code into site context
		const script = document.createElement('script');
		script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(plugin_info) + ');'));
		(document.body || document.head || document.documentElement).appendChild(script);
	} else {
		// Tampermonkey, run code directly
		wrapper(plugin_info);
	}
})();

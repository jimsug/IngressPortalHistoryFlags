// ==UserScript==
// @id portalHistoryFlags
// @name IITC Plugin: Portal History Flags
// @category Layer
// @version 0.0.4
// @namespace	https://github.com/jimsug/IngressPortalHistoryFlags
// @downloadURL	https://github.com/jimsug/IngressPortalHistoryFlags/raw/main/portalHistoryFlags.user.js
// @homepageURL	https://github.com/jimsug/IngressPortalHistoryFlags
// @description Shows Visited/Captured/Scouted status above portal markers
// @author EisFrei
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
	plugin_info.dateTimeVersion = "202102060112";

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
            L.marker(portal._latlng, {
                icon: thisPlugin.iconVisited,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.layerGroup);
        } else {
            L.marker(portal._latlng, {
                icon: thisPlugin.iconVisited,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.invLayerGroup);
            L.marker(portal._latlng, {
                icon: thisPlugin.iconVisited,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.unvisited);
        }

        if (portal.options.data.agentCaptured) {
            L.marker(portal._latlng, {
                icon: thisPlugin.iconCaptured,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.layerGroup);
        } else {
            L.marker(portal._latlng, {
                icon: thisPlugin.iconCaptured,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.invLayerGroup);
            L.marker(portal._latlng, {
                icon: thisPlugin.iconCaptured,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.uncaptured);
        }

        if (portal.options.data.agentScouted) {
            L.marker(portal._latlng, {
                icon: thisPlugin.iconScouted,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.layerGroup);
        } else {
            L.marker(portal._latlng, {
                icon: thisPlugin.iconScouted,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.invLayerGroup);
            L.marker(portal._latlng, {
                icon: thisPlugin.iconScouted,
                interactive: false,
                keyboard: false,
            }).addTo(thisPlugin.unscouted);
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
        if(!(data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && data.portal.options.ent[2][18] & 0b1 === 1)){
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
        if(!(data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && data.portal.options.ent[2][18] & 0b10 === 2)){
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
        if(!(data.portal.options.ent.length == 3 && data.portal.options.ent[2].length >= 18 && data.portal.options.ent[2][18] & 0b100 === 4)){
            style.fillOpacity = 0;
            style.stroke = false;
        } else {
            style.fillOpacity = 0.5;
            style.stroke = true;
        }
        data.portal.setStyle(style);
    }
	function setup() {
        thisPlugin.iconVisited = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#9538ff" cx="50" cy="50" r="50"/></svg>', 15);
        thisPlugin.iconCaptured = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#ff0000" cx="50" cy="50" r="50"/></svg>', 5);
        thisPlugin.iconScouted = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#ff9c00" cx="50" cy="50" r="50"/></svg>', -5);
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

        window.addPortalHighlighter("Unvisited", thisPlugin.unvisitedHighlight);
        window.addPortalHighlighter("Uncaptured", thisPlugin.uncapturedHighlight);
        window.addPortalHighlighter("Unscouted", thisPlugin.unscoutedHighlight);
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

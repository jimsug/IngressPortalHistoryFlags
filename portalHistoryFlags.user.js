// ==UserScript==
// @id portalHistoryFlags
// @name IITC Plugin: Portal History Flags
// @category Layer
// @version 0.0.8
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
    plugin_info.dateTimeVersion = "202102101115";

    // ID/name of the plugin
    plugin_info.pluginId = "portalhistoryflagsjimsug";


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
        if (thisPlugin.settings.mode === 'circles'){
            if (portal.options.data.agentVisited) {
                L.circle(portal._latlng,
                    portal.options.radius + 10, thisPlugin.ornamentVisited
                ).addTo(thisPlugin.visited);
            } else {
                L.circle(portal._latlng,
                    portal.options.radius + 10, thisPlugin.ornamentUnVisited
                ).addTo(thisPlugin.unvisited);
            }

            if (portal.options.data.agentCaptured) {
                L.circle(portal._latlng,
                    portal.options.radius + 15, thisPlugin.ornamentCaptured
                ).addTo(thisPlugin.captured);
            } else {
                L.circle(portal._latlng,
                    portal.options.radius + 15, thisPlugin.ornamentUnCaptured
                ).addTo(thisPlugin.uncaptured);
            }

            if (portal.options.data.agentScouted) {
                L.circle(portal._latlng,
                    portal.options.radius + 20, thisPlugin.ornamentScouted
                ).addTo(thisPlugin.scouted);
            } else {
                L.circle(portal._latlng,
                    portal.options.radius + 20, thisPlugin.ornamentUnScouted
                ).addTo(thisPlugin.unscouted);
            }
        } else {
            if (portal.options.data.agentVisited) {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconVisited,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.visited);
            } else {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconUnvisited,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.unvisited);
            }

            if (portal.options.data.agentCaptured) {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconCaptured,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.captured);
            } else {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconUncaptured,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.uncaptured);
            }

            if (portal.options.data.agentScouted) {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconScouted,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.scouted);
            } else {
                L.marker(portal._latlng, {
                    icon: thisPlugin.iconUnscouted,
                    interactive: false,
                    keyboard: false,
                }).addTo(thisPlugin.unscouted);
            }
        }

    }

    function drawAllFlags() {
        thisPlugin.captured.clearLayers();
        thisPlugin.visited.clearLayers();
        thisPlugin.scouted.clearLayers();
        thisPlugin.uncaptured.clearLayers();
        thisPlugin.unvisited.clearLayers();
        thisPlugin.unscouted.clearLayers();
        for (let id in window.portals) {
            drawPortalFlags(window.portals[id]);
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

    thisPlugin.getCurrentDisplayMode = function() {
        let m = "circles";
        if (thisPlugin.settings.mode == "dots") {
            m = "dots";
        } else {
            thisPlugin.settings.mode = "circles";
        }
        return m;
    }

    thisPlugin.toggleDisplayMode = function () {
        if (thisPlugin.settings.mode == "dots") {
            thisPlugin.settings.mode = "circles";
        } else {
            thisPlugin.settings.mode = "dots";
        }
        clickAnchor = document.getElementById(plugin_info.pluginId + '_mode').innerHTML = "History Display:" + thisPlugin.getCurrentDisplayMode();
        localStorage[KEY_SETTINGS] = JSON.stringify(thisPlugin.settings);
        drawAllFlags();
    }
    function setup() {

        try {
            thisPlugin.settings = JSON.parse(localStorage[KEY_SETTINGS]);
        } catch (e) {
            thisPlugin.settings = {};
            thisPlugin.settings.mode = "circles";
            localStorage[KEY_SETTINGS] = JSON.stringify(thisPlugin.settings)
        }

        thisPlugin.iconVisited = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#9538ff" cx="50" cy="50" r="50"/></svg>', 15);
        thisPlugin.iconCaptured = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#ff0000" cx="50" cy="50" r="50"/></svg>', 5);
        thisPlugin.iconScouted = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="#ff9c00" cx="50" cy="50" r="50"/></svg>', -5);

        thisPlugin.iconUnvisited = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="transparent" stroke-width="10" stroke="#9538ff" cx="50" cy="50" r="50"/></svg>', 15);
        thisPlugin.iconUncaptured = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="transparent" stroke-width="10" stroke="#ff0000" cx="50" cy="50" r="50"/></svg>', 5);
        thisPlugin.iconUnscouted = svgToIcon('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle fill="transparent" stroke-width="10" stroke="#ff9c00" cx="50" cy="50" r="50"/></svg>', -5);

        thisPlugin.ornamentVisited = {color:"#9538ff", opacity:1, fillOpacity:0, weight:2, clickable:false}
        thisPlugin.ornamentCaptured = {color:"#ff0000", opacity:1, fillOpacity:0, weight:2, clickable:false}
        thisPlugin.ornamentScouted = {color:"#ff9c00", opacity:1, fillOpacity:0, weight:2, clickable:false}

        thisPlugin.ornamentUnVisited = {color:"#9538ff", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10, 6 ]}
        thisPlugin.ornamentUnCaptured = {color:"#ff0000", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10, 6 ]}
        thisPlugin.ornamentUnScouted = {color:"#ff9c00", opacity:1, fillOpacity:0, weight:2, clickable:false, dashArray:[ 10, 6 ]}


        thisPlugin.visited = new L.LayerGroup();
        thisPlugin.captured = new L.LayerGroup();
        thisPlugin.scouted = new L.LayerGroup();
        thisPlugin.uncaptured = new L.LayerGroup();
        thisPlugin.unvisited = new L.LayerGroup();
        thisPlugin.unscouted = new L.LayerGroup();
        window.addLayerGroup('Portal History: Visited Portals', thisPlugin.visited, true);
        window.addLayerGroup('Portal History: Captured Portals', thisPlugin.captured, true);
        window.addLayerGroup('Portal History: Scouted Portals', thisPlugin.scouted, false);
        window.addLayerGroup('Portal History: Unvisited Portals', thisPlugin.unvisited, true);
        window.addLayerGroup('Portal History: Uncaptured Portals', thisPlugin.uncaptured, true);
        window.addLayerGroup('Portal History: Unscouted Portals', thisPlugin.unscouted, false);

        window.addHook('portalAdded', thisPlugin.addToPortalMap);

        window.addPortalHighlighter("Portal History: Unvisited Portals Only", thisPlugin.unvisitedHighlight);
        window.addPortalHighlighter("Portal History: Uncaptured Portals Only", thisPlugin.uncapturedHighlight);
        window.addPortalHighlighter("Portal History: Unscouted Portals Only", thisPlugin.unscoutedHighlight);
        let mode = thisPlugin.getCurrentDisplayMode();
         $('#toolbox').append('<a id="' + plugin_info.pluginId + '_mode" onclick="window.plugin.PortalHistoryFlags.toggleDisplayMode()">History Display: ' + mode + '</a>');
        setup.info = plugin_info; //add the script info data to the function as a property
    // if IITC has already booted, immediately run the 'setup' function
    }
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

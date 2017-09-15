var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/1tbJrFcH9yuBl5Hfkg8s7SZ-3b4blHBodAat6o-xGzbw/pubhtml";

var region_filters = [],
    affiliation_filters = [],
    timeline_filters = [];

$(document).ready(function () {
    Tabletop.init ({
        key: public_spreadsheet_url,
        callback: getData
    });
    
    $('#region-filter').multiselect({
        buttonWidth: '22%',
        numberDisplayed: 0,
        selectAllNumber: false,
        includeSelectAllOption: true,
        enableClickableOptGroups: true,
        nonSelectedText: 'Regions',
        allSelectedText: 'Regions (all)',
        
        onChange: function () {
            region_filters = $('#region-filter').val();
            searchByFilters();
            // console.log(region_filters);
        },
        
        onSelectAll: function () {
            region_filters = $('#region-filter').val();
            searchByFilters();
            // console.log(region_filters);
        },
        
        onDeselectAll: function () {
            region_filters = [];
            searchByFilters();
            // console.log(region_filters);
        }
    });
    $('#affiliation-filter').multiselect({
        buttonWidth: '22%',
        numberDisplayed: 0,
        selectAllNumber: false,
        includeSelectAllOption: true,
        nonSelectedText: 'Affiliations (0)',
        allSelectedText: 'Affiliations (all)',
        
        onChange: function () {
            affiliation_filters = $('#affiliation-filter').val();
            searchByFilters();
            // console.log(affiliation_filters);
        },
        
        onSelectAll: function () {
            affiliation_filters = $('#affiliation-filter').val();
            searchByFilters();
            // console.log(affiliation_filters);
        },
        
        onDeselectAll: function () {
            affiliation_filters = [];
            searchByFilters();
            // console.log(affiliation_filters);
        }
    });
    $('#timeline-filter').multiselect({
        buttonWidth: '22%',
        numberDisplayed: 0,
        selectAllNumber: false,
        includeSelectAllOption: true,
        enableClickableOptGroups: true,
        nonSelectedText: 'Years',
        allSelectedText: 'Years (all)',
        
        onChange: function () {
            timeline_filters = $('#timeline-filter').val();
            searchByFilters();
            // console.log(timeline_filters);
        },
        
        onSelectAll: function () {
            timeline_filters = $('#timeline-filter').val();
            searchByFilters();
            // console.log(timeline_filters);
        },

        onDeselectAll: function () {
            timeline_filters = [];
            searchByFilters();
            // console.log(timeline_filters);
        },
    });
});

function Contribution (id, topic, contributor, affiliation, subaffiliation, youtube_link, topic_abstract, time_period, region, keywords) {
    this.id = id;
    this.topic = topic;
    this.contributor = contributor;
    this.affiliation = affiliation;
    this.subaffiliation = subaffiliation;
    this.youtube_link = youtube_link;
    this.topic_abstract = topic_abstract;
    this.time_period = time_period;
    this.region = region;
    this.keywords = keywords;
}
function Region (id, name, desc, count, image) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.count = count;
    this.image = image;
    this.entries = [];
}
function Keyword (id, name, desc, count) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.keyword_count = count;
}

var contributions = [];
var contributionTotal = 0;
var regions = {};
var regionTotal = 0;
var keywords = {};
var keywordsTotal = 0;

function getData (data, tabletop) {
    $.each(tabletop.sheets("Regions").all(), function (i, current) {
        if (regions[current.region_name] == null) {
            regions[current.region_name] = new Region (regionTotal, current.region_name, current.region_desc, current.region_total, current.region_img_link);
            regionTotal ++;
        }
    });
    
    $.each(tabletop.sheets("Keywords").all(), function (i, current) {
       if (keywords[current.keyword_name] == null) {
           keywords[current.keyword_name] = new Keyword (keywordsTotal, current.keyword_name, current.keyword_desc, current.keyword_count);
           keywordsTotal ++;
       } 
    });
    
    $.each(tabletop.sheets("Map Data").all(), function (i, current) {
        if (current.topic != '' && current.contributor != '' && current.youtube_link != '') {
            var new_contribution = new Contribution (contributionTotal, current.topic, current.contributor, current.contributor_affiliation, current.contributor_subaffiliation, 
                                                        current.youtube_link, current.topic_abstract, current.time_period, current.region, [current.keyword_1, current.keyword_2, current.keyword_3, current.keyword_4, current.keyword_5]);
            if (current.region != '') { regions[current.region].entries.push(new_contribution); }

            addToSidebar (new_contribution);
            contributions.push(new_contribution);
            contributionTotal ++;
        }
    });
}

/*
 * Sidebar
 *
 * addToSidebar (new_contribution) -
 * openTopicModal (topic_id) -
 * clearSidebar() -
 * searchByFilters() -
 */

function addToSidebar (new_contribution) {
    var video_id = new_contribution.youtube_link.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    var truncated_topic_title = (new_contribution.topic.length > 20 ? new_contribution.topic.substring(0, 15) + "..." : new_contribution.topic);
    var truncated_topic_abstract = (new_contribution.topic_abstract.length > 100 ? new_contribution.topic_abstract.substring(0, 40) + "..." : new_contribution.topic_abstract);
    var new_sidebar_element =   '<div class="panel panel-default">' +
                                    '<div id="topic-sidebar-card-' + new_contribution.id + '" class="panel-body sidebar-panel" onClick="openTopicModal(' + new_contribution.id + ')">' +
                                        '<div class="media sidebar-media">' +
                                            '<div class="image-wrap sidebar-image">' +
                                                '<img class="media-image pull-left img-responsive" src="https://img.youtube.com/vi/' + video_id + '/mqdefault.jpg" style="max-width: 50%">' +
                                                '<input type="button" id="playlist-btn-' + new_contribution.id + '" class="btn btn-default playlist-add" onClick="addToPlaylist(' + new_contribution.id + ')" value="+" />' +
                                            '</div>' +
                                            '<div class="media-body" onClick="">' +
                                                '<h4 class="media-heading"><b>' + truncated_topic_title + '</b></h4>' + 
                                                '<small class="media-contributor" onClick="openContributorPage(' + new_contribution.id + ')">' + new_contribution.contributor + '</small>' + 
                                                '<p class="media-abstract">' + truncated_topic_abstract + '</p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' + 
                                '</div>';
    $("#sidebar-contents").append(new_sidebar_element);
}

function openTopicModal (topic_id) {
    $("#topic-modal").modal("show");
    $('.modal-keywords-items').empty();
    $('.modal-backdrop').appendTo('#map-container');
    
    var video_id = contributions[topic_id].youtube_link.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    var embedded_id = "https://www.youtube.com/embed/" + video_id;
    $('.modal-topic-video-frame').attr('src', embedded_id);
    
    $('.modal-topic-title').html(contributions[topic_id].topic);
    $('.modal-topic-contributor').html(contributions[topic_id].contributor);
    $('.modal-topic-contributor-affiliation').html(contributions[topic_id].affiliation + " - " + contributions[topic_id].subaffiliation);
    $('.modal-topic-time-period').html(contributions[topic_id].time_period);
    $('.modal-topic-region').html(contributions[topic_id].region);
    
    $('#modal-region-img').attr('src', regions[contributions[topic_id].region].image)
    $('.modal-topic-abstract').html(contributions[topic_id].topic_abstract);
    $('#modal-region-title').html(contributions[topic_id].region);
    $('.modal-transcript-download').attr('onClick', "alert('This should download the transcript ... '); return false;");
    $('.modal-add-to-playlist').attr('onClick', "addToPlaylist(" + topic_id + ");");
    
    contributions[topic_id].keywords.forEach(function (element) {
        if (element != '') {
            $('.modal-keywords-items').append('<li><a class="modal-topic-keyword" data-toggle="tooltip" data-placement="right" title="' + keywords[element].desc + '">' + element + '</a></li>');
        }
    });
    $('[data-toggle="tooltip"]').tooltip();   
}

function addToSearch (search_item) {
    $('#search-bar-input').value = search_item + " ";
}

function clearSidebar () {
    $('#sidebar-contents').empty();
}

function searchByFilters () {
    var search_request = $('#search-bar-input').val();
    search_request = search_request.toLowerCase();
    found_contributions = [];
    
    if (search_request == '') {
        if (jQuery.isEmptyObject(region_filters) && jQuery.isEmptyObject(affiliation_filters) && jQuery.isEmptyObject(timeline_filters)) {
            contributions.forEach(function (element) { found_contributions.push(element)});
        } else {
            contributions.forEach(function (element) {
                if ((region_filters.includes(element.region) || jQuery.isEmptyObject(region_filters)) 
                        && (affiliation_filters.includes(element.affiliation) || jQuery.isEmptyObject(affiliation_filters))
                        && (timeline_filters.includes(element.time_period) || jQuery.isEmptyObject(timeline_filters))) {

                    found_contributions.push (element);
                }
            });
        }
    } else if (search_request != '') {
        if (jQuery.isEmptyObject(region_filters) && jQuery.isEmptyObject(affiliation_filters) && jQuery.isEmptyObject(timeline_filters)) {
            contributions.forEach(function (element) {
                if (element.topic.toLowerCase().includes(search_request)
                        || element.contributor.toLowerCase().includes(search_request) 
                        || element.affiliation.toLowerCase().includes(search_request) 
                        || element.subaffiliation.toLowerCase().includes(search_request) 
                        || element.topic_abstract.toLowerCase().includes(search_request)) {
                    found_contributions.push (element);
                }
            });
        } else {
            contributions.forEach(function (element) {
                if (element.topic.toLowerCase().includes(search_request) || element.contributor.toLowerCase().includes(search_request) || element.affiliation.toLowerCase().includes(search_request) || element.subaffiliation.toLowerCase().includes(search_request) || element.topic_abstract.toLowerCase().includes(search_request) || element.region.toLowerCase().includes(search_request)) {
                    if ((region_filters.includes(element.region) || jQuery.isEmptyObject(region_filters)) 
                            && (affiliation_filters.includes(element.affiliation) || jQuery.isEmptyObject(affiliation_filters))
                            && (timeline_filters.includes(element.time_period) || jQuery.isEmptyObject(timeline_filters))) {
                    
                        found_contributions.push (element);
                    }
                }
            });
        }
    } else { console.log ("Error in searchByFilters() function!"); }
    
    clearSidebar();
    
    if (found_contributions.length != 0) {
        found_contributions.forEach (function (element) { 
            addToSidebar (element); 
        });
    } else {
        $('#sidebar-contents').append('<p>There are no entries under these specific filters. If you have a story you\'d like to share for these filters, please <a target="_blank" href="http://vietnamwarstories.indiana.edu/contact/">contact us</a>!</p>');
    }
}

function openRegionContributions (region_id) {
    alert('You\'ve opened the ' + regions[region_id].name + " region. " + regions[region_id].desc + " This region has " + regions[region_id].entries.length + " stories.");
}

/* Playlists
 * 
 * addToPlaylist(id) - adds the respective Contribution to the playlist array, changes onClick() function to remove
 * removeFromPlaylist(id) - removes the respective Contribution from the playlist array, changes onClick() function to add
 * showPlaylist() - displays the modal containing information about item(s) in the playlist array
 * 
 */

var youtube_playlist = {};
function addToPlaylist(id) {
    if (youtube_playlist[id] == null) { 
        youtube_playlist[id] = contributions[id];
        $('#playlist-button').text('My Playlist (' + Object.keys(youtube_playlist).length + ')');
        $('#playlist-btn-' + id).attr('onclick', 'removeFromPlaylist(' + id + ')');
        $('#playlist-btn-' + id).attr('value', '-');
    } else {
        alert('You\'ve already added that video to your playlist! (This is a known error and will be fixed!)');
    }
}

function removeFromPlaylist(id) {
    delete youtube_playlist[id];
    $('#playlist-button').text('My Playlist (' + Object.keys(youtube_playlist).length + ')');
    $('#playlist-btn-' + id).attr('onclick', 'addToPlaylist(' + id + ')');
    $('#playlist-btn-' + id).attr('value', '+');
}

var is_playlist_active = false;
function showPlaylist() {
    if (jQuery.isEmptyObject (youtube_playlist)) {
        $("#playlist-button").popover("toggle");
        setTimeout(function(){ $("#playlist-button").popover("toggle"); }, 2000);
    } else {
        clearSidebar();
        if (is_playlist_active) {
            is_playlist_active = false;
            $('#playlist-button').text('My Playlist (' + Object.keys(youtube_playlist).length + ')');
            searchByFilters();
        } else {
            for (var video_id in youtube_playlist) {
                addToSidebar(contributions[video_id]);
            }
            is_playlist_active = true;
            $("#playlist-button").html('My Playlist (x)');
        }        
    }
}

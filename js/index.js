var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/1tbJrFcH9yuBl5Hfkg8s7SZ-3b4blHBodAat6o-xGzbw/pubhtml";

var affiliations_filters = [],
    regions_filters = [],
    years_filters = [];

$(document).ready(function () {
    Tabletop.init ({
        key: public_spreadsheet_url,
        callback: getData
    });
    
    $('#affiliations-filter').multiselect({
        includeSelectAllOption: true,
        buttonText: function(options, select) {
            var total_options = $('#affiliations-filter').children('option').length;
            if (options.length == 0) {
                return 'Affiliations (0)';
            } else if (options.length === total_options) {
                return 'Affiliations (all)';
            } else {
                return 'Affiliations (' + options.length + ')';
            }
        },
        
        onChange: function () {
            affiliations_filters = $('#affiliations-filter').val();
            console.log("AFFILIATIONS: " + affiliations_filters);
            searchByFilters();
        },
        onSelectAll: function () {
            affiliations_filters = $('#affiliations-filter').val();
            console.log("AFFILIATIONS: " + affiliations_filters);
            searchByFilters();
        },
        onDeselectAll: function () {
            affiliations_filters = [];
            console.log("AFFILIATIONS: " + affiliations_filters);
            searchByFilters();
        }
    });
    $('#regions-filter').multiselect({
        includeSelectAllOption: true,
        buttonText: function(options, select) {
            var total_options = $('#regions-filter').children('option').length;
            if (options.length == 0) {
                return 'Regions (0)';
            } else if (options.length === total_options) {
                return 'Regions (all)';
            } else {
                return 'Regions (' + options.length + ')';
            }
        },
        
        onChange: function () {
            regions_filters = $('#regions-filter').val();
            console.log("REGIONS: " + regions_filters);
            searchByFilters();
        },
        onSelectAll: function () {
            regions_filters = $('#regions-filter').val();
            console.log("REGIONS: " + regions_filters);
            searchByFilters();
        },
        onDeselectAll: function () {
            regions_filters = [];
            console.log("REGIONS: " + regions_filters);
            searchByFilters();
        }
    });
    $('#years-filter').multiselect({
        includeSelectAllOption: true,             
        buttonText: function(options, select) {
            var total_options = $('#years-filter').children('option').length;
            if (options.length == 0) {
                return 'Years (0)';
            } else if (options.length === total_options) {
                return 'Years (all)';
            } else {
                return 'Years (' + options.length + ')';
            }
        },
        
        onChange: function () {
            years_filters = $('#years-filter').val();
            console.log("YEARS: " + years_filters);
            searchByFilters();
        },
        onSelectAll: function () {
            years_filters = $('#years-filter').val();
            console.log("YEARS: " + years_filters);
            searchByFilters();
        },
        onDeselectAll: function () {
            years_filters = $('#years-filter').val();
            console.log("YEARS: " + years_filters);
            searchByFilters();
        }
    });
})

function Topic (id, topic, contributor, affiliation, subaffiliation, youtube_link, topic_abstract, time_period, region, keywords) {
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
    this.inPlaylist = false;
}
function Contributor (id, name, affiliation, subaffiliation, total_contributions) {
    this.id = id;
    this.name = name;
    this.affiliation = affiliation;
    this.subaffiliation = subaffiliation;
    this.total_contributions = total_contributions;
    this.transcript_link = '';
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

var topics = [];
var topicTotal = 0;
var contributors = {};
var contributorsTotal = 0;
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
    $.each(tabletop.sheets("Glossary").all(), function (i, current) {
       if (keywords[current.keyword_name] == null) {
           keywords[current.keyword_name] = new Keyword (keywordsTotal, current.keyword_name, current.keyword_desc, current.keyword_count);
           keywordsTotal ++;
       } 
    });
    $.each(tabletop.sheets("Contributors").all(), function (i, current) {
        if (contributors[current.contributor_name] == null) {
            contributors[current.contributor_name] = new Contributor (contributorsTotal, current.contributor_name, current.primary_affiliation, current.secondary_affiliation, current.total_contributions);
            contributorsTotal ++;
            
            if (current.transcript_link != '') { contributors[current.contributor_name].transcript_link = current.transcript_link; console.log (contributors[current.contributor_name])}
        }
    });  
    $.each(tabletop.sheets("Map Data").all(), function (i, current) {
        if (current.topic != '' && current.contributor != '' && current.youtube_link != '') {
            var new_topic = new Topic (topicTotal, current.topic, current.contributor, current.contributor_affiliation, current.contributor_subaffiliation, 
                                       current.youtube_link, current.topic_abstract, current.time_period, current.region, [current.keyword_1, current.keyword_2, current.keyword_3, current.keyword_4, current.keyword_5]);
            // if (current.region != '') { regions[current.region].entries.push(new_contribution); }

            addToSidebar (new_topic);
            topics.push(new_topic);
            topicTotal ++;
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

function addToSidebar (new_topic) {
    var video_id = new_topic.youtube_link.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    var new_sidebar_element =   '<div class="panel panel-default results-panel">' +
                                    '<div id="topic-sidebar-card-' + new_topic.id + '" class="results-panel-body" onClick="openTopicModal(' + new_topic.id + ')">' +
                                        '<div class="media results-sidebar-media">' +
                                            '<div class="image-wrap topic-yt-thumbnail">' +
                                                '<img class="results-media-image img-responsive pull-left" src="https://img.youtube.com/vi/' + video_id + '/mqdefault.jpg">' +
                                                '<input type="button" id="playlist-btn-' + new_topic.id + '" class="btn btn-secondary pull-left results-add-playlist-button" value="+" />' +
                                            '</div>' +
                                            '<div class="media-body results-media-body">' +
                                                '<h4 class="results-media-heading"><b>' + new_topic.topic + '</b></h4>' + 
                                                '<p class="results-media-contributor"><small>' + new_topic.contributor + ' (' + contributors[new_topic.contributor].total_contributions + ')</small></p>' + 
                                                '<p class="results-media-abstract-excerpt"><small>' + new_topic.topic_abstract + '</small></p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' + 
                                '</div>';
    $("#results-container").append(new_sidebar_element);
    if (new_topic.inPlaylist) {
        $("#playlist-btn-" + new_topic.id).attr("onClick", "removeFromPlaylist(" + new_topic.id + ")");
        $("#playlist-btn-" + new_topic.id).attr("value", "-");
    } else {
        $("#playlist-btn-" + new_topic.id).attr("onClick", "addToPlaylist(" + new_topic.id + ")");
        $("#playlist-btn-" + new_topic.id).attr("value", "+");
    }
    
}

function openTopicModal (topic_id) {
    $("#topic-modal").modal("show");
    $('.modal-keywords-items').empty();
    $('.modal-backdrop').appendTo('#map-container');
    
    var video_id = topics[topic_id].youtube_link.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    var embedded_id = "https://www.youtube.com/embed/" + video_id;
    $('.modal-topic-video-frame').attr('src', embedded_id);
    
    $('.modal-topic-title').html(topics[topic_id].topic);
    $('.modal-topic-contributor').html(topics[topic_id].contributor + "   |   " + contributors[topics[topic_id].contributor].affiliation + " | " + contributors[topics[topic_id].contributor].subaffiliation);
    $('.modal-topic-time-period').html("<b>" + topics[topic_id].region + " | " + topics[topic_id].time_period + "</b>");

    
    $('#modal-region-img').attr('src', regions[topics[topic_id].region].image)
    $('.modal-topic-abstract').html(topics[topic_id].topic_abstract);
    $('#modal-region-title').html(topics[topic_id].region);
    $('.modal-transcript-download').attr('onClick', 'downloadTranscript(' + topic_id + ');'); 
    
    topics[topic_id].keywords.forEach(function (element) {
        if (element != '') {
            $('.modal-keywords-items').append('<li><a class="modal-topic-keyword" data-toggle="tooltip" data-placement="right" title="' + keywords[element].desc + '">' + element + '</a></li>');
        }
    });
    $('[data-toggle="tooltip"]').tooltip();   
}
$('#topic-modal').on('shown.bs.modal', function() {
    $(document).off('focusin.modal');
});

function downloadTranscript(topic_id) {
    alert(contributors[topics[topid_id].contributor].transcript_link);
    return false;
}

function addToSearch (search_item) {
    $('#search-bar-input').value = search_item + " ";
}

function clearSidebar () {
    $('#results-container').empty();
}

/* This is REALLY sloppy, need to fix! */
function filterByRegion (region) {
    $('#regions-filter').multiselect ('deselectAll', false);
    $("#regions-filter").multiselect ('select', [region]);
    clearSidebar();
    
    var found_topics = 0;
    topics.forEach (function (element) {
       if (element.region == region) {
           addToSidebar(element);
           found_topics ++;
       }
    });
    
    if (found_topics == 0) {
       $('#results-container').append('<p>There are no entries under these specific filters. If you have a story you\'d like to share for these filters, please <a target="_blank" href="http://vietnamwarstories.indiana.edu/contact/">contact us</a>!</p>');
    }
}

function searchByFilters () {
    var search_request = $('#search-bar').val();
    search_request = search_request.toLowerCase();
    found_topics = [];
    
    topics.forEach(function (element) {
        console.log (element);
    })
    
    if (search_request == '') {
        if (jQuery.isEmptyObject(regions_filters) && jQuery.isEmptyObject(affiliations_filters) && jQuery.isEmptyObject(years_filters)) {
            topics.forEach(function (element) { found_topics.push(element)});
        } else {
            topics.forEach(function (element) {
                if ((regions_filters.includes(element.region) || jQuery.isEmptyObject(regions_filters)) 
                        && (affiliations_filters.includes(contributors[element.contributor].affiliation) || jQuery.isEmptyObject(affiliations_filters))
                        && (years_filters.includes(element.time_period) || jQuery.isEmptyObject(years_filters))) {
                    found_topics.push (element);
                }
            });
        }
    } else if (search_request != '') {
        if (jQuery.isEmptyObject(regions_filters) && jQuery.isEmptyObject(affiliations_filters) && jQuery.isEmptyObject(years_filters)) {
            topics.forEach(function (element) {
                if (element.topic.toLowerCase().includes(search_request)
                        || element.contributor.toLowerCase().includes(search_request) 
                        || contributors[element.contributor].affiliation.toLowerCase().includes(search_request) 
                        || contributors[element.contributor].subaffiliation.toLowerCase().includes(search_request) 
                        || element.topic_abstract.toLowerCase().includes(search_request)) {
                    found_topics.push (element);
                }
            });
        } else {
            topics.forEach(function (element) {
                if (element.topic.toLowerCase().includes(search_request) || element.contributor.toLowerCase().includes(search_request) || contributors[element.contributor].affiliation.toLowerCase().includes(search_request) || contributors[element.contributor].subaffiliation.toLowerCase().includes(search_request) || element.topic_abstract.toLowerCase().includes(search_request) || element.region.toLowerCase().includes(search_request)) {
                    if ((regions_filters.includes(element.region) || jQuery.isEmptyObject(regions_filters)) 
                            && (affiliations_filters.includes(element.affiliation) || jQuery.isEmptyObject(affiliation_filters))
                            && (years_filters.includes(element.time_period) || jQuery.isEmptyObject(timeline_filters))) {
                        found_topics.push (element);
                    }
                }
            });
        }
    } else { console.log ("Error in searchByFilters() function!"); }
    
    clearSidebar();
    
    if (found_topics.length != 0) {
        found_topics.forEach (function (element) { 
            addToSidebar (element); 
        });
    } else {
        $('#results-container').append('<p>There are no entries under these specific filters. If you have a story you\'d like to share for these filters, please <a target="_blank" href="http://vietnamwarstories.indiana.edu/contact/">contact us</a>!</p>');
    }
    
    return false;
}

function showRegionInfo(region_id) {
    var isRegionInfoVisible = $('#region-info-panel').is(':visible');
    $('#region-info-panel').css('display', 'block');
    $('.region-detailed-name').html(regions[region_id].name);
    $('.region-detailed-description').html(regions[region_id].desc);
    $('.region-count').html(regions[region_id].count);
    $('.region-detailed-image').attr('src', 'images/detailed-maps/' + regions[region_id].image);

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
        youtube_playlist[id] = topics[id];
        topics[id].inPlaylist = true;
        $('#playlist-button').text('Playlist (' + Object.keys(youtube_playlist).length + ')');
        $('#playlist-btn-' + id).attr('onclick', 'removeFromPlaylist(' + id + ')');
        $('#playlist-btn-' + id).attr('value', '-');
    } 
}

function removeFromPlaylist(id) {
    delete youtube_playlist[id];
    topics[id].inPlaylist = false;
    $('#playlist-button').text('Playlist (' + Object.keys(youtube_playlist).length + ')');
    $('#playlist-btn-' + id).attr('onclick', 'addToPlaylist(' + id + ')');
    $('#playlist-btn-' + id).attr('value', '+');
}

var is_playlist_active = false;
function togglePlaylist() {
    if (jQuery.isEmptyObject (youtube_playlist) && !is_playlist_active) {
        $("#playlist-button").popover("toggle");
        setTimeout(function(){ $("#playlist-button").popover("toggle"); }, 2000);
    } else {
        clearSidebar();
        if (is_playlist_active) {
            is_playlist_active = false;
            $('#playlist-button').text('Playlist (' + Object.keys(youtube_playlist).length + ')');
            searchByFilters();
        } else {
            for (var video_id in youtube_playlist) {
                addToSidebar(topics[video_id]);
            }
            is_playlist_active = true;
            $("#playlist-button").html('Playlist (x)');
        }        
    }
}
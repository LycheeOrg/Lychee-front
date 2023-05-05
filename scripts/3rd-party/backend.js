/**
 * @typedef {Object} LycheeException
 * @property {string} message     the message of the exception
 * @property {string} exception   the (base) name of the exception class; in developer mode the backend reports the full class name, in productive mode only the base name
 * @property {string} [file]      the file name where the exception has been thrown; only in developer mode
 * @property {number} [line]      the line number where the exception has been thrown; only in developer mode
 * @property {Array} [trace]      the backtrace; only in developer mode
 * @property {?LycheeException} [previous_exception] the previous exception, if any; only in developer mode
 */

/**
 * @typedef Version
 *
 * @property {int} major
 * @property {int} minor
 * @property {int} patch
 */

/**
 * @typedef Photo
 *
 * @property {string}       id
 * @property {string}       title
 * @property {?string}      description
 * @property {string[]}     tags
 * @property {boolean}      is_public
 * @property {?string}      type
 * @property {?string}      iso
 * @property {?string}      aperture
 * @property {?string}      make
 * @property {?string}      model
 * @property {?string}      lens
 * @property {?string}      shutter
 * @property {?string}      focal
 * @property {?number}      latitude
 * @property {?number}      longitude
 * @property {?number}      altitude
 * @property {?number}      img_direction
 * @property {?string}      location
 * @property {?string}      taken_at
 * @property {?string}      taken_at_orig_tz
 * @property {boolean}      is_starred
 * @property {?string}      live_photo_url
 * @property {?string}      album_id
 * @property {string}       checksum
 * @property {string}       license
 * @property {string}       created_at
 * @property {string}       updated_at
 * @property {?string}      live_photo_content_id
 * @property {?string}      live_photo_checksum
 * @property {SizeVariants} size_variants
 * @property {?string}      [next_photo_id]
 * @property {?string}      [previous_photo_id]
 * @property {PhotoRightsDTO} rights
 */

/**
 * @typedef SizeVariants
 *
 * @property {SizeVariant}  original
 * @property {?SizeVariant} medium2x
 * @property {?SizeVariant} medium
 * @property {?SizeVariant} small2x
 * @property {?SizeVariant} small
 * @property {?SizeVariant} thumb2x
 * @property {?SizeVariant} thumb
 */

/**
 * @typedef SizeVariant
 *
 * @property {number} type
 * @property {string} url
 * @property {number} width
 * @property {number} height
 * @property {number} filesize
 */

/**
 * @typedef SortingCriterion
 *
 * @property {string} column
 * @property {string} order
 */

/**
 * @typedef Album
 *
 * @property {string}  id
 * @property {string}  parent_id
 * @property {string}  created_at
 * @property {string}  updated_at
 * @property {string}  title
 * @property {?string} description
 * @property {string}  license
 * @property {Photo[]} photos
 * @property {Album[]} [albums]
 * @property {?string} cover_id
 * @property {?Thumb}  thumb
 * @property {string}  [owner_name] optional, only shown in authenticated mode
 * @property {boolean} is_nsfw
 * @property {AlbumRightsDTO} rights
 * @property {AlbumProtectionPolicy} policy
 * @property {boolean} num_albums
 * @property {boolean} num_photos
 * @property {?string} min_taken_at
 * @property {?string} max_taken_at
 * @property {?SortingCriterion} sorting
 */

/**
 * @typedef TagAlbum
 *
 * @property {string}   id
 * @property {string}   created_at
 * @property {string}   updated_at
 * @property {string}   title
 * @property {?string}  description
 * @property {string[]} show_tags
 * @property {Photo[]}  photos
 * @property {?Thumb}   thumb
 * @property {string}   [owner_name] optional, only shown in authenticated mode
 * @property {boolean} is_nsfw
 * @property {AlbumRightsDTO} rights
 * @property {AlbumProtectionPolicy} policy
 * @property {?string}  min_taken_at
 * @property {?string}  max_taken_at
 * @property {?SortingCriterion}  sorting
 * @property {boolean}  is_tag_album always true
 */

/**
 * @typedef SmartAlbum
 *
 * @property {string}  id
 * @property {string}  title
 * @property {Photo[]} [photos]
 * @property {?Thumb}  thumb
 * @property {AlbumRightsDTO} rights
 * @property {AlbumProtectionPolicy} policy
 */

/**
 * @typedef Thumb
 *
 * @property {string}  id
 * @property {string}  type
 * @property {string}  thumb
 * @property {?string} thumb2x
 */

/**
 * @typedef SharingInfo
 *
 * DTO returned by `Sharing::list`
 *
 * @property {{id: number, album_id: string, user_id: number, username: string, title: string}[]} shared
 * @property {{id: string, title: string}[]}                                                      albums
 * @property {{id: number, username: string}[]}                                                   users
 */

/**
 * @typedef SearchResult
 *
 * DTO returned by `Search::run`
 *
 * @property {Album[]}    albums
 * @property {TagAlbum[]} tag_albums
 * @property {Photo[]}    photos
 * @property {string}     checksum - checksum of the search result to
 *                                   efficiently determine if the result has
 *                                   changed since the last time
 */

/**
 * @typedef Albums
 *
 * @property {SmartAlbums} smart_albums
 * @property {TagAlbum[]}  tag_albums
 * @property {Album[]}     albums
 * @property {Album[]}     shared_albums
 */

/**
 * @typedef SmartAlbums
 *
 * @property {?SmartAlbum} unsorted
 * @property {?SmartAlbum} starred
 * @property {?SmartAlbum} public
 * @property {?SmartAlbum} recent
 * @property {?SmartAlbum} on_this_day
 */

/**
 * The IDs of the built-in, smart albums.
 *
 * @type {Readonly<{RECENT: string, STARRED: string, PUBLIC: string, UNSORTED: string, ON_THIS_DAY: string}>}
 */
const SmartAlbumID = Object.freeze({
	UNSORTED: "unsorted",
	STARRED: "starred",
	PUBLIC: "public",
	RECENT: "recent",
	ON_THIS_DAY: "on_this_day",
});

/**
 * @typedef User
 *
 * @property {number}  id
 * @property {string}  username
 * @property {string}  email
 * @property {boolean} has_token
 */

/**
 * @typedef UserWithCapabilitiesDTO
 *
 * @property {number}  id
 * @property {string}  username
 * @property {boolean} may_administrate
 * @property {boolean} may_upload
 * @property {boolean} may_edit_own_settings
 */

/**
 * @typedef WebAuthnCredential
 *
 * @property {string} id
 */

/**
 * @typedef PositionData
 *
 * @property {?string} id - album ID
 * @property {?string} title - album title
 * @property {Photo[]} photos
 * @property {?string} track_url - URL to GPX track
 */

/**
 * @typedef ConfigSetting
 *
 * @property {number} id
 * @property {string} key
 * @property {?string} value - TODO: this should have the correct type depending on `type_range`
 * @property {string} cat
 * @property {string} type_range
 * @property {number} confidentiality - `0`: public setting, `2`: informational, `3`: admin only
 * @property {string} description
 */

/**
 * @typedef LogEntry
 *
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} type
 * @property {string} function
 * @property {number} line
 * @property {string} text
 */

/**
 * @typedef DiagnosticInfo
 *
 * @property {string[]} errors
 * @property {string[]} infos
 * @property {string[]} configs
 * @property {number} update - `0`: not on master branch; `1`: up-to-date; `2`: not up-to-date; `3`: requires migration
 */

/**
 * @typedef FrameSettings
 *
 * @property {number} refresh
 */

/**
 * @typedef InitializationData
 *
 * @property {?User} user
 * @property {GlobalRightsDTO} rights
 * @property {boolean} update_json
 * @property {boolean} update_available
 * @property {Object.<string, string>} locale
 * @property {ConfigurationData} config
 */

/**
 * @typedef Feed
 *
 * @property {string} url
 * @property {string} mimetype
 * @property {string} title
 */

/**
 * @typedef ConfigurationData
 *
 * @property {string}   album_decoration
 * @property {string}   album_decoration_orientation
 * @property {string}   album_subtitle_type
 * @property {string}   allow_username_change    - actually a boolean
 * @property {string}   check_for_updates        - actually a boolean
 * @property {string}   [default_license]
 * @property {string}   [delete_imported]        - actually a boolean
 * @property {string}   grants_download          - actually a boolean
 * @property {string}   [dropbox_key]
 * @property {string}   editor_enabled           - actually a boolean
 * @property {string}   rss_enable               - actually a boolean
 * @property {Feed[]}   rss_feeds                - array of RSS feeds
 * @property {string}   grants_full_photo_access - actually a boolean
 * @property {string}   image_overlay_type
 * @property {string}   landing_page_enable      - actually a boolean
 * @property {string}   lang
 * @property {string[]} lang_available
 * @property {string}   layout                   - actually a number: `0`, `1` or `2`
 * @property {string}   [location]
 * @property {string}   location_decoding        - actually a boolean
 * @property {string}   location_show            - actually a boolean
 * @property {string}   location_show_public     - actually a boolean
 * @property {string}   map_display              - actually a boolean
 * @property {string}   map_display_direction    - actually a boolean
 * @property {string}   map_display_public       - actually a boolean
 * @property {string}   map_include_subalbums    - actually a boolean
 * @property {string}   map_provider
 * @property {string}   new_photos_notification  - actually a boolean
 * @property {string}   nsfw_blur                - actually a boolean
 * @property {string}   nsfw_visible             - actually a boolean
 * @property {string}   nsfw_warning             - actually a boolean
 * @property {string}   nsfw_warning_admin       - actually a boolean
 * @property {string}   nsfw_banner_override     - custom HTML instead of the default NSFW banner
 * @property {string}   public_photos_hidden     - actually a boolean
 * @property {string}   public_search            - actually a boolean
 * @property {string}   share_button_visible     - actually a boolean
 * @property {string}   [skip_duplicates]        - actually a boolean
 * @property {SortingCriterion} sorting_albums
 * @property {SortingCriterion} sorting_photos
 * @property {string}   swipe_tolerance_x        - actually a number
 * @property {string}   swipe_tolerance_y        - actually a number
 * @property {string}   upload_processing_limit  - actually a number
 * @property {?Version} version                  - Version number
 * @property {SmartAlbumVisibility} smart_album_visibilty - visibility of smart albums
 */

/**
 * The JSON object for incremental reports sent by the
 * back-end within a streamed response.
 *
 * @typedef ImportReport
 *
 * @property {string} type - indicates the type of report;
 *                           `'progress'`: {@link ImportProgressReport},
 *                           `'event'`: {@link ImportEventReport}
 */

/**
 * The JSON object for cumulative progress reports sent by the
 * back-end within a streamed response.
 *
 * @typedef ImportProgressReport
 *
 * @property {string} type - `'progress'`
 * @property {string} path
 * @property {number} progress
 */

/**
 * The JSON object for events sent by the back-end within a streamed response.
 *
 * @typedef ImportEventReport
 *
 * @property {string} type - `'event'`
 * @property {string} subtype - the subtype of event; equals the base name of the exception class which caused this event on the back-end
 * @property {number} severity - either `'debug'`, `'info'`, `'notice'`, `'warning'`, `'error'`, `'critical'` or `'emergency'`
 * @property {?string} path - the path to the affected file or directory
 * @property {string} message - a message text
 */

/**
 * The JSON object for Policy on Albums
 *
 * @typedef AlbumProtectionPolicy
 *
 * @property {is_nsfw} boolean
 * @property {boolean} is_public
 * @property {boolean} is_link_required
 * @property {boolean} is_password_required
 * @property {boolean} grants_full_photo_access
 * @property {boolean} grants_download
 */

/**
 * The JSON object for Rights on users management
 *
 * @typedef UserManagementRightsDTO
 *
 * @property {boolean} can_create
 * @property {boolean} can_list
 * @property {boolean} can_edit
 * @property {boolean} can_delete
 */

/**
 * The JSON object for Rights on a User
 *
 * @typedef UserRightsDTO
 *
 * @property {boolean} can_edit
 * @property {boolean} can_use_2fa
 */

/**
 * The JSON object for Rights on Settings
 *
 * @typedef SettingsRightsDTO
 *
 * @property {boolean} can_edit
 * @property {boolean} can_see_logs
 * @property {boolean} can_clear_logs
 * @property {boolean} can_see_diagnostics
 * @property {boolean} can_update
 */

/**
 * The JSON object for Rights on Settings
 *
 * @typedef RootAlbumRightsDTO
 *
 * @property {boolean} can_edit
 * @property {boolean} can_upload
 * @property {boolean} can_download
 * @property {boolean} can_import_from_server
 */

/**
 * The JSON object for Rights on Photos
 *
 * @typedef PhotoRightsDTO
 *
 * @property {boolean} can_edit
 * @property {boolean} can_download
 * @property {boolean} can_access_full_photo
 */

/**
 * The JSON object for Rights on Album
 *
 * @typedef AlbumRightsDTO
 *
 * @property {boolean} can_edit
 * @property {boolean} can_share_with_users
 * @property {boolean} can_download
 * @property {boolean} can_upload
 */

/**
 * The JSON object for Rights on Global Application
 *
 * @typedef GlobalRightsDTO
 *
 * @property {RootAlbumRightsDTO} root_album
 * @property {SettingsRightsDTO} settings
 * @property {UserManagementRightsDTO} user_management
 * @property {UserRightsDTO} user
 */

/**
 * The JSON object containing the visibility of smart albums
 *
 * @typedef SmartAlbumVisibility
 *
 * @property {boolean} recent
 * @property {boolean} starred
 * @property {boolean} on_this_day
 */

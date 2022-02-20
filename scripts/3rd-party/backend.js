/**
 * @typedef {Object} LycheeException
 * @property {string} message     the message of the exception
 * @property {string} [exception] the name of the exception class; only in developer mode
 * @property {string} [file]      the file name where the exception has been thrown; only in developer mode
 * @property {number} [line]      the line number where the exception has been thrown; only in developer mode
 * @property {Array} [trace]      the backtrace; only in developer mode
 * @property {?LycheeException} [previous_exception] the previous exception, if any; only in developer mode
 */

/**
 * @typedef Photo
 *
 * @property {string}       id
 * @property {string}       title
 * @property {?string}      description
 * @property {string[]}     tags
 * @property {number}       is_public
 * @property {?string}      type
 * @property {number}       filesize
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
 * @property {boolean}      is_downloadable
 * @property {boolean}      is_share_button_visible
 * @property {?string}      [next_photo_id]
 * @property {?string}      [previous_photo_id]
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
 * @property {boolean} is_public
 * @property {boolean} is_downloadable
 * @property {boolean} is_share_button_visible
 * @property {boolean} is_nsfw
 * @property {boolean} grants_full_photo
 * @property {boolean} requires_link
 * @property {boolean} has_password
 * @property {boolean} has_albums
 * @property {?string} min_taken_at
 * @property {?string} max_taken_at
 * @property {?string} sorting_col
 * @property {?string} sorting_order
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
 * @property {boolean}  is_public
 * @property {boolean}  is_downloadable
 * @property {boolean}  is_share_button_visible
 * @property {boolean}  is_nsfw
 * @property {boolean}  grants_full_photo
 * @property {boolean}  requires_link
 * @property {boolean}  has_password
 * @property {?string}  min_taken_at
 * @property {?string}  max_taken_at
 * @property {?string}  sorting_col
 * @property {?string}  sorting_order
 * @property {boolean}  is_tag_album always true
 */

/**
 * @typedef SmartAlbum
 *
 * @property {string}  id
 * @property {string}  title
 * @property {Photo[]} photos
 * @property {?Thumb}  thumb
 * @property {boolean} is_public
 * @property {boolean} is_downloadable
 * @property {boolean} is_share_button_visible
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
 * DTP returned by `Search::run`
 *
 * @property {(Album|TagAlbum)[]} albums
 * @property {Photo[]}            photos
 * @property {string}             checksum - checksum of the search result to
 *                                           efficiently determine if the
 *                                           result has changed since the last
 *                                           time
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
 * @property {SmartAlbum} unsorted
 * @property {SmartAlbum} starred
 * @property {SmartAlbum} public
 * @property {SmartAlbum} recent
 */

/**
 * The IDs of the built-in, smart albums.
 *
 * @type {Readonly<{RECENT: string, STARRED: string, PUBLIC: string, UNSORTED: string}>}
 */
const SmartAlbumID = Object.freeze({
	UNSORTED: "unsorted",
	STARRED: "starred",
	PUBLIC: "public",
	RECENT: "recent",
});

/**
 * @typedef User
 *
 * @property {number}  id
 * @property {string}  username
 * @property {?string} email
 * @property {boolean} may_upload
 * @property {boolean} is_locked
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
 */

/**
 * @typedef EMailData
 *
 * @property {?string} email
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
 * @property {number} status - `0`: no config, `1`: unauthenticated, `2`: authenticated
 * @property {boolean} admin
 * @property {boolean} may_upload
 * @property {boolean} is_locked
 * @property {number} update_json - version number of latest available update
 * @property {boolean} update_available
 * @property {Object.<string, string>} locale
 * @property {string} [username] - only if user is not the admin; TODO: Change that
 * @property {ConfigurationData} config
 * @property {DeviceConfiguration} config_device
 */

/**
 * @typedef ConfigurationData
 *
 * @property {string}   album_subtitle_type
 * @property {string}   check_for_updates       - actually a boolean
 * @property {string}   [default_license]
 * @property {string}   [delete_imported]       - actually a boolean
 * @property {string}   downloadable            - actually a boolean
 * @property {string}   [dropbox_key]
 * @property {string}   editor_enabled          - actually a boolean
 * @property {string}   full_photo              - actually a boolean
 * @property {string}   image_overlay_type
 * @property {string}   landing_page_enable     - actually a boolean
 * @property {string}   lang
 * @property {string[]} lang_available
 * @property {string}   layout                  - actually a number: `0`, `1` or `2`
 * @property {string}   [location]
 * @property {string}   location_decoding       - actually a boolean
 * @property {string}   location_show           - actually a boolean
 * @property {string}   location_show_public    - actually a boolean
 * @property {string}   map_display             - actually a boolean
 * @property {string}   map_display_direction   - actually a boolean
 * @property {string}   map_display_public      - actually a boolean
 * @property {string}   map_include_subalbums   - actually a boolean
 * @property {string}   map_provider
 * @property {string}   new_photos_notification - actually a boolean
 * @property {string}   nsfw_blur               - actually a boolean
 * @property {string}   nsfw_visible            - actually a boolean
 * @property {string}   nsfw_warning            - actually a boolean
 * @property {string}   nsfw_warning_admin      - actually a boolean
 * @property {string}   public_photos_hidden    - actually a boolean
 * @property {string}   public_search           - actually a boolean
 * @property {string}   share_button_visible    - actually a boolean
 * @property {string}   [skip_duplicates]       - actually a boolean
 * @property {string}   sorting_Albums
 * @property {string}   sorting_Photos
 * @property {string}   swipe_tolerance_x       - actually a number
 * @property {string}   swipe_tolerance_y       - actually a number
 * @property {string}   upload_processing_limit - actually a number
 * @property {string}   version                 - actually a number
 */

/**
 * @typedef DeviceConfiguration
 *
 * @property {string}  device_type
 * @property {boolean} header_auto_hide
 * @property {boolean} active_focus_on_page_load
 * @property {boolean} enable_button_visibility
 * @property {boolean} enable_button_share
 * @property {boolean} enable_button_archive
 * @property {boolean} enable_button_move
 * @property {boolean} enable_button_trash
 * @property {boolean} enable_button_fullscreen
 * @property {boolean} enable_button_download
 * @property {boolean} enable_button_add
 * @property {boolean} enable_button_more
 * @property {boolean} enable_button_rotate
 * @property {boolean} enable_close_tab_on_esc
 * @property {boolean} enable_contextmenu_header
 * @property {boolean} hide_content_during_imgview
 * @property {boolean} enable_tabindex
 */

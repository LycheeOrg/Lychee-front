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
 * @property {?string}      tags
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
 * @property {SizeVariant}  thumb
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
 * @property {string}  id
 * @property {string}  created_at
 * @property {string}  updated_at
 * @property {string}  title
 * @property {?string} description
 * @property {string}  show_tags
 * @property {Photo[]} photos
 * @property {?Thumb}  thumb
 * @property {string}  [owner_name] optional, only shown in authenticated mode
 * @property {boolean} is_public
 * @property {boolean} is_downloadable
 * @property {boolean} is_share_button_visible
 * @property {boolean} is_nsfw
 * @property {boolean} grants_full_photo
 * @property {boolean} requires_link
 * @property {boolean} has_password
 * @property {?string} min_taken_at
 * @property {?string} max_taken_at
 * @property {?string} sorting_col
 * @property {?string} sorting_order
 * @property {boolean} is_tag_album always true
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
 */

/**
 * @typedef Albums
 *
 * @property {SmartAlbums} smart_albums - despite the name also includes tag albums
 * @property {Album[]}     albums
 * @property {Album[]}     shared_albums
 */

/**
 * @typedef SmartAlbums
 *
 * @type {Object.<string, TagAlbum>}
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
	UNSORTED: 'unsorted',
	STARRED: 'starred',
	PUBLIC: 'public',
	RECENT: 'recent'
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

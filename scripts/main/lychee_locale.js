/**
 * @typedef {Object.<string, string>} Locale
 * @property {function} printFilesizeLocalized
 * @property {function} printDateTime
 * @property {function} printMonthYear
 */

lychee.locale = {
	USERNAME: "Username",
	PASSWORD: "Password",
	ENTER: "Enter",
	CANCEL: "Cancel",
	SIGN_IN: "Sign In",
	CLOSE: "Close",
	SETTINGS: "Settings",
	SEARCH: "Search …",
	MORE: "More",
	DEFAULT: "Default",
	GALLERY: "Gallery",

	USERS: "Users",
	CREATE: "Create",
	REMOVE: "Remove",
	SHARE: "Share",
	U2F: "U2F",
	NOTIFICATIONS: "Notifications",
	SHARING: "Sharing",
	CHANGE_LOGIN: "Change Login",
	CHANGE_SORTING: "Change Sorting",
	SET_DROPBOX: "Set Dropbox",
	ABOUT_LYCHEE: "About Lychee",
	DIAGNOSTICS: "Diagnostics",
	DIAGNOSTICS_GET_SIZE: "Request space usage",
	LOGS: "Show Logs",
	SIGN_OUT: "Sign Out",
	UPDATE_AVAILABLE: "Update available!",
	MIGRATION_AVAILABLE: "Migration available!",
	CHECK_FOR_UPDATE: "Check for updates",
	DEFAULT_LICENSE: "Default license for new uploads:",
	SET_LICENSE: "Set License",
	SET_OVERLAY_TYPE: "Set Overlay",
	SET_ALBUM_DECORATION: "Set album decorations",
	SET_MAP_PROVIDER: "Set OpenStreetMap tiles provider",
	FULL_SETTINGS: "Full Settings",
	UPDATE: "Update",
	RESET: "Reset",
	DISABLE_TOKEN_TOOLTIP: "Disable",
	ENABLE_TOKEN: "Enable API token",
	DISABLED_TOKEN_STATUS_MSG: "Disabled",
	TOKEN_BUTTON: "API Token ...",
	TOKEN_NOT_AVAILABLE: "You have already viewed this token.",
	TOKEN_WAIT: "Wait ...",

	SMART_ALBUMS: "Smart albums",
	SHARED_ALBUMS: "Shared albums",
	ALBUMS: "Albums",
	PHOTOS: "Pictures",
	SEARCH_RESULTS: "Search results",

	RENAME: "Rename",
	RENAME_ALL: "Rename Selected",
	MERGE: "Merge",
	MERGE_ALL: "Merge Selected",
	MAKE_PUBLIC: "Make Public",
	SHARE_ALBUM: "Share Album",
	SHARE_PHOTO: "Share Photo",
	VISIBILITY_ALBUM: "Album Visibility",
	VISIBILITY_PHOTO: "Photo Visibility",
	DOWNLOAD_ALBUM: "Download Album",
	ABOUT_ALBUM: "About Album",
	DELETE_ALBUM: "Delete Album",
	MOVE_ALBUM: "Move Album",
	FULLSCREEN_ENTER: "Enter Fullscreen",
	FULLSCREEN_EXIT: "Exit Fullscreen",

	SHARING_ALBUM_USERS: "Share this album with users",
	WAIT_FETCH_DATA: "Please wait while we get the data …",
	SHARING_ALBUM_USERS_NO_USERS: "There are no users to share the album with",
	SHARING_ALBUM_USERS_LONG_MESSAGE: "Select the users to share this album with",

	DELETE_ALBUM_QUESTION: "Delete Album and Photos",
	KEEP_ALBUM: "Keep Album",
	DELETE_ALBUM_CONFIRMATION: "Are you sure you want to delete the album “%s” and all of the photos it contains? This action can’t be undone!",

	DELETE_TAG_ALBUM_QUESTION: "Delete Album",
	DELETE_TAG_ALBUM_CONFIRMATION:
		"Are you sure you want to delete the album “%s” (any photos inside will not be deleted)? This action can’t be undone!",

	DELETE_ALBUMS_QUESTION: "Delete Albums and Photos",
	KEEP_ALBUMS: "Keep Albums",
	DELETE_ALBUMS_CONFIRMATION:
		"Are you sure you want to delete all %d selected albums and all of the photos they contain? This action can’t be undone!",

	DELETE_UNSORTED_CONFIRM: "Are you sure you want to delete all photos from “Unsorted”? This action can’t be undone!",
	CLEAR_UNSORTED: "Clear Unsorted",
	KEEP_UNSORTED: "Keep Unsorted",

	EDIT_SHARING: "Edit Sharing",
	MAKE_PRIVATE: "Make Private",

	CLOSE_ALBUM: "Close Album",
	CLOSE_PHOTO: "Close Photo",
	CLOSE_MAP: "Close Map",

	ADD: "Add",
	MOVE: "Move",
	MOVE_ALL: "Move Selected",
	DUPLICATE: "Duplicate",
	DUPLICATE_ALL: "Duplicate Selected",
	COPY_TO: "Copy to …",
	COPY_ALL_TO: "Copy Selected to …",
	DELETE: "Delete",
	SAVE: "Save",
	DELETE_ALL: "Delete Selected",
	DOWNLOAD: "Download",
	DOWNLOAD_ALL: "Download Selected",
	UPLOAD_PHOTO: "Upload Photo",
	IMPORT_LINK: "Import from Link",
	IMPORT_DROPBOX: "Import from Dropbox",
	IMPORT_SERVER: "Import from Server",
	NEW_ALBUM: "New Album",
	NEW_TAG_ALBUM: "New Tag Album",
	UPLOAD_TRACK: "Upload track",
	DELETE_TRACK: "Delete track",

	TITLE_NEW_ALBUM: "Enter a title for the new album:",
	UNTITLED: "Untitled",
	UNSORTED: "Unsorted",
	STARRED: "Starred",
	RECENT: "Recent",
	PUBLIC: "Public",
	ON_THIS_DAY: "On This Day",
	NUM_PHOTOS: "Photos",

	CREATE_ALBUM: "Create Album",
	CREATE_TAG_ALBUM: "Create Tag Album",

	STAR_PHOTO: "Star Photo",
	STAR: "Star",
	UNSTAR: "Unstar",
	STAR_ALL: "Star Selected",
	UNSTAR_ALL: "Unstar Selected",
	TAG: "Tag",
	TAG_ALL: "Tag Selected",
	UNSTAR_PHOTO: "Unstar Photo",
	SET_COVER: "Set Album Cover",
	REMOVE_COVER: "Remove Album Cover",

	FULL_PHOTO: "Open Original",
	ABOUT_PHOTO: "About Photo",
	DISPLAY_FULL_MAP: "Map",
	DIRECT_LINK: "Direct Link",
	DIRECT_LINKS: "Direct Links",
	QR_CODE: "QR Code",

	ALBUM_ABOUT: "About",
	ALBUM_BASICS: "Basics",
	ALBUM_TITLE: "Title",
	ALBUM_NEW_TITLE: "Enter a new title for this album:",
	ALBUMS_NEW_TITLE: "Enter a title for all %d selected albums:",
	ALBUM_SET_TITLE: "Set Title",
	ALBUM_DESCRIPTION: "Description",
	ALBUM_SHOW_TAGS: "Tags to show",
	ALBUM_NEW_DESCRIPTION: "Enter a new description for this album:",
	ALBUM_SET_DESCRIPTION: "Set Description",
	ALBUM_NEW_SHOWTAGS: "Enter tags of photos that will be visible in this album:",
	ALBUM_SET_SHOWTAGS: "Set tags to show",
	ALBUM_ALBUM: "Album",
	ALBUM_CREATED: "Created",
	ALBUM_IMAGES: "Images",
	ALBUM_VIDEOS: "Videos",
	ALBUM_SUBALBUMS: "Subalbums",
	ALBUM_SHARING: "Share",
	ALBUM_SHR_YES: "YES",
	ALBUM_SHR_NO: "No",
	ALBUM_PUBLIC: "Public",
	ALBUM_PUBLIC_EXPL: "Anonymous users can access this album, subject to the restrictions below.",
	ALBUM_FULL: "Original",
	ALBUM_FULL_EXPL: "Anonymous users can behold full-resolution photos.",
	ALBUM_HIDDEN: "Hidden",
	ALBUM_HIDDEN_EXPL: "Anonymous users need a direct link to access this album.",
	ALBUM_MARK_NSFW: "Mark album as sensitive",
	ALBUM_UNMARK_NSFW: "Unmark album as sensitive",
	ALBUM_NSFW: "Sensitive",
	ALBUM_NSFW_EXPL: "Album contains sensitive content.",
	ALBUM_DOWNLOADABLE: "Downloadable",
	ALBUM_DOWNLOADABLE_EXPL: "Anonymous users can download this album.",
	ALBUM_SHARE_BUTTON_VISIBLE: "Share button is visible",
	ALBUM_SHARE_BUTTON_VISIBLE_EXPL: "Anonymous users can see social media sharing links.",
	ALBUM_PASSWORD: "Password",
	ALBUM_PASSWORD_PROT: "Password protected",
	ALBUM_PASSWORD_PROT_EXPL: "Anonymous users need a shared password to access this album.",
	ALBUM_PASSWORD_REQUIRED: "This album is protected by a password. Enter the password below to view the photos of this album:",
	ALBUM_MERGE: "Are you sure you want to merge the album “%1$s” into the album “%2$s”?",
	ALBUMS_MERGE: "Are you sure you want to merge all selected albums into the album “%s”?",
	MERGE_ALBUM: "Merge Albums",
	DONT_MERGE: "Don’t Merge",
	ALBUM_MOVE: "Are you sure you want to move the album “%1$s” into the album “%2$s”?",
	ALBUMS_MOVE: "Are you sure you want to move all selected albums into the album “%s”?",
	MOVE_ALBUMS: "Move Albums",
	NOT_MOVE_ALBUMS: "Don’t Move",
	ROOT: "Albums",
	ALBUM_REUSE: "Reuse",
	ALBUM_LICENSE: "License",
	ALBUM_SET_LICENSE: "Set License",
	ALBUM_LICENSE_HELP: "Need help choosing?",
	ALBUM_LICENSE_NONE: "None",
	ALBUM_RESERVED: "All Rights Reserved",
	ALBUM_SET_ORDER: "Set Order",
	ALBUM_ORDERING: "Order by",
	ALBUM_OWNER: "Owner",

	PHOTO_ABOUT: "About",
	PHOTO_BASICS: "Basics",
	PHOTO_TITLE: "Title",
	PHOTO_NEW_TITLE: "Enter a new title for this photo:",
	PHOTO_SET_TITLE: "Set Title",
	PHOTO_UPLOADED: "Uploaded",
	PHOTO_DESCRIPTION: "Description",
	PHOTO_NEW_DESCRIPTION: "Enter a new description for this photo:",
	PHOTO_SET_DESCRIPTION: "Set Description",
	PHOTO_NEW_LICENSE: "Add a License",
	PHOTO_SET_LICENSE: "Set License",
	PHOTO_LICENSE: "License",
	PHOTO_LICENSE_HELP: "Need help choosing?",
	PHOTO_REUSE: "Reuse",
	PHOTO_LICENSE_NONE: "None",
	PHOTO_RESERVED: "All Rights Reserved",
	PHOTO_LATITUDE: "Latitude",
	PHOTO_LONGITUDE: "Longitude",
	PHOTO_ALTITUDE: "Altitude",
	PHOTO_IMGDIRECTION: "Direction",
	PHOTO_LOCATION: "Location",
	PHOTO_IMAGE: "Image",
	PHOTO_VIDEO: "Video",
	PHOTO_SIZE: "Size",
	PHOTO_FORMAT: "Format",
	PHOTO_RESOLUTION: "Resolution",
	PHOTO_DURATION: "Duration",
	PHOTO_FPS: "Frame rate",
	PHOTO_TAGS: "Tags",
	PHOTO_NOTAGS: "No Tags",
	PHOTO_NEW_TAGS: "Enter your tags for this photo. You can add multiple tags by separating them with a comma:",
	PHOTOS_NEW_TAGS:
		"Enter your tags for all %d selected photos. Existing tags will be overwritten. You can add multiple tags by separating them with a comma:",
	PHOTO_SET_TAGS: "Set Tags",
	TAGS_OVERRIDE_INFO: "If this is unchecked, the tags will be added to the existing tags of the photo.",
	PHOTO_CAMERA: "Camera",
	PHOTO_CAPTURED: "Captured",
	PHOTO_MAKE: "Make",
	PHOTO_TYPE: "Type/Model",
	PHOTO_LENS: "Lens",
	PHOTO_SHUTTER: "Shutter Speed",
	PHOTO_APERTURE: "Aperture",
	PHOTO_FOCAL: "Focal Length",
	PHOTO_ISO: "ISO %s",
	PHOTO_SHARING: "Sharing",
	PHOTO_SHR_PUBLIC: "Public",
	PHOTO_SHR_ALB: "Yes (Album)",
	PHOTO_SHR_PHT: "Yes (Photo)",
	PHOTO_SHR_NO: "No",
	PHOTO_DELETE: "Delete Photo",
	PHOTO_KEEP: "Keep Photo",
	PHOTO_DELETE_CONFIRMATION: "Are you sure you want to delete the photo “%s”? This action can’t be undone!",
	PHOTO_DELETE_ALL: "Are you sure you want to delete all %d selected photo? This action can’t be undone!",
	PHOTOS_NEW_TITLE: "Enter a title for all %d selected photos:",
	PHOTO_MAKE_PRIVATE_ALBUM:
		"This photo is located in a public album. To make this photo private or public, edit the visibility of the associated album.",
	PHOTO_SHOW_ALBUM: "Show Album",
	PHOTO_PUBLIC: "Public",
	PHOTO_PUBLIC_EXPL: "Anonymous users can view this photo, subject to the restrictions below.",
	PHOTO_FULL: "Original",
	PHOTO_FULL_EXPL: "Anonymous users can behold full-resolution photo.",
	PHOTO_HIDDEN: "Hidden",
	PHOTO_HIDDEN_EXPL: "Anonymous users need a direct link to view this photo.",
	PHOTO_DOWNLOADABLE: "Downloadable",
	PHOTO_DOWNLOADABLE_EXPL: "Anonymous users may download this photo.",
	PHOTO_SHARE_BUTTON_VISIBLE: "Share button is visible",
	PHOTO_SHARE_BUTTON_VISIBLE_EXPL: "Anonymous users can see social media sharing links.",
	PHOTO_PASSWORD_PROT: "Password protected",
	PHOTO_PASSWORD_PROT_EXPL: "Anonymous users need a shared password to view this photo.",
	PHOTO_EDIT_SHARING_TEXT: "The sharing properties of this photo will be changed to the following:",
	PHOTO_NO_EDIT_SHARING_TEXT:
		"Because this photo is located in a public album, it inherits that album’s visibility settings.  Its current visibility is shown below for informational purposes only.",
	PHOTO_EDIT_GLOBAL_SHARING_TEXT:
		"The visibility of this photo can be fine-tuned using global Lychee settings. Its current visibility is shown below for informational purposes only.",
	PHOTO_NEW_CREATED_AT: "Enter the upload date for this photo. mm/dd/yyyy, hh:mm [am/pm]",
	PHOTO_SET_CREATED_AT: "Set upload date",

	LOADING: "Loading",
	ERROR: "Error",
	ERROR_TEXT: "Whoops, it looks like something went wrong. Please reload the site and try again!",
	ERROR_UNKNOWN:
		"Something unexpected happened. Please try again and check your installation and server. Take a look at the readme for more information.",
	ERROR_MAP_DEACTIVATED: "Map functionality has been deactivated under settings.",
	ERROR_SEARCH_DEACTIVATED: "Search functionality has been deactivated under settings.",
	SUCCESS: "OK",
	RETRY: "Retry",
	OVERRIDE: "Override",

	SETTINGS_SUCCESS_LOGIN: "Login Info updated.",
	SETTINGS_SUCCESS_SORT: "Sorting order updated.",
	SETTINGS_SUCCESS_DROPBOX: "Dropbox Key updated.",
	SETTINGS_SUCCESS_LANG: "Language updated",
	SETTINGS_SUCCESS_LAYOUT: "Layout updated",
	SETTINGS_SUCCESS_IMAGE_OVERLAY: "Image overlay setting updated",
	SETTINGS_SUCCESS_ALBUM_DECORATION: "Album decorations updated",
	SETTINGS_SUCCESS_PUBLIC_SEARCH: "Public search updated",
	SETTINGS_SUCCESS_LICENSE: "Default license updated",
	SETTINGS_SUCCESS_MAP_DISPLAY: "Map display settings updated",
	SETTINGS_SUCCESS_MAP_DISPLAY_PUBLIC: "Map display settings for public albums updated",
	SETTINGS_SUCCESS_MAP_PROVIDER: "Map provider settings updated",
	SETTINGS_SUCCESS_CSS: "CSS updated",
	SETTINGS_SUCCESS_JS: "JS updated",
	SETTINGS_SUCCESS_UPDATE: "Settings updated successfully",
	SETTINGS_DROPBOX_KEY: "Dropbox API Key",
	SETTINGS_ADVANCED_WARNING_EXPL:
		"Changing these advanced settings can be harmful to the stability, security and performance of this application. You should only modify them if you are sure of what you are doing.",
	SETTINGS_ADVANCED_SAVE: "Save my modifications, I accept the risk!",

	U2F_NOT_SUPPORTED: "U2F not supported. Sorry.",
	U2F_NOT_SECURE: "Environment not secured. U2F not available.",
	U2F_REGISTER_KEY: "Register new device.",
	U2F_REGISTRATION_SUCCESS: "Registration successful!",
	U2F_AUTHENTIFICATION_SUCCESS: "Authentication successful!",
	U2F_CREDENTIALS: "Credentials",
	U2F_CREDENTIALS_DELETED: "Credentials deleted!",

	NEW_PHOTOS_NOTIFICATION: "Send new photos notification emails.",
	SETTINGS_SUCCESS_NEW_PHOTOS_NOTIFICATION: "New photos notification updated",
	USER_EMAIL_INSTRUCTION: "Add your email below to enable receiving email notifications. To stop receiving emails, simply remove your email below.",

	LOGIN_USERNAME: "New Username",
	LOGIN_PASSWORD: "New Password",
	LOGIN_PASSWORD_CONFIRM: "Confirm Password",
	PASSWORD_TITLE: "Enter your current password:",
	PASSWORD_CURRENT: "Current Password",
	PASSWORD_TEXT: "Your credentials will be changed to the following:",
	PASSWORD_CHANGE: "Change Login",

	EDIT_SHARING_TITLE: "Edit Sharing",
	EDIT_SHARING_TEXT: "The sharing properties of this album will be changed to the following:",
	SHARE_ALBUM_TEXT: "This album will be shared with the following properties:",

	SORT_DIALOG_ATTRIBUTE_LABEL: "Attribute",
	SORT_DIALOG_ORDER_LABEL: "Order",

	SORT_ALBUM_BY: "Sort albums by %1$s in an %2$s order.",

	SORT_ALBUM_SELECT_1: "Creation Time",
	SORT_ALBUM_SELECT_2: "Title",
	SORT_ALBUM_SELECT_3: "Description",
	SORT_ALBUM_SELECT_5: "Latest Take Date",
	SORT_ALBUM_SELECT_6: "Oldest Take Date",

	SORT_PHOTO_BY: "Sort photos by %1$s in an %2$s order.",

	SORT_PHOTO_SELECT_1: "Upload Time",
	SORT_PHOTO_SELECT_2: "Take Date",
	SORT_PHOTO_SELECT_3: "Title",
	SORT_PHOTO_SELECT_4: "Description",
	SORT_PHOTO_SELECT_5: "Public",
	SORT_PHOTO_SELECT_6: "Star",
	SORT_PHOTO_SELECT_7: "Photo Format",

	SORT_ASCENDING: "Ascending",
	SORT_DESCENDING: "Descending",
	SORT_CHANGE: "Change Sorting",

	DROPBOX_TITLE: "Set Dropbox Key",
	DROPBOX_TEXT:
		"In order to import photos from your Dropbox, you need a valid drop-ins app key from <a href='https://www.dropbox.com/developers/apps/create'>their website</a>. Generate yourself a personal key and enter it below:",

	LANG_TEXT: "Change Lychee language for:",
	LANG_TITLE: "Change Language",

	SETTING_RECENT_PUBLIC_TEXT: 'Make "Recent" smart album accessible to anonymous users',
	SETTING_STARRED_PUBLIC_TEXT: 'Make "Starred" smart album accessible to anonymous users',
	SETTING_ONTHISDAY_PUBLIC_TEXT: 'Make "On This Day" smart album accessible to anonymous users',

	CSS_TEXT: "Personalize CSS:",
	CSS_TITLE: "Change CSS",
	JS_TEXT: "Custom JS:",
	JS_TITLE: "Change JS",
	PUBLIC_SEARCH_TEXT: "Public search allowed:",
	OVERLAY_TYPE: "Photo overlay:",
	OVERLAY_NONE: "None",
	OVERLAY_EXIF: "EXIF data",
	OVERLAY_DESCRIPTION: "Description",
	OVERLAY_DATE: "Date taken",
	ALBUM_DECORATION: "Album decorations:",
	ALBUM_DECORATION_NONE: "No badges",
	ALBUM_DECORATION_ORIGINAL: "Sub-album badge, no count",
	ALBUM_DECORATION_ALBUM: "Sub-album badge with count",
	ALBUM_DECORATION_PHOTO: "Photo badge with count",
	ALBUM_DECORATION_ALL: "Sub-album and photo badges with counts",
	ALBUM_DECORATION_ORIENTATION: "Orientation of album decorations:",
	ALBUM_DECORATION_ORIENTATION_ROW: "Horizontal decorations (photos, albums)",
	ALBUM_DECORATION_ORIENTATION_ROW_REVERSE: "Horizontal decorations (albums, photos)",
	ALBUM_DECORATION_ORIENTATION_COLUMN: "Vertical decorations (top photos, albums)",
	ALBUM_DECORATION_ORIENTATION_COLUMN_REVERSE: "Vertical decorations (top albums, photos)",
	MAP_DISPLAY_TEXT: "Enable maps (provided by OpenStreetMap):",
	MAP_DISPLAY_PUBLIC_TEXT: "Enable maps for public albums (provided by OpenStreetMap):",
	MAP_PROVIDER: "Provider of OpenStreetMap tiles:",
	MAP_PROVIDER_WIKIMEDIA: "Wikimedia",
	MAP_PROVIDER_OSM_ORG: "OpenStreetMap.org (no HiDPI)",
	MAP_PROVIDER_OSM_DE: "OpenStreetMap.de (no HiDPI)",
	MAP_PROVIDER_OSM_FR: "OpenStreetMap.fr (no HiDPI)",
	MAP_PROVIDER_RRZE: "University of Erlangen, Germany (only HiDPI)",
	MAP_INCLUDE_SUBALBUMS_TEXT: "Include photos of subalbums on map:",
	LOCATION_DECODING: "Decode GPS data into location name",
	LOCATION_SHOW: "Show location name",
	LOCATION_SHOW_PUBLIC: "Show location name for public mode",

	LAYOUT_TYPE: "Layout of photos:",
	LAYOUT_SQUARES: "Square thumbnails",
	LAYOUT_JUSTIFIED: "With aspect, justified",
	LAYOUT_UNJUSTIFIED: "With aspect, unjustified",
	SET_LAYOUT: "Change layout",

	NSFW_VISIBLE_TEXT_1: "Make Sensitive albums visible by default.",
	NSFW_VISIBLE_TEXT_2:
		"If the album is public, it is still accessible, just hidden from the view and <b>can be revealed by pressing <kbd>H</kbd></b>.",
	SETTINGS_SUCCESS_NSFW_VISIBLE: "Default sensitive album visibility updated with success.",

	NSFW_BANNER:
		"<h1>Sensitive content</h1><p>This album contains sensitive content which some people may find offensive or disturbing.</p><p>Tap to consent.</p>",

	VIEW_NO_RESULT: "No results",
	VIEW_NO_PUBLIC_ALBUMS: "No public albums",
	VIEW_NO_CONFIGURATION: "No configuration",
	VIEW_PHOTO_NOT_FOUND: "Photo not found",

	NO_TAGS: "No Tags",

	UPLOAD_MANAGE_NEW_PHOTOS: "You can now manage your new photo(s).",
	UPLOAD_COMPLETE: "Upload complete",
	UPLOAD_COMPLETE_FAILED: "Failed to upload one or more photos.",
	UPLOAD_IMPORTING: "Importing",
	UPLOAD_IMPORTING_URL: "Importing URL",
	UPLOAD_UPLOADING: "Uploading",
	UPLOAD_FINISHED: "Finished",
	UPLOAD_PROCESSING: "Processing",
	UPLOAD_FAILED: "Failed",
	UPLOAD_FAILED_ERROR: "Upload failed. The server returned an error!",
	UPLOAD_FAILED_WARNING: "Upload failed. The server returned a warning!",
	UPLOAD_CANCELLED: "Cancelled",
	UPLOAD_SKIPPED: "Skipped",
	UPLOAD_UPDATED: "Updated",
	UPLOAD_GENERAL: "General",
	UPLOAD_IMPORT_SKIPPED_DUPLICATE: "This photo has been skipped because it’s already in your library.",
	UPLOAD_IMPORT_RESYNCED_DUPLICATE: "This photo has been skipped because it’s already in your library, but its metadata has been updated.",
	UPLOAD_ERROR_CONSOLE: "Please take a look at the console of your browser for further details.",
	UPLOAD_UNKNOWN: "Server returned an unknown response. Please take a look at the console of your browser for further details.",
	UPLOAD_ERROR_UNKNOWN: "Upload failed. The server returned an unknown error!",
	UPLOAD_ERROR_POSTSIZE: "Upload failed. The PHP post_max_size may be too small! Otherwise check the FAQ.",
	UPLOAD_ERROR_FILESIZE: "Upload failed. The PHP upload_max_filesize may be too small! Otherwise check the FAQ.",
	UPLOAD_IN_PROGRESS: "Lychee is currently uploading!",
	UPLOAD_IMPORT_WARN_ERR:
		"The import has been finished, but returned warnings or errors. Please take a look at the log (Settings -> Show Log) for further details.",
	UPLOAD_IMPORT_COMPLETE: "Import complete",
	UPLOAD_IMPORT_INSTR: "Please enter the direct link to a photo to import it:",
	UPLOAD_IMPORT: "Import",
	UPLOAD_IMPORT_SERVER: "Importing from server",
	UPLOAD_IMPORT_SERVER_FOLD:
		"Folder empty or no readable files to process. Please take a look at the log (Settings -> Show Log) for further details.",
	UPLOAD_IMPORT_SERVER_INSTR:
		"Import all photos, folders, and sub-folders located in the folders with the following absolute paths (on the server). Paths are space-separated, use \\ to escape a space in a path.",
	UPLOAD_ABSOLUTE_PATH: "Absolute path to directories, space separated",
	UPLOAD_IMPORT_SERVER_EMPT: "Could not start import because the folder was empty!",
	UPLOAD_IMPORT_DELETE_ORIGINALS: "Delete originals",
	UPLOAD_IMPORT_DELETE_ORIGINALS_EXPL: "Original files will be deleted after the import when possible.",
	UPLOAD_IMPORT_VIA_SYMLINK: "Symbolic links",
	UPLOAD_IMPORT_VIA_SYMLINK_EXPL: "Import files using symbolic links to originals.",
	UPLOAD_IMPORT_SKIP_DUPLICATES: "Skip duplicates",
	UPLOAD_IMPORT_SKIP_DUPLICATES_EXPL: "Existing media files are skipped.",
	UPLOAD_IMPORT_RESYNC_METADATA: "Re-sync metadata",
	UPLOAD_IMPORT_RESYNC_METADATA_EXPL: "Update metadata of existing media files.",
	UPLOAD_IMPORT_LOW_MEMORY_EXPL: "The import process on the server is approaching the memory limit and may end up being terminated prematurely.",
	UPLOAD_WARNING: "Warning",
	UPLOAD_IMPORT_NOT_A_DIRECTORY: "The given path is not a readable directory!",
	UPLOAD_IMPORT_PATH_RESERVED: "The given path is a reserved path of Lychee!",
	UPLOAD_IMPORT_FAILED: "Could not import the file!",
	UPLOAD_IMPORT_UNSUPPORTED: "Unsupported file type!",
	UPLOAD_IMPORT_CANCELLED: "Import cancelled",

	ABOUT_SUBTITLE: "Self-hosted photo-management done right",
	ABOUT_DESCRIPTION:
		"<a target='_blank' href='%s'>Lychee</a> is a free photo-management tool, which runs on your server or web-space. Installing is a matter of seconds. Upload, manage and share photos like from a native application. Lychee comes with everything you need and all your photos are stored securely.",
	FOOTER_COPYRIGHT: "All images on this website are subject to copyright by %1$s © %2$s",
	HOSTED_WITH_LYCHEE: "Hosted with Lychee",

	URL_COPY_TO_CLIPBOARD: "Copy to clipboard",
	URL_COPIED_TO_CLIPBOARD: "Copied URL to clipboard!",
	PHOTO_DIRECT_LINKS_TO_IMAGES: "Direct links to image files:",
	PHOTO_ORIGINAL: "Original",
	PHOTO_MEDIUM: "Medium",
	PHOTO_MEDIUM_HIDPI: "Medium HiDPI",
	PHOTO_SMALL: "Thumb",
	PHOTO_SMALL_HIDPI: "Thumb HiDPI",
	PHOTO_THUMB: "Square thumb",
	PHOTO_THUMB_HIDPI: "Square thumb HiDPI",
	PHOTO_THUMBNAIL: "Photo thumbnail",
	PHOTO_LIVE_VIDEO: "Video part of live-photo",
	PHOTO_VIEW: "Lychee Photo View:",

	PHOTO_EDIT_ROTATECWISE: "Rotate clockwise",
	PHOTO_EDIT_ROTATECCWISE: "Rotate counter-clockwise",

	ERROR_GPX: "Error loading GPX file: ",
	ERROR_EITHER_ALBUMS_OR_PHOTOS: "Please select either albums or photos!",
	ERROR_COULD_NOT_FIND: "Could not find what you want.",
	ERROR_INVALID_EMAIL: "Not a valid email address.",
	EMAIL_SUCCESS: "Email updated!",
	ERROR_PHOTO_NOT_FOUND: "Error: photo %s not found!",
	ERROR_EMPTY_USERNAME: "new username cannot be empty.",
	ERROR_PASSWORD_DOES_NOT_MATCH: "new password does not match.",
	ERROR_EMPTY_PASSWORD: "new password cannot be empty.",
	ERROR_SELECT_ALBUM: "Select an album to share!",
	ERROR_SELECT_USER: "Select a user to share with!",
	ERROR_SELECT_SHARING: "Select a sharing to remove!",
	SHARING_SUCCESS: "Sharing updated!",
	SHARING_REMOVED: "Sharing removed!",
	USER_CREATED: "User created!",
	USER_DELETED: "User deleted!",
	USER_UPDATED: "User updated!",
	ENTER_EMAIL: "Enter your email address:",
	ERROR_ALBUM_JSON_NOT_FOUND: "Error: Album JSON not found!",
	ERROR_ALBUM_NOT_FOUND: "Error: album %s not found",
	ERROR_DROPBOX_KEY: "Error: Dropbox key not set",
	ERROR_SESSION: "Session expired.",
	CAMERA_DATE: "Camera date",
	NEW_PASSWORD: "new password",
	ALLOW_UPLOADS: "Allow uploads",
	ALLOW_USER_SELF_EDIT: "Allow self-management of user account",
	OSM_CONTRIBUTORS: "OpenStreetMap contributors",

	dateTimeFormatter: new Intl.DateTimeFormat("default", { dateStyle: "medium", timeStyle: "medium" }),

	/**
	 * Formats a number representing a filesize in bytes as a localized string
	 * @param {!number} filesize
	 * @returns {string} A formatted and localized string
	 */
	printFilesizeLocalized: function (filesize) {
		const suffix = [" B", " kB", " MB", " GB"];
		let i = 0;
		// Sic! We check if the number is larger than 1000 but divide by 1024 by intention
		// We aim at a number which has at most 3 non-decimal digits, i.e. the result shall be in the interval
		// [1000/1024, 1000) = [0.977, 1000)  (lower bound included, upper bound excluded)
		while (filesize >= 1000.0 && i < suffix.length) {
			filesize = filesize / 1024.0;
			i++;
		}

		// The number of decimal digits is anti-proportional to the number of non-decimal digits
		// In total, there shall always be three digits
		if (filesize >= 100.0) {
			filesize = Math.round(filesize);
		} else if (filesize >= 10.0) {
			filesize = Math.round(filesize * 10.0) / 10.0;
		} else {
			filesize = Math.round(filesize * 100.0) / 100.0;
		}

		return Number(filesize).toLocaleString() + suffix[i];
	},

	/**
	 * Converts a JSON encoded date/time into a localized string relative to
	 * the original timezone
	 *
	 * The localized string uses the JS "medium" verbosity.
	 * The precise definition of "medium verbosity" depends on the current locale, but for Western languages this
	 * means that the date portion is fully printed with digits (e.g. something like 03/30/2021 for English,
	 * 30/03/2021 for French and 30.03.2021 for German), and that the time portion is printed with a resolution of
	 * seconds with two digits for all parts either in 24h or 12h scheme (e.g. something like 02:24:13pm for English
	 * and 14:24:13 for French/German).
	 *
	 * @param {?string} jsonDateTime
	 * @returns {string} A formatted and localized time
	 */
	printDateTime: function (jsonDateTime) {
		if (typeof jsonDateTime !== "string" || jsonDateTime === "") return "";

		// Unfortunately, the built-in JS Date object is rather dumb.
		// It is only required to support the timezone of the runtime
		// environment and UTC.
		// Moreover, the method `toLocalString` may or may not convert
		// the represented time to the timezone of the runtime environment
		// before formatting it as a string.
		// However, we want to keep the printed time in the original timezone,
		// because this facilitates human interaction with a photo.
		// To this end we apply a "dirty" trick here.
		// We first cut off any explicit timezone indication from the JSON
		// string and only pass a date/time of the form `YYYYMMDDThhmmss` to
		// `Date`.
		// `Date` is required to interpret those time values according to the
		// local timezone (see [MDN Web Docs - Date Time String Format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format)).
		// Most likely, the resulting `Date` object will represent the
		// wrong instant in time (given in seconds since epoch), but we only
		// want to call `toLocalString` which is fine and don't do any time
		// arithmetics.
		// Then we add the original timezone to the string manually.
		const splitDateTime = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([,.]\d{1,6})?)([-Z+])(\d{2}:\d{2})?$/.exec(jsonDateTime);
		// The capturing groups are:
		//  - 0: the whole string
		//  - 1: the whole date/time segment incl. fractional seconds
		//  - 2: the fractional seconds (if present)
		//  - 3: the timezone separator, i.e. "Z", "-" or "+" (if present)
		//  - 4: the absolute timezone offset without the sign (if present)
		console.assert(splitDateTime.length === 5, "'jsonDateTime' is not formatted acc. to ISO 8601; passed string was: " + jsonDateTime);
		let result = lychee.locale.dateTimeFormatter.format(new Date(splitDateTime[1]));
		if (splitDateTime[3] === "Z" || splitDateTime[4] === "00:00") {
			result += " UTC";
		} else {
			result += " UTC" + splitDateTime[3] + splitDateTime[4];
		}
		return result;
	},

	/**
	 * Converts a JSON encoded date/time into a localized string which only displays month and year.
	 *
	 * The month is printed as a shortened word with 3/4 letters, the year is printed with 4 digits (e.g. something like
	 * "Aug 2020" in English or "Août 2020" in French).
	 *
	 * @param {?string} jsonDateTime
	 * @returns {string} A formatted and localized month and year
	 */
	printMonthYear: function (jsonDateTime) {
		if (typeof jsonDateTime !== "string" || jsonDateTime === "") return "";
		const locale = "default"; // use the user's browser settings
		const format = { month: "short", year: "numeric" };
		return new Date(jsonDateTime).toLocaleDateString(locale, format);
	},
};

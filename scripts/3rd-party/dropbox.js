/**
 * The Dropbox JS component.
 *
 * It is "dynamically" loaded by {@link lychee.loadDropbox}.
 * See:
 *
 *  - {@link https://www.dropbox.com/developers/documentation}
 *  - {@link https://www.dropbox.com/developers/chooser}
 *
 * @namespace Dropbox
 */

/**
 * Shows the Dropbox Chooser component and allows the user to pick files.
 *
 * @function choose
 * @param {DropboxChooserOptions} options
 * @memberOf Dropbox
 */

/**
 * See {@link https://www.dropbox.com/developers/chooser}.
 *
 * @typedef DropboxChooserOptions
 * @property {DropboxChooserSuccessCB} success              Called when a user has selected files.
 * @property {DropboxChooserCancelCB}  [cancel]             Called when the user cancels the
 *                                                          chooser without having selected
 *                                                          files.
 * @property {string}                  [linkType=preview]   `"preview"` (default) is a preview link
 *                                                          to the document for sharing, `"direct"`
 *                                                          is an expiring link to download the
 *                                                          contents of the file.
 * @property {boolean}                 [multiselect=false]  A value of `false` (default) limits
 *                                                          selection to a single file, while
 *                                                          `true` enables multiple file selection.
 * @property {string[]}                [extensions]         a list of file extensions which the
 *                                                          user is able to select
 * @property {boolean}                 [folderselect=false] determines whether the user is able to
 *                                                          select folders, too
 * @property {number}                  [sizeLimit]          a limit on the size of each file which
 *                                                          may be selected
 */

/**
 * Callback if users have successfully selected files from their Dropbox.
 *
 * @callback DropboxChooserSuccessCB
 * @param {DropboxFile[]} files
 * @returns {void}
 */

/**
 * Callback if users cancelled selecting files from their Dropbox.
 *
 * @callback DropboxChooserCancelCB
 * @returns {void}
 */

/**
 * @typedef DropboxFile
 * @property {string} id              unique ID
 * @property {string} name            name of the file, e.g. `"filename.txt`"
 * @property {string} link            URL to access the file
 * @property {number} bytes           size of file in bytes
 * @property {string} icon            URL to a 64x64px icon based on the file type
 * @property {string} [thumbnailLink] a thumbnail link for image and video files
 * @property {boolean} isDir          indicates whether the file is actually a directory
 */

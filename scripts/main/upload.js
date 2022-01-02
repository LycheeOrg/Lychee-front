/**
 * @description Takes care of every action an album can handle and execute.
 */

let upload = {};

const choiceDeleteSelector = '.basicModal .choice input[name="delete"]';
const choiceSymlinkSelector = '.basicModal .choice input[name="symlinks"]';
const choiceDuplicateSelector = '.basicModal .choice input[name="skipduplicates"]';
const choiceResyncSelector = '.basicModal .choice input[name="resyncmetadata"]';
const actionSelector = ".basicModal #basicModal__action";
const cancelSelector = ".basicModal #basicModal__cancel";
const lastRowSelector = ".basicModal .rows .row:last-child";
const prelastRowSelector = ".basicModal .rows .row:nth-last-child(2)";

let nRowStatusSelector = function (row) {
	return ".basicModal .rows .row:nth-child(" + row + ") .status";
};

let showCloseButton = function () {
	$(actionSelector).show();
	// re-activate cancel button to close modal panel if needed
	$(cancelSelector).removeClass("basicModal__button--active").hide();
};

/**
 * @param {string} title
 * @param {FileEntry[]} files
 * @param run_callback
 * @param cancel_callback
 */
upload.show = function (title, files, run_callback, cancel_callback = null) {
	basicModal.show({
		body: build.uploadModal(title, files),
		buttons: {
			action: {
				title: lychee.locale["CLOSE"],
				class: "hidden",
				fn: function () {
					if ($(actionSelector).is(":visible")) basicModal.close();
				},
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				class: "red hidden",
				fn: function () {
					// close modal if close button is displayed
					if ($(actionSelector).is(":visible")) basicModal.close();
					if (cancel_callback) {
						$(cancelSelector).addClass("busy");
						cancel_callback();
					}
				},
			},
		},
		callback: run_callback,
	});
};

upload.notify = function (title, text) {
	if (text == null || text === "") text = lychee.locale["UPLOAD_MANAGE_NEW_PHOTOS"];

	if (!window.webkitNotifications) return false;

	if (window.webkitNotifications.checkPermission() !== 0) window.webkitNotifications.requestPermission();

	if (window.webkitNotifications.checkPermission() === 0 && title) {
		let popup = window.webkitNotifications.createNotification("", title, text);
		popup.show();
	}
};

upload.start = {
	/**
	 * @param {FileList} files
	 */
	local: function (files) {
		if (files.length <= 0) return;

		const albumID = visible.albums() ? null : album.getID();
		let hasErrorOccurred = false;
		let hasWarningOccurred = false;
		/**
		 * The number of requests which are "on the fly", i.e. for which a
		 * response has not yet completely been received.
		 *
		 * Note, that Lychee supports a restricted kind of "parallelism"
		 * which is limited by the configuration option
		 * `lychee.upload_processing_limit`:
		 * While always only a single file is uploaded at once, upload of the
		 * next file already starts after transmission of the previous file
		 * has been finished, the response to the previous file might still be
		 * outstanding as the uploaded file is processed at the server-side.
		 *
		 * @type {number}
		 */
		let outstandingResponsesCount = 0;
		/**
		 * The latest (aka highest) index of a file which is being or has
		 * been uploaded to the server.
		 *
		 * @type {number}
		 */
		let latestFileIdx = 0;
		/**
		 * Indicator of a file is currently being uploaded.
		 *
		 * This is used as a semaphore to serialize the upload transmissions
		 * between several instances of the method {@link process}.
		 *
		 * @type {boolean}
		 */
		let isUploadRunning = false;
		let shallCancelUpload = false;

		/**
		 * This callback is invoked when the last file has been processed.
		 *
		 * It closes the modal dialog or shows the close button and
		 * reloads the album.
		 */
		const finish = function () {
			window.onbeforeunload = null;

			$("#upload_files").val("");

			if (!hasErrorOccurred && !hasWarningOccurred) {
				// Success
				basicModal.close();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
			} else if (!hasErrorOccurred && hasWarningOccurred) {
				// Warning
				showCloseButton();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
			} else {
				// Error
				showCloseButton();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);
			}

			albums.refresh();

			if (albumID === null) lychee.goto();
			else album.load(albumID);
		};

		/**
		 * Processes the upload and response for a single file.
		 *
		 * Note that up to `lychee.upload_processing_limit` "instances" of
		 * this method can be "alive" simultaneously.
		 * The parameter `fileIdx` is constrained to the range between
		 * `latestFileIdx - lychee.upload_processing_limit` and `latestFileIdx`.
		 *
		 * @param {number} fileIdx the index of the file being processed
		 */
		const process = function (fileIdx) {
			/**
			 * The upload progress of the file with index `fileIdx` so far.
			 *
			 * @type {number}
			 */
			let uploadProgress = 0;

			/**
			 * A function to be called when the upload has transmitted more data.
			 *
			 * This method updates the upload percentage counter in the dialog.
			 *
			 * @param {ProgressEvent} e
			 * @this XMLHttpRequest
			 */
			const onUploadProgress = function (e) {
				if (e.lengthComputable !== true) return;

				// Calculate progress
				const progress = ((e.loaded / e.total) * 100) | 0;

				// Set progress when progress has changed
				if (progress > uploadProgress) {
					uploadProgress = progress;
					$(nRowStatusSelector(fileIdx + 1)).html(uploadProgress + "%");
				}
			};

			/**
			 * A function to be called when the upload has completed.
			 *
			 * This method
			 *
			 *  - unsets the indicator for a running upload,
			 *  - scrolls the dialog such that the file with index `fileIdx`
			 *    becomes visible, and
			 *  - changes the status text to "Upload processing".
			 *
			 * @this XMLHttpRequest
			 */
			const onUploadComplete = function () {
				$(nRowStatusSelector(fileIdx + 1)).html(lychee.locale["UPLOAD_PROCESSING"]);
				isUploadRunning = false;
				let scrollPos = 0;
				if (fileIdx + 1 > 4) scrollPos = (fileIdx + 1 - 4) * 40;
				$(".basicModal .rows").scrollTop(scrollPos);
			};

			/**
			 * A function to be called when a response has been received.
			 *
			 * This method updates the status of the affected file.
			 *
			 * @this XMLHttpRequest
			 */
			const onLoaded = function () {
				/** @type {?LycheeException} */
				const lycheeException = this.status >= 400 ? this.response : null;
				let errorText;
				let statusText;
				let statusClass;

				switch (this.status) {
					case 200:
					case 201:
					case 204:
						statusText = lychee.locale["UPLOAD_FINISHED"];
						statusClass = "success";
						break;
					case 409:
						statusText = lychee.locale["UPLOAD_SKIPPED"];
						errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_ERROR_UNKNOWN"];
						hasWarningOccurred = true;
						statusClass = "warning";
						break;
					case 413:
						statusText = lychee.locale["UPLOAD_FAILED"];
						errorText = lychee.locale["UPLOAD_ERROR_POSTSIZE"];
						hasErrorOccurred = true;
						statusClass = "error";
						break;
					default:
						statusText = lychee.locale["UPLOAD_FAILED"];
						errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_ERROR_UNKNOWN"];
						hasErrorOccurred = true;
						statusClass = "error";
						break;
				}

				$(nRowStatusSelector(fileIdx + 1))
					.html(statusText)
					.addClass(statusClass);

				if (statusClass === "error") {
					api.onError(this, { albumID: albumID }, lycheeException);
				}

				$(".basicModal .rows .row:nth-child(" + (fileIdx + 1) + ") p.notice")
					.html(errorText)
					.show();
			};

			/**
			 * A function to be called when any response has been received
			 * (after specific success and error callbacks have been executed)
			 *
			 * This method starts a new upload, if
			 *
			 *  - there are more files to be uploaded,
			 *  - no other upload is currently running, and
			 *  - the number of outstanding responses does not exceed the
			 *    processing limit of Lychee.
			 *
			 * This method calls {@link finish}, if
			 *
			 *  - the process shall be cancelled or no more files are left for processing,
			 *  - no upload is running anymore, and
			 *  - no response is outstanding
			 *
			 * @this XMLHttpRequest
			 */
			const onComplete = function () {
				latestFileIdx++;
				outstandingResponsesCount--;
				if (
					!isUploadRunning &&
					!shallCancelUpload &&
					(outstandingResponsesCount < lychee.upload_processing_limit || lychee.upload_processing_limit === 0) &&
					latestFileIdx < files.length
				) {
					process(latestFileIdx);
				}

				if ((shallCancelUpload || latestFileIdx >= files.length) && !isUploadRunning && outstandingResponsesCount === 0) {
					finish();
				}
			};

			const formData = new FormData();
			const xhr = new XMLHttpRequest();

			formData.append("albumID", albumID);
			formData.append("file", files[fileIdx]);

			xhr.upload.onprogress = onUploadProgress;
			xhr.upload.onload = onUploadComplete;
			xhr.onload = onLoaded;
			xhr.onloadend = onComplete;
			xhr.responseType = "json";
			xhr.open("POST", "api/Photo::add");
			xhr.setRequestHeader("X-XSRF-TOKEN", csrf.getCookie("XSRF-TOKEN"));
			xhr.setRequestHeader("Accept", "application/json");

			outstandingResponsesCount++;
			isUploadRunning = true;
			xhr.send(formData);
		};

		window.onbeforeunload = function () {
			return lychee.locale["UPLOAD_IN_PROGRESS"];
		};

		upload.show(
			lychee.locale["UPLOAD_UPLOADING"],
			files,
			function () {
				// Upload first file
				$(cancelSelector).show();
				process(0);
			},
			function () {
				shallCancelUpload = true;
				hasErrorOccurred = true;
			}
		);
	},

	url: function (url = "") {
		let albumID = album.getID();

		url = typeof url === "string" ? url : "";

		if (albumID === false) albumID = null;

		const action = function (data) {
			let files = [];

			if (data.link && data.link.trim().length > 3) {
				basicModal.close();

				files[0] = {
					name: data.link,
				};

				upload.show(lychee.locale["UPLOAD_IMPORTING_URL"], files, function () {
					$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

					let params = {
						url: data.link,
						albumID,
					};

					api.post(
						"Import::url",
						params,
						function () {
							// Same code as in import.dropbox()
							basicModal.close();
							upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
							albums.refresh();
							if (album.getID() === null) lychee.goto();
							else album.load(albumID);
						},
						null,
						function () {
							// Same code as in import.dropbox()
							$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]).show();
							$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("warning");
							// Show close button
							$(".basicModal #basicModal__action.hidden").show();
							upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
							albums.refresh();
							if (album.getID() === null) lychee.goto();
							else album.load(albumID);
							return false;
						}
					);
				});
			} else basicModal.error("link");
		};

		basicModal.show({
			body:
				lychee.html`<p>` +
				lychee.locale["UPLOAD_IMPORT_INSTR"] +
				` <input class='text' name='link' type='text' placeholder='http://' value='${url}'></p>`,
			buttons: {
				action: {
					title: lychee.locale["UPLOAD_IMPORT"],
					fn: action,
				},
				cancel: {
					title: lychee.locale["CANCEL"],
					fn: basicModal.close,
				},
			},
		});
	},

	server: function () {
		let albumID = album.getID();

		const action = function (data) {
			if (!data.path.trim()) {
				basicModal.error("path");
				return;
			}

			let delete_imported = !!$(choiceDeleteSelector).prop("checked");
			let import_via_symlink = !!$(choiceSymlinkSelector).prop("checked");
			let skip_duplicates = !!$(choiceDuplicateSelector).prop("checked");
			let resync_metadata = !!$(choiceResyncSelector).prop("checked");
			let cancelUpload = false;

			upload.show(
				lychee.locale["UPLOAD_IMPORT_SERVER"],
				[{ name: data.path }],
				function () {
					$(cancelSelector).show();
					$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

					let params = {
						albumID: albumID,
						path: data.path,
						delete_imported: delete_imported,
						import_via_symlink: import_via_symlink,
						skip_duplicates: skip_duplicates,
						resync_metadata: resync_metadata,
					};

					// Variables holding state across the invocations of
					// processIncremental().
					let lastReadIdx = 0;
					let currentDir = data.path;
					let encounteredProblems = false;
					let topSkip = 0;

					/**
					 * The JSON object for incremental reports sent by the
					 * back-end.
					 *
					 * @typedef Report
					 * @property {string}          type
					 * @property {?string}         key
					 * @property {(string|number)} message
					 */

					/**
					 * Worker function invoked from both the response progress
					 * callback and the completion callback.
					 *
					 * @param {Report[]} reports
					 */
					const processIncremental = function (reports) {
						reports.slice(lastReadIdx + 1).forEach(function (report) {
							if (report.type === "progress") {
								if (report.message !== 100) {
									if (currentDir !== report.key) {
										// New directory.  Add a new line to
										// the dialog box.
										currentDir = report.key;
										$(".basicModal .rows").append(build.uploadNewFile(currentDir));
										topSkip += $(lastRowSelector).outerHeight();
									}
									$(lastRowSelector + " .status").html("" + report.message + "%");
								} else {
									// Final status report for this directory.
									$(lastRowSelector + " .status")
										.html(lychee.locale["UPLOAD_FINISHED"])
										.addClass("success");
								}
							} else if (report.type === "error") {
								let rowSelector;
								if (currentDir !== report.key) {
									$(lastRowSelector).before(build.uploadNewFile(report.key));
									rowSelector = prelastRowSelector;
								} else {
									// The problem is with the directory
									// itself, so alter its existing line.
									rowSelector = lastRowSelector;
									topSkip -= $(rowSelector).outerHeight();
								}
								switch (report.message) {
									case "Given path is not a directory":
									case "Given path is reserved":
										$(rowSelector + " .status")
											.html(lychee.locale["UPLOAD_FAILED"])
											.addClass("error");
										break;
									case "Skipped duplicate (resynced metadata)":
										$(rowSelector + " .status")
											.html(lychee.locale["UPLOAD_UPDATED"])
											.addClass("warning");
										break;
									case "Import cancelled":
										$(rowSelector + " .status")
											.html(lychee.locale["UPLOAD_CANCELLED"])
											.addClass("error");
										break;
									default:
										$(rowSelector + " .status")
											.html(lychee.locale["UPLOAD_SKIPPED"])
											.addClass("warning");
								}

								const translations = {
									"Given path is not a directory": "UPLOAD_IMPORT_NOT_A_DIRECTORY",
									"Given path is reserved": "UPLOAD_IMPORT_PATH_RESERVED",
									"Could not read file": "UPLOAD_IMPORT_UNREADABLE",
									"Could not import file": "UPLOAD_IMPORT_FAILED",
									"Unsupported file type": "UPLOAD_IMPORT_UNSUPPORTED",
									"Could not create album": "UPLOAD_IMPORT_ALBUM_FAILED",
									"Skipped duplicate": "UPLOAD_IMPORT_SKIPPED_DUPLICATE",
									"Skipped duplicate (resynced metadata)": "UPLOAD_IMPORT_RESYNCED_DUPLICATE",
									"Import cancelled": "UPLOAD_IMPORT_CANCELLED",
								};
								$(rowSelector + " .notice")
									.html(report.message in translations ? lychee.locale[translations[report.message]] : report.message)
									.show();
								topSkip += $(rowSelector).outerHeight();
								encounteredProblems = true;
							} else if (report.type === "warning" && report.message === "Warning: Approaching memory limit") {
								$(lastRowSelector).before(build.uploadNewFile(lychee.locale["UPLOAD_IMPORT_LOW_MEMORY"]));
								topSkip += $(prelastRowSelector).outerHeight();
								$(prelastRowSelector + " .status")
									.html(lychee.locale["UPLOAD_WARNING"])
									.addClass("warning");
								$(prelastRowSelector + " .notice")
									.html(lychee.locale["UPLOAD_IMPORT_LOW_MEMORY_EXPL"])
									.show();
							}
							$(".basicModal .rows").scrollTop(topSkip);
						}); // forEach (resp)
						lastReadIdx = reports.length;
					}; // processIncremental

					api.post(
						"Import::server",
						params,
						function (_data) {
							// _data is already JSON-parsed.
							processIncremental(_data);

							albums.refresh();

							upload.notify(
								lychee.locale["UPLOAD_IMPORT_COMPLETE"],
								encounteredProblems ? lychee.locale["UPLOAD_COMPLETE_FAILED"] : null
							);

							if (album.getID() === null) lychee.goto();
							else album.load(albumID);

							if (encounteredProblems) showCloseButton();
							else basicModal.close();
						},
						function (event) {
							/** @type {string} */
							let response = this.response;
							/** @type {Report[]} */
							let reports = [];
							// We received a possibly partial response.
							// We must ensure that the last object in the
							// array is complete and terminate the array.
							while (response.length > 2 && reports.length === 0) {
								try {
									// Search the last '}', assume that this
									// terminates the last JSON object, cut
									// the string and terminate the array with
									// `]`.
									// If the assumption is wrong and the last
									// found '}'  does not terminate the last
									// object (i.e. the last '}' has occurred
									// inside the string for a file name),
									// then `JSON.parse` will fail and tell us
									// where the problem occurred.
									reports = JSON.parse(response.substring(0, response.lastIndexOf("}") + 1) + "]");
								} catch (e) {
									if (e instanceof SyntaxError) {
										const errorPos = e.columnNumber;
										const lastBrace = response.lastIndexOf("}");
										const cutResponse = errorPos < lastBrace ? errorPos : lastBrace;
										response = response.substring(0, cutResponse);
									} else {
										// Something else went wrong
										$(lastRowSelector + " .status")
											.html(lychee.locale["UPLOAD_FAILED"])
											.addClass("error");

										albums.refresh();
										upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);

										if (album.getID() === null) lychee.goto();
										else album.load(albumID);

										showCloseButton();

										return;
									}
								}
							}
							// The rest of the work is the same as for the full
							// response.
							processIncremental(reports);
						}
					); // api.post
				},
				function () {
					if (!cancelUpload) {
						api.post("Import::serverCancel", {}, function () {
							cancelUpload = true;
						});
					}
				}
			); // upload.show
		}; // action

		let msg = lychee.html`
			<p class='importServer'>
				${lychee.locale["UPLOAD_IMPORT_SERVER_INSTR"]}
				<input class='text' name='path' type='text' placeholder='${lychee.locale["UPLOAD_ABSOLUTE_PATH"]}' value='${lychee.location}uploads/import/'>
			</p>
		`;
		msg += lychee.html`
			<div class='choice'>
				<label>
					<input type='checkbox' name='delete' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='symlinks' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='skipduplicates' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='resyncmetadata' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_RESYNC_METADATA"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_RESYNC_METADATA_EXPL"]}
				</p>
			</div>
		`;

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: lychee.locale["UPLOAD_IMPORT"],
					fn: action,
				},
				cancel: {
					title: lychee.locale["CANCEL"],
					fn: basicModal.close,
				},
			},
		});

		let $delete = $(choiceDeleteSelector);
		let $symlinks = $(choiceSymlinkSelector);
		let $duplicates = $(choiceDuplicateSelector);
		let $resync = $(choiceResyncSelector);

		if (lychee.delete_imported) {
			$delete.prop("checked", true);
			$symlinks.prop("checked", false).prop("disabled", true);
		} else {
			if (lychee.import_via_symlink) {
				$symlinks.prop("checked", true);
				$delete.prop("checked", false).prop("disabled", true);
			}
		}
		if (lychee.skip_duplicates) {
			$duplicates.prop("checked", true);
			if (lychee.resync_metadata) $resync.prop("checked", true);
		} else {
			$resync.prop("disabled", true);
		}
	},

	dropbox: function () {
		let albumID = album.getID();
		if (albumID === false) albumID = 0;

		const success = function (files) {
			let links = "";

			for (let i = 0; i < files.length; i++) {
				links += files[i].link + ",";

				files[i] = {
					name: files[i].link,
				};
			}

			// Remove last comma
			links = links.substr(0, links.length - 1);

			upload.show("Importing from Dropbox", files, function () {
				$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

				let params = {
					url: links,
					albumID,
				};

				api.post(
					"Import::url",
					params,
					function () {
						// Same code as in import.url()
						basicModal.close();
						upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
						albums.refresh();
						if (album.getID() === null) lychee.goto();
						else album.load(albumID);
					},
					null,
					function () {
						// Same code as in import.url()
						$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]).show();
						$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("warning");
						// Show close button
						$(".basicModal #basicModal__action.hidden").show();
						upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
						albums.refresh();
						if (album.getID() === null) lychee.goto();
						else album.load(albumID);
						return false;
					}
				);
			});
		};

		lychee.loadDropbox(function () {
			Dropbox.choose({
				linkType: "direct",
				multiselect: true,
				success,
			});
		});
	},
};

upload.check = function () {
	let $delete = $(choiceDeleteSelector);
	let $symlinks = $(choiceSymlinkSelector);

	if ($delete.prop("checked")) {
		$symlinks.prop("checked", false).prop("disabled", true);
	} else {
		$symlinks.prop("disabled", false);
		if ($symlinks.prop("checked")) {
			$delete.prop("checked", false).prop("disabled", true);
		} else {
			$delete.prop("disabled", false);
		}
	}

	let $duplicates = $(choiceDuplicateSelector);
	let $resync = $(choiceResyncSelector);

	if ($duplicates.prop("checked")) {
		$resync.prop("disabled", false);
	} else {
		$resync.prop("checked", false).prop("disabled", true);
	}
};

/**
 * @description Takes care of every action an album can handle and execute.
 */

let upload = {};

const choiceDeleteSelector = '.basicModal .choice input[name="delete_imported"]';
const choiceSymlinkSelector = '.basicModal .choice input[name="import_via_symlink"]';
const choiceDuplicateSelector = '.basicModal .choice input[name="skip_duplicates"]';
const choiceResyncSelector = '.basicModal .choice input[name="resync_metadata"]';
const actionSelector = ".basicModal #basicModal__action";
const cancelSelector = ".basicModal #basicModal__cancel";

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
 * @param {(FileList|File[]|DropboxFile[]|{name: string}[])} files
 * @param {ModalDialogReadyCB} run_callback
 * @param {?ModalDialogButtonCB} cancel_callback
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
	 * @param {(FileList|File[])} files
	 */
	local: function (files) {
		if (files.length <= 0) return;

		const albumID = album.getID();
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
		 * Semaphore whether a file is currently being uploaded.
		 *
		 * This is used as a semaphore to serialize the upload transmissions
		 * between several instances of the method {@link process}.
		 *
		 * @type {boolean}
		 */
		let isUploadRunning = false;
		/**
		 * Semaphore whether a further upload shall be cancelled on the next
		 * occasion.
		 *
		 * @type {boolean}
		 */
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
				if (shallCancelUpload) {
					$(".basicModal .rows .row:nth-child(n+" + (latestFileIdx + 2).toString() + ") .status").html(lychee.locale["UPLOAD_CANCELLED"]).addClass("warning");
				}
				upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);
			}

			album.reload();
		};

		/**
		 * Processes the upload and response for a single file.
		 *
		 * Note that up to `lychee.upload_processing_limit` "instances" of
		 * this method can be "alive" simultaneously.
		 * The parameter `fileIdx` is limited by `latestFileIdx`.
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
			 * If the progress equals 100%, i.e. if the upload has been
			 * completed, this method
			 *
			 *  - unsets the semaphore for a running upload,
			 *  - scrolls the dialog such that the file with index `fileIdx`
			 *    becomes visible, and
			 *  - changes the status text to "Upload processing".
			 *
			 * After the current upload has reached 100%, this method starts a
			 * new upload, if
			 *
			 *  - there are more files to be uploaded,
			 *  - no other upload is currently running, and
			 *  - the number of outstanding responses does not exceed the
			 *    processing limit of Lychee.
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
					/** @type {?jQuery} */
					const jqStatusMsg = $(nRowStatusSelector(fileIdx + 1));
					jqStatusMsg.html(uploadProgress + "%");

					if (progress >= 100) {
						jqStatusMsg.html(lychee.locale["UPLOAD_PROCESSING"]);
						isUploadRunning = false;
						let scrollPos = 0;
						if (fileIdx + 1 > 4) scrollPos = (fileIdx + 1 - 4) * 40;
						$(".basicModal .rows").scrollTop(scrollPos);

						// Start a new upload, if there are still pending
						// files
						if (
							!isUploadRunning &&
							!shallCancelUpload &&
							(outstandingResponsesCount < lychee.upload_processing_limit || lychee.upload_processing_limit === 0) &&
							latestFileIdx + 1 < files.length
						) {
							latestFileIdx++;
							process(latestFileIdx);
						}
					}
				}
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
				let errorText = "";
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

				if (errorText !== "") {
					$(".basicModal .rows .row:nth-child(" + (fileIdx + 1) + ") p.notice")
						.html(errorText)
						.show();
				}
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
				outstandingResponsesCount--;

				if (
					!isUploadRunning &&
					!shallCancelUpload &&
					(outstandingResponsesCount < lychee.upload_processing_limit || lychee.upload_processing_limit === 0) &&
					latestFileIdx + 1 < files.length
				) {
					latestFileIdx++;
					process(latestFileIdx);
				}

				if ((shallCancelUpload || latestFileIdx + 1 === files.length) && !isUploadRunning && outstandingResponsesCount === 0) {
					finish();
				}
			};

			const formData = new FormData();
			const xhr = new XMLHttpRequest();

			// For form data, a `null` value is indicated by the empty
			// string `""`. Form data falsely converts the value `null` to the
			// literal string `"null"`.
			formData.append("albumID", albumID ? albumID : "");
			formData.append("file", files[fileIdx]);

			// We must not use the `onload` event of the `XMLHttpRequestUpload`
			// object.
			// Instead, we only use the `onprogress` event and check within
			// the event handler if the progress counter reached 100%.
			// The reason is that `upload.onload` is not immediately called
			// after the browser has completed the upload (as the name
			// suggests), but only after the browser has already received the
			// response header.
			// For our purposes this is too late, as this way we would never
			// show the "processing" status, during which the backend has
			// received the upload, but has not yet started to send a response.
			xhr.upload.onprogress = onUploadProgress;
			xhr.onload = onLoaded;
			xhr.onloadend = onComplete;
			xhr.responseType = "json";
			xhr.open("POST", "api/Photo::add");
			xhr.setRequestHeader("X-XSRF-TOKEN", csrf.getCSRFCookieValue());
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

	/**
	 * @param {string} preselectedUrl
	 */
	url: function (preselectedUrl = "") {
		const albumID = album.getID();

		/**
		 * @typedef UrlDialogResult
		 * @property {string} url
		 */

		/** @param {UrlDialogResult} data */
		const action = function (data) {
			const runImport = function () {
				$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

				const successHandler = function () {
					// Same code as in import.dropbox()
					basicModal.close();
					upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
					album.reload();
				};

				/**
				 * @param {XMLHttpRequest} jqXHR
				 * @param {Object} params
				 * @param {?LycheeException} lycheeException
				 * @returns {boolean}
				 */
				const errorHandler = function (jqXHR, params, lycheeException) {
					// Same code as in import.dropbox()
					let errorText;
					let statusText;
					let statusClass;

					switch (jqXHR.status) {
						case 409:
							statusText = lychee.locale["UPLOAD_SKIPPED"];
							errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							statusClass = "warning";
							break;
						default:
							statusText = lychee.locale["UPLOAD_FAILED"];
							errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							statusClass = "error";
							break;
					}

					$(".basicModal .rows .row p.notice").html(errorText).show();
					$(".basicModal .rows .row .status").html(statusText).addClass(statusClass);
					// Show close button
					$(".basicModal #basicModal__action.hidden").show();
					upload.notify(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]);
					album.reload();
					return true;
				};

				// In theory, the backend is prepared to download a list of
				// URLs (note that `data.url`) is wrapped into an array.
				// However, we need a better dialog which allows input of a
				// list of URLs.
				// Another problem which already exists even for a single
				// URL concerns timeouts.
				// Below, we transmit a single HTTP request which must respond
				// within about 500ms either with a success or error response.
				// Otherwise, JS assumes that the AJAX request just timed out.
				// But the server, first need to download the image from the
				// specified URL, process it and then generate a HTTP response.
				// Probably, it would be much better to use a streamed
				// response here like we already have for imports from the
				// local server.
				// This way, the server could also report its own progress of
				// downloading the images.
				// TODO: Use a streamed response (see description above).
				api.post(
					"Import::url",
					{
						urls: [data.url],
						albumID: albumID,
					},
					successHandler,
					null,
					errorHandler
				);
			};

			if (data.url && data.url.trim().length > 3) {
				basicModal.close();
				upload.show(lychee.locale["UPLOAD_IMPORTING_URL"], [{ name: data.url }], runImport);
			} else basicModal.error("link");
		};

		basicModal.show({
			body:
				lychee.html`<p>` +
				lychee.locale["UPLOAD_IMPORT_INSTR"] +
				` <input class='text' name='url' type='text' placeholder='https://' value='${preselectedUrl}'></p>`,
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
		const albumID = album.getID();

		const importDialogSetupCB = function () {
			const $delete = $(choiceDeleteSelector);
			const $symlinks = $(choiceSymlinkSelector);
			const $duplicates = $(choiceDuplicateSelector);
			const $resync = $(choiceResyncSelector);

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
		};

		/**
		 * @typedef ServerImportDialogResult
		 * @property {string} path
		 * @property {boolean} delete_imported
		 * @property {boolean} import_via_symlink
		 * @property {boolean} skip_duplicates
		 * @property {boolean} resync_metadata
		 */

		/** @param {ServerImportDialogResult} data */
		const action = function (data) {
			if (!data.path.trim()) {
				basicModal.error("path");
				return;
			} else {
				// Consolidate `data` before we close the modal dialog
				// TODO: We should fix the modal dialog to properly return the values of all input fields, incl. check boxes
				data.delete_imported = !!$(choiceDeleteSelector).prop("checked");
				data.import_via_symlink = !!$(choiceSymlinkSelector).prop("checked");
				data.skip_duplicates = !!$(choiceDuplicateSelector).prop("checked");
				data.resync_metadata = !!$(choiceResyncSelector).prop("checked");
				basicModal.close();
			}

			let isUploadCancelled = false;

			const cancelUpload = function () {
				if (!isUploadCancelled) {
					api.post("Import::serverCancel", {}, function () {
						isUploadCancelled = true;
					});
				}
			};

			const runUpload = function () {
				$(cancelSelector).show();

				// Variables holding state across the invocations of
				// processIncremental().
				const jqRows = $(".basicModal .rows");
				let lastReadIdx = 0;
				let currentPath = null;
				let jqCurrentRow = null; // the jQuery object of the current row
				let encounteredProblems = false;
				let topSkip = 0;

				/**
				 * Worker function invoked from both the response progress
				 * callback and the completion callback.
				 *
				 * @param {(ImportProgressReport|ImportEventReport)[]} reports
				 */
				const processIncremental = function (reports) {
					reports.slice(lastReadIdx).forEach(function (report) {
						if (report.type === "progress") {
							if (currentPath !== report.path) {
								// New directory. Add a new line to the dialog box at the end
								currentPath = report.path;
								jqCurrentRow = $(build.uploadNewFile(currentPath)).appendTo(jqRows);
								topSkip += jqCurrentRow.outerHeight();
							}

							if (report.progress !== 100) {
								$(".status", jqCurrentRow).text("" + report.progress + "%");
							} else {
								// Final status report for this directory.
								$(".status", jqCurrentRow).text(lychee.locale["UPLOAD_FINISHED"]).addClass("success");
							}
						} else if (report.type === "event") {
							let jqEventRow;
							if (jqCurrentRow) {
								if (currentPath !== report.path) {
									// If we already have a current row (for
									// progress reports) and the event does
									// not refer to that directory, we
									// insert the event row _before_ the
									// current row, so that the progress
									// report stays in sight.
									jqEventRow = $(build.uploadNewFile(report.path || "General")).insertBefore(jqCurrentRow);
									topSkip += jqEventRow.outerHeight();
								} else {
									// The problem is with the directory
									// itself, so alter its existing line.
									jqEventRow = jqCurrentRow;
								}
							} else {
								// If we do not have a current row yet, we
								// simply append it to the list of rows
								// (this might happen if the event occurs
								// before the first progress report)
								jqEventRow = $(build.uploadNewFile(report.path || "General")).appendTo(jqRows);
								topSkip += jqEventRow.outerHeight();
							}

							let severityClass = "";
							let statusText = "";
							let noteText = "";

							switch (report.severity) {
								case "debug":
								case "info":
									break;
								case "notice":
								case "warning":
									severityClass = "warning";
									break;
								case "error":
								case "critical":
								case "emergency":
									severityClass = "error";
									break;
							}

							switch (report.subtype) {
								case "mem_limit":
									statusText = lychee.locale["UPLOAD_WARNING"];
									noteText = lychee.locale["UPLOAD_IMPORT_LOW_MEMORY_EXPL"];
									break;
								case "FileOperationException":
								case "MediaFileOperationException":
									statusText = lychee.locale["UPLOAD_SKIPPED"];
									noteText = lychee.locale["UPLOAD_IMPORT_FAILED"];
									break;
								case "MediaFileUnsupportedException":
									statusText = lychee.locale["UPLOAD_SKIPPED"];
									noteText = lychee.locale["UPLOAD_IMPORT_UNSUPPORTED"];
									break;
								case "InvalidDirectoryException":
									statusText = lychee.locale["UPLOAD_FAILED"];
									noteText = lychee.locale["UPLOAD_IMPORT_NOT_A_DIRECTORY"];
									break;
								case "ReservedDirectoryException":
									statusText = lychee.locale["UPLOAD_FAILED"];
									noteText = lychee.locale["UPLOAD_IMPORT_PATH_RESERVED"];
									break;
								case "PhotoSkippedException":
									statusText = lychee.locale["UPLOAD_SKIPPED"];
									noteText = lychee.locale["UPLOAD_IMPORT_SKIPPED_DUPLICATE"];
									break;
								case "PhotoResyncedException":
									statusText = lychee.locale["UPLOAD_UPDATED"];
									noteText = lychee.locale["UPLOAD_IMPORT_RESYNCED_DUPLICATE"];
									break;
								case "ImportCancelledException":
									statusText = lychee.locale["UPLOAD_CANCELLED"];
									noteText = lychee.locale["UPLOAD_IMPORT_CANCELLED"];
									break;
								default:
									statusText = lychee.locale["UPLOAD_SKIPPED"];
									noteText = report.message;
									break;
							}

							$(".status", jqEventRow).text(statusText).addClass(severityClass);
							$(".notice", jqEventRow).text(noteText).show();

							encounteredProblems = true;
						}
					}); // forEach (resp)
					lastReadIdx = reports.length;
					$(jqRows).scrollTop(topSkip);
				}; // processIncremental

				/**
				 * @param {ImportReport[]} reports
				 */
				const successHandler = function (reports) {
					// reports is already JSON-parsed.
					processIncremental(reports);

					upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"], encounteredProblems ? lychee.locale["UPLOAD_COMPLETE_FAILED"] : null);

					album.reload();

					if (encounteredProblems) showCloseButton();
					else basicModal.close();
				};

				/**
				 * @this {XMLHttpRequest}
				 */
				const progressHandler = function () {
					/** @type {string} */
					let response = this.response;
					/** @type {ImportReport[]} */
					let reports = [];
					// We received a possibly partial response.
					// We must ensure that the last object in the
					// array is complete and terminate the array.
					while (response.length > 2 && reports.length === 0) {
						// Search the last '}', assume that this terminates
						// the last JSON object, cut the string and terminate
						// the array with `]`.
						const fixedResponse = response.substring(0, response.lastIndexOf("}") + 1) + "]";
						try {
							// If the assumption is wrong and the last found
							// '}'  does not terminate the last object, then
							// `JSON.parse` will fail and tell us where the
							// problem occurred.
							reports = JSON.parse(fixedResponse);
						} catch (e) {
							if (e instanceof SyntaxError) {
								const errorPos = e.columnNumber;
								const lastBrace = response.lastIndexOf("}");
								const cutResponse = errorPos < lastBrace ? errorPos : lastBrace;
								response = response.substring(0, cutResponse);
							} else {
								// Something else went wrong
								upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);

								album.reload();

								showCloseButton();

								return;
							}
						}
					}
					// The rest of the work is the same as for the full
					// response.
					processIncremental(reports);
				};

				const params = {
					albumID: albumID,
					path: data.path,
					delete_imported: data.delete_imported,
					import_via_symlink: data.import_via_symlink,
					skip_duplicates: data.skip_duplicates,
					resync_metadata: data.resync_metadata,
				};

				api.post("Import::server", params, successHandler, progressHandler);
			};

			upload.show(lychee.locale["UPLOAD_IMPORT_SERVER"], [], runUpload, cancelUpload);
		}; // action

		const msg = lychee.html`
			<p class='importServer'>
				${lychee.locale["UPLOAD_IMPORT_SERVER_INSTR"]}
				<input class='text' name='path' type='text' placeholder='${lychee.locale["UPLOAD_ABSOLUTE_PATH"]}' value='${lychee.location}uploads/import/'>
			</p>
			<div class='choice'>
				<label>
					<input type='checkbox' name='delete_imported' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='import_via_symlink' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='skip_duplicates' onchange='upload.check()'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES"]}</span>
				</label>
				<p>
					${lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES_EXPL"]}
				</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='resync_metadata' onchange='upload.check()'>
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
			callback: importDialogSetupCB,
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

	dropbox: function () {
		const albumID = album.getID();

		/**
		 * @param {DropboxFile[]} files
		 */
		const action = function (files) {
			const runImport = function () {
				const successHandler = function () {
					// Same code as in import.url()
					basicModal.close();
					upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);
					album.reload();
				};

				/**
				 * @param {XMLHttpRequest} jqXHR
				 * @param {Object} params
				 * @param {?LycheeException} lycheeException
				 * @returns {boolean}
				 */
				const errorHandler = function (jqXHR, params, lycheeException) {
					// Same code as in import.url()
					let errorText;
					let statusText;
					let statusClass;

					switch (jqXHR.status) {
						case 409:
							statusText = lychee.locale["UPLOAD_SKIPPED"];
							errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							statusClass = "warning";
							break;
						default:
							statusText = lychee.locale["UPLOAD_FAILED"];
							errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							statusClass = "error";
							break;
					}

					$(".basicModal .rows .row p.notice").html(errorText).show();
					$(".basicModal .rows .row .status").html(statusText).addClass(statusClass);
					// Show close button
					$(".basicModal #basicModal__action.hidden").show();
					upload.notify(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]);
					album.reload();
					return true;
				};

				$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

				// TODO: Use a streamed response; see long comment in `import.url()` for the reasons
				api.post(
					"Import::url",
					{
						urls: files.map((file) => file.link),
						albumID: albumID,
					},
					successHandler,
					null,
					errorHandler
				);
			};

			files.forEach((file) => (file.name = file.link));
			upload.show("Importing from Dropbox", files, runImport);
		};

		lychee.loadDropbox(function () {
			Dropbox.choose({
				linkType: "direct",
				multiselect: true,
				success: action,
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

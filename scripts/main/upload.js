/**
 * @description Takes care of every action an album can handle and execute.
 */

/**
 * @typedef ProgressReportDialogRow
 * @property {HTMLLIElement} listEntry
 * @property {HTMLHeadingElement} header
 * @property {HTMLParagraphElement} status
 * @property {HTMLParagraphElement} notice
 */

const upload = {
	SCROLL_OPTIONS: {
		inline: "nearest",
		block: "nearest",
		behavior: "smooth",
	},

	_dom: {
		/**
		 * Holds the ordered list (`<ol>`) with the individual reports
		 * of a Progress Report dialog.
		 *
		 * @type {HTMLOListElement|null}
		 */
		reportList: null,

		/**
		 * Maps a path (as the unique identifier) to a tuple of UI elements
		 * which visualize the report row for that path.
		 *
		 * Note, rows for event reports which are not associated to a
		 * particular file or directory are not kept in this map, but
		 * of course they are visualized inside the list of reports.
		 *
		 * This map allows fast access to the rows without running
		 * (inefficient) CSS selector queries and/or relying on a specific
		 * order (i.e. no need for `nth-child`-selector).
		 *
		 * @type {Map<string, ProgressReportDialogRow>|null}
		 */
		progressRowsByPath: null,
	},
};

upload.showProgressReportCloseButton = function () {
	basicModal.showActionButton();
	basicModal.hideCancelButton();
	// Re-activate cancel button to close modal panel if needed
	basicModal.markActionButtonAsIdle();
};

upload.closeProgressReportDialog = function () {
	basicModal.close();
	upload._dom.reportList = null;
	upload._dom.progressRowsByPath = null;
};

/**
 * Builds the HTML snippet for a single entry in the Progress Report dialog.
 *
 * Constructs an entry for the list of reports made up of a caption,
 * a status and a notice.
 *
 * @param {string} caption the caption of the list entry; for reports about
 *                         files this is typically the filename
 * @returns {ProgressReportDialogRow}
 */
upload.buildReportRow = function (caption) {
	const listEntry = document.createElement("li");

	const header = listEntry.appendChild(document.createElement("h2"));
	header.textContent = caption.length <= 40 ? caption : caption.substring(0, 19) + "…" + caption.substring(caption.length - 20, caption.length);
	const status = listEntry.appendChild(document.createElement("p"));
	status.classList.add("status");
	const notice = listEntry.appendChild(document.createElement("p"));
	notice.classList.add("notice");

	return { listEntry, header, status, notice };
};

/**
 * Builds the HTML snippet for the list of reports in the Progress Report dialog.
 *
 * The list is initially filled with the given list of files.
 * More items to this list may be added on-the-fly during an ongoing import.
 *
 * Note: This is used for downloading files from a remote URL, importing from
 * Dropbox or uploading, i.e. whenever the list is known in advance.
 * For importing from server, the list initially only contains the selected
 * server directory and more items are added while the backend scans the
 * directory on the server.
 *
 * @param {(FileList|File[]|DropboxFile[]|{name: string}[])} files
 * @returns {void}
 */
upload.buildReportList = function (files) {
	upload._dom.reportList = document.createElement("ol");
	upload._dom.progressRowsByPath = new Map();
	for (let idx = 0; idx !== files.length; idx++) {
		const row = upload.buildReportRow(files[idx].name);
		upload._dom.progressRowsByPath.set(files[idx].name, row);
		upload._dom.reportList.appendChild(row.listEntry);
	}
};

/**
 * @param {string} title
 * @param {(FileList|File[]|DropboxFile[]|{name: string}[])} files
 * @param {ModalDialogReadyCB} run_callback
 * @param {?ModalDialogButtonCB} cancel_callback
 */
upload.showProgressReportDialog = function (title, files, run_callback, cancel_callback = null) {
	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initImportProgressReportDialog = function (formElements, dialog) {
		// Initially, the normal Action (aka "Close") button is hidden and
		// remains hidden as long as an import is running.
		// Users must use the Cancel button to interrupt an ongoing import.
		// The Action button becomes visible after the import has been
		// terminated (either successfully, with error or due to interruption).
		basicModal.hideActionButton();

		const caption = dialog.querySelector("h1");
		caption.textContent = title;
		upload.buildReportList(files);
		dialog.appendChild(upload._dom.reportList);

		setTimeout(() => run_callback(formElements, dialog), 0);
	};

	basicModal.show({
		body: "<h1></h1>",
		classList: ["import"],
		readyCB: initImportProgressReportDialog,
		buttons: {
			action: {
				title: lychee.locale["CLOSE"],
				fn: () => upload.closeProgressReportDialog(),
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				classList: ["red"],
				fn: function (resultData) {
					// If Action button is visible, the Cancel button behaves
					// like the Close button; otherwise the button only calls
					// the callback to cancel the import
					if (basicModal.isActionButtonVisible()) {
						upload.closeProgressReportDialog();
					} else {
						if (cancel_callback) {
							cancel_callback(resultData);
						}
					}
				},
			},
		},
	});
};

/**
 * @param {string} title
 * @param {string} [text=""]
 * @returns {void}
 */
upload.notify = function (title, text = "") {
	if (text === "") text = lychee.locale["UPLOAD_MANAGE_NEW_PHOTOS"];

	if (!window.webkitNotifications) return;

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
				upload.closeProgressReportDialog();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
			} else if (!hasErrorOccurred && hasWarningOccurred) {
				// Warning
				upload.showProgressReportCloseButton();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
			} else {
				// Error
				upload.showProgressReportCloseButton();
				if (shallCancelUpload) {
					const row = upload.buildReportRow(lychee.locale["UPLOAD_GENERAL"]);
					row.status.textContent = lychee.locale["UPLOAD_CANCELLED"];
					row.status.classList.add("warning");
					upload._dom.reportList.appendChild(row.listEntry);
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
					const row = upload._dom.progressRowsByPath.get(files[fileIdx].name);
					row.listEntry.scrollIntoView(upload.SCROLL_OPTIONS);
					row.status.textContent = "" + uploadProgress + "%";

					if (progress >= 100) {
						row.status.textContent = lychee.locale["UPLOAD_PROCESSING"];
						isUploadRunning = false;

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
				const row = upload._dom.progressRowsByPath.get(files[fileIdx].name);
				/** @type {?LycheeException} */
				const lycheeException = this.status >= 400 ? this.response : null;

				switch (this.status) {
					case 200:
					case 201:
					case 204:
						row.status.textContent = lychee.locale["UPLOAD_FINISHED"];
						row.status.classList.add("success");
						break;
					case 409:
						row.status.textContent = lychee.locale["UPLOAD_SKIPPED"];
						row.status.classList.add("warning");
						row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_ERROR_UNKNOWN"];
						hasWarningOccurred = true;
						break;
					case 413:
						row.status.textContent = lychee.locale["UPLOAD_FAILED"];
						row.status.classList.add("error");
						row.notice.textContent = lychee.locale["UPLOAD_ERROR_POSTSIZE"];
						hasErrorOccurred = true;
						api.onError(this, { albumID: albumID }, lycheeException);
						break;
					default:
						row.status.textContent = lychee.locale["UPLOAD_FAILED"];
						row.status.classList.add("error");
						row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_ERROR_UNKNOWN"];
						hasErrorOccurred = true;
						api.onError(this, { albumID: albumID }, lycheeException);
						break;
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
			formData.append("fileLastModifiedTime", files[fileIdx].lastModified);
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

		upload.showProgressReportDialog(
			lychee.locale["UPLOAD_UPLOADING"],
			files,
			function () {
				// Upload first file
				basicModal.showCancelButton();
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

		/** @param {{url: string}} data */
		const importFromUrl = function (data) {
			const runImport = function () {
				const successHandler = function () {
					// Same code as in import.dropbox()
					upload.closeProgressReportDialog();
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
					/** @type {ProgressReportDialogRow} */
					const row = upload._dom.progressRowsByPath.get(data.url);

					switch (jqXHR.status) {
						case 409:
							row.status.textContent = lychee.locale["UPLOAD_SKIPPED"];
							row.status.classList.add("warning");
							row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							break;
						default:
							row.status.textContent = lychee.locale["UPLOAD_FAILED"];
							row.status.classList.add("error");
							row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							break;
					}

					// Show close button
					basicModal.showActionButton();
					upload.notify(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]);
					album.reload();
					return true;
				};

				upload._dom.progressRowsByPath.get(data.url).status.textContent = lychee.locale["UPLOAD_IMPORTING"];

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

			upload.showProgressReportDialog(lychee.locale["UPLOAD_IMPORTING_URL"], [{ name: data.url }], runImport);
		};

		/** @param {{url: string}} data */
		const processImportFromUrlDialog = function (data) {
			if (data.url && data.url.trim().length > 3) {
				basicModal.close(false, () => importFromUrl(data));
			} else basicModal.focusError("url");
		};

		const importFromUrlDialogBody = `
			<p></p>
			<form>
				<div class="input-group stacked"><input class='text' name='url' type='text'></div>
			</form>`;

		/**
		 * @param {ModalDialogFormElements} formElements
		 * @param {HTMLDivElement} dialog
		 * @returns {void}
		 */
		const initImportFromUrlDialog = function (formElements, dialog) {
			dialog.querySelector("p").textContent = lychee.locale["UPLOAD_IMPORT_INSTR"];
			formElements.url.placeholder = "https://";
			formElements.url.value = preselectedUrl;
		};

		basicModal.show({
			body: importFromUrlDialogBody,
			readyCB: initImportFromUrlDialog,
			buttons: {
				action: {
					title: lychee.locale["UPLOAD_IMPORT"],
					fn: processImportFromUrlDialog,
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

		/**
		 * @typedef ImportFromServerDialogFormElements
		 *
		 * @property {HTMLInputElement} paths
		 * @property {HTMLInputElement} delete_imported
		 * @property {HTMLInputElement} import_via_symlink
		 * @property {HTMLInputElement} skip_duplicates
		 * @property {HTMLInputElement} resync_metadata
		 */

		/**
		 * @param {ImportFromServerDialogFormElements} formElements
		 * @param {HTMLDivElement} dialog
		 * @returns {void}
		 */
		const initImportFromServerDialog = function (formElements, dialog) {
			dialog.querySelector("p").textContent = lychee.locale["UPLOAD_IMPORT_SERVER_INSTR"];
			formElements.paths.placeholder = lychee.locale["UPLOAD_ABSOLUTE_PATH"];
			formElements.paths.value = lychee.location + "uploads/import/";
			formElements.delete_imported.previousElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS"];
			formElements.delete_imported.nextElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_DELETE_ORIGINALS_EXPL"];
			formElements.import_via_symlink.previousElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK"];
			formElements.import_via_symlink.nextElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_VIA_SYMLINK_EXPL"];
			formElements.skip_duplicates.previousElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES"];
			formElements.skip_duplicates.nextElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_SKIP_DUPLICATES_EXPL"];
			formElements.resync_metadata.previousElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_RESYNC_METADATA"];
			formElements.resync_metadata.nextElementSibling.textContent = lychee.locale["UPLOAD_IMPORT_RESYNC_METADATA_EXPL"];

			// Initialize form elements (and dependent form elements) based on
			// global configuration settings.
			if (lychee.delete_imported) {
				formElements.delete_imported.checked = true;
				formElements.import_via_symlink.checked = false;
				formElements.import_via_symlink.disabled = true;
				formElements.import_via_symlink.parentElement.classList.add("disabled");
			} else {
				if (lychee.import_via_symlink) {
					formElements.delete_imported.checked = false;
					formElements.delete_imported.disabled = true;
					formElements.delete_imported.parentElement.classList.add("disabled");
					formElements.import_via_symlink.checked = true;
				}
			}

			if (lychee.skip_duplicates) {
				formElements.skip_duplicates.checked = true;
				formElements.resync_metadata.checked = lychee.resync_metadata;
			} else {
				formElements.skip_duplicates.checked = false;
				formElements.resync_metadata.checked = false;
				formElements.resync_metadata.disabled = true;
				formElements.resync_metadata.parentElement.classList.add("disabled");
			}

			// Checkbox action handler to visualize contradictory settings
			formElements.delete_imported.addEventListener("change", function () {
				if (formElements.delete_imported.checked) {
					formElements.import_via_symlink.checked = false;
					formElements.import_via_symlink.disabled = true;
					formElements.import_via_symlink.parentElement.classList.add("disabled");
				} else {
					formElements.import_via_symlink.disabled = false;
					formElements.import_via_symlink.parentElement.classList.remove("disabled");
				}
			});

			formElements.import_via_symlink.addEventListener("change", function () {
				if (formElements.import_via_symlink.checked) {
					formElements.delete_imported.checked = false;
					formElements.delete_imported.disabled = true;
					formElements.delete_imported.parentElement.classList.add("disabled");
				} else {
					formElements.delete_imported.disabled = false;
					formElements.delete_imported.parentElement.classList.remove("disabled");
				}
			});

			formElements.skip_duplicates.addEventListener("change", function () {
				if (formElements.skip_duplicates.checked) {
					formElements.resync_metadata.disabled = false;
					formElements.resync_metadata.parentElement.classList.remove("disabled");
				} else {
					formElements.resync_metadata.checked = false;
					formElements.resync_metadata.disabled = true;
					formElements.resync_metadata.parentElement.classList.add("disabled");
				}
			});
		};

		/**
		 * @typedef ServerImportDialogResult
		 * @property {string|string[]} paths
		 * @property {boolean} delete_imported
		 * @property {boolean} import_via_symlink
		 * @property {boolean} skip_duplicates
		 * @property {boolean} resync_metadata
		 */

		/** @param {ServerImportDialogResult} data */
		const importFromServer = function (data) {
			let isUploadCancelled = false;

			const cancelUpload = function () {
				if (!isUploadCancelled) {
					api.post("Import::serverCancel", {}, function () {
						isUploadCancelled = true;
					});
				}
			};

			const runUpload = function () {
				basicModal.showCancelButton();

				// Variables holding state across the invocations of
				// processIncremental().
				let lastReadIdx = 0;
				let encounteredProblems = false;

				/**
				 * Worker function invoked from both the response progress
				 * callback and the completion callback.
				 *
				 * @param {(ImportProgressReport|ImportEventReport)[]} reports
				 */
				const processIncremental = function (reports) {
					reports.slice(lastReadIdx).forEach(function (report) {
						if (report.type === "progress") {
							// Gets existing row for the current path or creates a new one
							/** @type {ProgressReportDialogRow} */
							const row = upload._dom.progressRowsByPath.get(report.path) || upload.buildReportRow(report.path);
							upload._dom.progressRowsByPath.set(report.path, row);
							// Always unconditionally append the list entry to
							// the end of the list even if the `reportList`
							// already contains `listEntry`.
							//  1. If `listEntry` is not yet an element of
							//     `reportList` (e.g. this happens for
							//     new directories), then appending the
							//     element does the obvious thing
							//  2. If `listEntry` is already an element
							//     of `reportList` (e.g. this happens for
							//     follow-up reports), then `appendChild`
							//     *moves* `listEntry` the end of the list.
							//     We don't need to take care of accidentally
							//     duplicating the entry, the DOM tree is
							//     clever enough.
							//     Moving `listEntry` is an intended effect,
							//     as we always want the most recent entry at
							//     the end of the list.
							upload._dom.reportList.appendChild(row.listEntry);
							row.listEntry.scrollIntoView(upload.SCROLL_OPTIONS);

							if (report.progress !== 100) {
								row.status.textContent = "" + report.progress + "%";
							} else {
								// Final status report for this directory.
								row.status.textContent = lychee.locale["UPLOAD_FINISHED"];
								row.status.classList.add("success");
							}
						} else if (report.type === "event") {
							let row;
							if (!!report.path) {
								// The event report refers to a specific path,
								// hence get the existing row for that path
								// or create a new one.
								/** @type {ProgressReportDialogRow} */
								row = upload._dom.progressRowsByPath.get(report.path) || upload.buildReportRow(report.path);
								upload._dom.progressRowsByPath.set(report.path, row);
								// Always unconditionally append the list entry to
								// the end of the list even if the `reportList`
								// already contains `listEntry`.
								//  1. If `listEntry` is not yet an element of
								//     `reportList` (e.g. this happens for
								//     new directories), then appending the
								//     element does the obvious thing
								//  2. If `listEntry` is already an element
								//     of `reportList` (e.g. this happens for
								//     follow-up reports), then `appendChild`
								//     *moves* `listEntry` the end of the list.
								//     We don't need to take care of accidentally
								//     duplicating the entry, the DOM tree is
								//     clever enough.
								//     Moving `listEntry` is an intended effect,
								//     as we always want the most recent entry at
								//     the end of the list.
								upload._dom.reportList.appendChild(row.listEntry);
							} else {
								// The event report does not refer to a
								// specific directory.
								row = upload.buildReportRow(lychee.locale["UPLOAD_GENERAL"]);
								upload._dom.reportList.appendChild(row.listEntry);
							}
							row.listEntry.scrollIntoView(upload.SCROLL_OPTIONS);

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

							row.notice.textContent = noteText;
							row.status.textContent = statusText;
							row.status.classList.add(severityClass);

							encounteredProblems = true;
						}
					}); // forEach (resp)
					lastReadIdx = reports.length;
				}; // processIncremental

				/**
				 * @param {ImportReport[]} reports
				 */
				const successHandler = function (reports) {
					// reports is already JSON-parsed.
					processIncremental(reports);

					upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"], encounteredProblems ? lychee.locale["UPLOAD_COMPLETE_FAILED"] : null);

					album.reload();

					if (encounteredProblems) upload.showProgressReportCloseButton();
					else upload.closeProgressReportDialog();
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

								upload.showProgressReportCloseButton();

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
					paths: data.paths,
					delete_imported: data.delete_imported,
					import_via_symlink: data.import_via_symlink,
					skip_duplicates: data.skip_duplicates,
					resync_metadata: data.resync_metadata,
				};

				api.post("Import::server", params, successHandler, progressHandler);
			};

			upload.showProgressReportDialog(lychee.locale["UPLOAD_IMPORT_SERVER"], [], runUpload, cancelUpload);
		}; // importFromServer

		/** @param {ServerImportDialogResult} data */
		const processImportFromServerDialog = function (data) {
			if (!data.paths.trim()) {
				basicModal.focusError("paths");
				return;
			}

			// Consolidate `data` before we close the modal dialog
			// We split the given path string at unescaped spaces into an
			// array or more precisely we create an array whose entries
			// match strings with non-space characters or escaped spaces.
			// After splitting, the escaped spaces must be replaced by
			// proper spaces as escaping of spaces is a GUI-only thing to
			// allow input of several paths into a single input field.
			data.paths = data.paths.match(/(?:\\ |\S)+/g).map((path) => path.replace(/\\ /g, " "));
			basicModal.close(false, () => importFromServer(data));
		};

		const importFromServerDialogBody = `
			<p></p>
			<form>
				<div class="input-group stacked">
					<input class='text' id="server_import_dialog_path_input" name='paths' type='text' />
				</div>
				<div class='input-group compact-inverse'>
					<label for="server_import_dialog_delete_imported_check"></label>
					<input type='checkbox' id="server_import_dialog_delete_imported_check" name='delete_imported' />
					<p></p>
				</div>
				<div class='input-group compact-inverse'>
					<label for="server_import_dialog_symlink_check"></label>
					<input type='checkbox' id="server_import_dialog_symlink_check" name='import_via_symlink' />
					<p></p>
				</div>
				<div class='input-group compact-inverse'>
					<label for="server_import_dialog_skip_check"></label>
					<input type='checkbox' id="server_import_dialog_skip_check" name='skip_duplicates' />
					<p></p>
				</div>
				<div class='input-group compact-inverse'>
					<label for="server_import_dialog_resync_check"></label>
					<input type='checkbox' id="server_import_dialog_resync_check" name='resync_metadata' />
					<p></p>
				</div>
			</form>`;

		basicModal.show({
			body: importFromServerDialogBody,
			readyCB: initImportFromServerDialog,
			buttons: {
				action: {
					title: lychee.locale["UPLOAD_IMPORT"],
					fn: processImportFromServerDialog,
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
					upload.closeProgressReportDialog();
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
					// Note, this is complete rubbish:
					// Dropbox allows to import several photos at once, but
					// here we assume that `files` has only a single entry.
					// This seems to be a long-standing, open bug
					/** @type {ProgressReportDialogRow} */
					const row = upload._dom.progressRowsByPath.get(files[0].link);

					switch (jqXHR.status) {
						case 409:
							row.status.textContent = lychee.locale["UPLOAD_SKIPPED"];
							row.status.classList.add("warning");
							row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							break;
						default:
							row.status.textContent = lychee.locale["UPLOAD_FAILED"];
							row.status.classList.add("error");
							row.notice.textContent = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_IMPORT_WARN_ERR"];
							break;
					}

					// Show close button
					basicModal.showActionButton();
					upload.notify(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]);
					album.reload();
					return true;
				};

				upload._dom.progressRowsByPath.get(files[0].link).status.textContent = lychee.locale["UPLOAD_IMPORTING"];

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
			upload.showProgressReportDialog("Importing from Dropbox", files, runImport);
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

/**
 * @param {(FileList|File[])} files
 *
 * @returns {void}
 */
upload.uploadTrack = function (files) {
	const albumID = album.getID();
	if (files.length <= 0 || albumID === null) return;

	const runUpload = function () {
		// Only a single track can be uploaded at once, hence the only
		// file is at position 0.
		const row = upload._dom.progressRowsByPath.get(files[0].name);

		/**
		 * A function to be called when a response has been received.
		 *
		 * It closes the modal dialog or shows the close button and
		 * reloads the album.
		 *
		 * @this XMLHttpRequest
		 */
		const finish = function () {
			/** @type {?LycheeException} */
			const lycheeException = this.status >= 400 ? this.response : null;
			let errorText = "";
			let statusText;
			let statusClass;

			$("#upload_track_file").val("");

			switch (this.status) {
				case 200:
				case 201:
				case 204:
					statusText = lychee.locale["UPLOAD_FINISHED"];
					statusClass = "success";
					break;
				case 413:
					statusText = lychee.locale["UPLOAD_FAILED"];
					errorText = lychee.locale["UPLOAD_ERROR_POSTSIZE"];
					statusClass = "error";
					break;
				default:
					statusText = lychee.locale["UPLOAD_FAILED"];
					errorText = lycheeException ? lycheeException.message : lychee.locale["UPLOAD_ERROR_UNKNOWN"];
					statusClass = "error";
					break;
			}

			row.status.textContent = statusText;

			if (errorText !== "") {
				row.notice.textContent = errorText;

				api.onError(this, { albumID: albumID }, lycheeException);
				upload.showProgressReportCloseButton();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);
			} else {
				upload.closeProgressReportDialog();
				upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
			}

			album.reload();
		}; // finish

		row.status.textContent = lychee.locale["UPLOAD_UPLOADING"];

		const formData = new FormData();
		const xhr = new XMLHttpRequest();

		formData.append("albumID", albumID);
		formData.append("file", files[0]);

		xhr.onload = finish;
		xhr.responseType = "json";
		xhr.open("POST", "api/Album::setTrack");
		xhr.setRequestHeader("X-XSRF-TOKEN", csrf.getCSRFCookieValue());
		xhr.setRequestHeader("Accept", "application/json");

		xhr.send(formData);
	}; // runUpload

	upload.showProgressReportDialog(lychee.locale["UPLOAD_UPLOADING"], files, runUpload);
};

/**
 * @description Takes care of every action an album can handle and execute.
 */

let upload = {};

const choiceDeleteSelector = '.basicModal .choice input[name="delete"]';
const choiceSymlinkSelector = '.basicModal .choice input[name="symlinks"]';
const choiceDuplicateSelector = '.basicModal .choice input[name="skipduplicates"]';
const choiceResyncSelector = '.basicModal .choice input[name="resyncmetadata"]';

upload.show = function (title, files, callback) {
	basicModal.show({
		body: build.uploadModal(title, files),
		buttons: {
			action: {
				title: lychee.locale["CLOSE"],
				class: "hidden",
				fn: basicModal.close,
			},
		},
		callback,
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
	local: function (files) {
		let albumID = album.getID();
		let error = false;
		let warning = false;

		const process = function (_files, file) {
			let formData = new FormData();
			let xhr = new XMLHttpRequest();
			let pre_progress = 0;
			let progress = 0;
			let next_file_started = false;

			const finish = function () {
				window.onbeforeunload = null;

				$("#upload_files").val("");

				if (error === false && warning === false) {
					// Success
					basicModal.close();
					upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
				} else if (error === false && warning === true) {
					// Warning
					$(".basicModal #basicModal__action.hidden").show();
					upload.notify(lychee.locale["UPLOAD_COMPLETE"]);
				} else {
					// Error
					$(".basicModal #basicModal__action.hidden").show();
					upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);
				}

				albums.refresh();

				if (album.getID() === false) lychee.goto("unsorted");
				else album.load(albumID);
			};

			formData.append("function", "Photo::add");
			formData.append("albumID", albumID);
			formData.append(0, file);

			var api_url = api.get_url("Photo::add");

			xhr.open("POST", api_url);

			xhr.onload = function () {
				let data = null;
				let wait = false;
				let errorText = "";

				const isNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n);

				data = xhr.responseText;

				if (typeof data === "string" && data.search("phpdebugbar") !== -1) {
					// get rid of phpdebugbar thingy
					var debug_bar_n = data.search("<link rel='stylesheet' type='text/css'");
					if (debug_bar_n > 0) {
						data = data.slice(0, debug_bar_n);
					}
				}

				try {
					data = JSON.parse(data);
				} catch (e) {
					data = "";
				}

				file.ready = true;

				// Set status
				if (xhr.status === 200 && isNumber(data)) {
					// Success
					$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status")
						.html(lychee.locale["UPLOAD_FINISHED"])
						.addClass("success");
				} else {
					if (xhr.status === 413 || data.substr(0, 6) === "Error:") {
						if (xhr.status === 413) {
							errorText = lychee.locale["UPLOAD_ERROR_POSTSIZE"];
						} else {
							errorText = data.substr(6);
							if (errorText === " validation failed") {
								errorText = lychee.locale["UPLOAD_ERROR_FILESIZE"];
							} else {
								errorText += " " + lychee.locale["UPLOAD_ERROR_CONSOLE"];
							}
						}
						error = true;

						// Error Status
						$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status")
							.html(lychee.locale["UPLOAD_FAILED"])
							.addClass("error");

						// Throw error
						lychee.error(lychee.locale["UPLOAD_FAILED_ERROR"], xhr, data);
					} else if (data.substr(0, 8) === "Warning:") {
						errorText = data.substr(8);
						warning = true;

						// Warning Status
						$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status")
							.html(lychee.locale["UPLOAD_SKIPPED"])
							.addClass("warning");

						// Throw error
						lychee.error(lychee.locale["UPLOAD_FAILED_WARNING"], xhr, data);
					} else {
						errorText = lychee.locale["UPLOAD_UNKNOWN"];
						error = true;

						// Error Status
						$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status")
							.html(lychee.locale["UPLOAD_FAILED"])
							.addClass("error");

						// Throw error
						lychee.error(lychee.locale["UPLOAD_ERROR_UNKNOWN"], xhr, data);
					}

					$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") p.notice")
						.html(errorText)
						.show();
				}

				// Check if there are file which are not finished
				for (let i = 0; i < _files.length; i++) {
					if (_files[i].ready === false) {
						wait = true;
						break;
					}
				}

				// Finish upload when all files are finished
				if (wait === false) finish();
			};

			xhr.upload.onprogress = function (e) {
				if (e.lengthComputable !== true) return false;

				// Calculate progress
				progress = ((e.loaded / e.total) * 100) | 0;

				// Set progress when progress has changed
				if (progress > pre_progress) {
					$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status").html(progress + "%");
					pre_progress = progress;
				}

				if (progress >= 100 && next_file_started === false) {
					// Scroll to the uploading file
					let scrollPos = 0;
					if (file.num + 1 > 4) scrollPos = (file.num + 1 - 4) * 40;
					$(".basicModal .rows").scrollTop(scrollPos);

					// Set status to processing
					$(".basicModal .rows .row:nth-child(" + (file.num + 1) + ") .status").html(lychee.locale["UPLOAD_PROCESSING"]);

					// Upload next file
					if (file.next != null) {
						process(files, file.next);
						next_file_started = true;
					}
				}
			};

			xhr.setRequestHeader("X-XSRF-TOKEN", csrf.getCookie("XSRF-TOKEN"));
			xhr.send(formData);
		};

		if (files.length <= 0) return false;
		if (albumID === false || visible.albums() === true) albumID = 0;

		for (let i = 0; i < files.length; i++) {
			files[i].num = i;
			files[i].ready = false;

			if (i < files.length - 1) files[i].next = files[i + 1];
			else files[i].next = null;
		}

		window.onbeforeunload = function () {
			return lychee.locale["UPLOAD_IN_PROGRESS"];
		};

		upload.show(lychee.locale["UPLOAD_UPLOADING"], files, function () {
			// Upload first file
			process(files, files[0]);
		});
	},

	url: function (url = "") {
		let albumID = album.getID();

		url = typeof url === "string" ? url : "";

		if (albumID === false) albumID = 0;

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

					api.post("Import::url", params, function (_data) {
						// Same code as in import.dropbox()

						if (_data !== true) {
							$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]).show();

							$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("warning");

							// Show close button
							$(".basicModal #basicModal__action.hidden").show();

							// Log error
							lychee.error(null, params, _data);
						} else {
							basicModal.close();
						}

						upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);

						albums.refresh();

						if (album.getID() === false) lychee.goto("0");
						else album.load(albumID);
					});
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
		if (albumID === false) albumID = 0;

		const action = function (data) {
			if (!data.path.trim()) {
				basicModal.error("path");
				return;
			}

			let files = [];

			files[0] = {
				name: data.path,
			};

			let delete_imported = $(choiceDeleteSelector).prop("checked") ? "1" : "0";
			let import_via_symlink = $(choiceSymlinkSelector).prop("checked") ? "1" : "0";
			let skip_duplicates = $(choiceDuplicateSelector).prop("checked") ? "1" : "0";
			let resync_metadata = $(choiceResyncSelector).prop("checked") ? "1" : "0";

			upload.show(lychee.locale["UPLOAD_IMPORT_SERVER"], files, function () {
				$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_IMPORTING"]);

				let params = {
					albumID: albumID,
					path: data.path,
					delete_imported: delete_imported,
					import_via_symlink: import_via_symlink,
					skip_duplicates: skip_duplicates,
					resync_metadata: resync_metadata,
				};

				if (lychee.api_V2 === false) {
					api.post("Import::server", params, function (_data) {
						albums.refresh();
						upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);

						if (_data === "Notice: Import only contained albums!") {
							// No error, but the folder only contained albums

							// Go back to the album overview to show the imported albums
							if (visible.albums()) lychee.load();
							else album.reload();

							basicModal.close();

							return true;
						} else if (_data === "Warning: Folder empty or no readable files to process!") {
							// Error because the import could not start

							$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_SERVER_FOLD"]).show();

							$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FAILED"]).addClass("error");

							// Log error
							lychee.error(lychee.locale["UPLOAD_IMPORT_SERVER_EMPT"], params, _data);
						} else {
							if (_data !== true) {
								// Maybe an error, maybe just some skipped photos

								$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]).show();

								$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("warning");

								// Log error
								lychee.error(null, params, _data);
							} else {
								// No error, everything worked fine

								basicModal.close();
							}

							if (album.getID() === false) lychee.goto("0");
							else album.load(albumID);
						}

						// Show close button
						$(".basicModal #basicModal__action.hidden").show();

						return;
					});
				} else {
					// Variables holding state across the invocations of
					// processIncremental().
					let lastReadIdx = 0;
					let currentDir = data.path;
					let encounteredProblems = false;
					let rowCount = 1;

					// Worker function invoked from both the response progress
					// callback and the completion callback.
					const processIncremental = function (jsonResponse) {
						// Skip the part that we've already processed during
						// the previous invocation(s).
						let newResponse = jsonResponse.substring(lastReadIdx);
						// Because of all the potential buffering along the way,
						// we can't be sure if the last line is complete.  For
						// that reason, our custom protocol terminates every
						// line with the newline character, including the last
						// line.
						let lastNewline = newResponse.lastIndexOf("\n");
						if (lastNewline === -1) {
							// No valid input data to process.
							return;
						}
						if (lastNewline !== newResponse.length - 1) {
							// Last line is not newline-terminated, so it
							// must be incomplete.  Strip it; it will be
							// handled during the next invocation.
							newResponse = newResponse.substring(0, lastNewline + 1);
						}
						// Advance the counter past the last valid character.
						lastReadIdx += newResponse.length;

						newResponse.split("\n").forEach(function (resp) {
							let matches = resp.match(/^Status: (.*): (\d+)$/);
							if (matches !== null) {
								if (matches[2] !== "100") {
									if (currentDir !== matches[1]) {
										// New directory.  Add a new line to
										// the dialog box.
										currentDir = matches[1];
										$(".basicModal .rows").append(build.uploadNewFile(currentDir));
										rowCount++;
									}
									$(".basicModal .rows .row:last-child .status").html(matches[2] + "%");
								} else {
									// Final status report for this directory.
									$(".basicModal .rows .row:last-child .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("success");
								}
							} else if ((matches = resp.match(/^Problem: (.*): ([^:]*)$/)) !== null) {
								let rowSelector;
								if (currentDir !== matches[1]) {
									$(".basicModal .rows .row:last-child").before(build.uploadNewFile(matches[1]));
									rowCount++;
									rowSelector = ".basicModal .rows .row:nth-last-child(2)";
								} else {
									// The problem is with the directory
									// itself, so alter its existing line.
									rowSelector = ".basicModal .rows .row:last-child";
								}
								if (matches[2] === "Given path is not a directory" || matches[2] === "Given path is reserved") {
									$(rowSelector + " .status")
										.html(lychee.locale["UPLOAD_FAILED"])
										.addClass("error");
								} else {
									$(rowSelector + " .status")
										.html(lychee.locale["UPLOAD_SKIPPED"])
										.addClass("warning");
								}
								$(rowSelector + " .notice")
									.html(
										matches[2] === "Given path is not a directory"
											? lychee.locale["UPLOAD_IMPORT_NOT_A_DIRECTORY"]
											: matches[2] === "Given path is reserved"
											? lychee.locale["UPLOAD_IMPORT_PATH_RESERVED"]
											: matches[2] === "Could not read file"
											? lychee.locale["UPLOAD_IMPORT_UNREADABLE"]
											: matches[2] === "Could not import file"
											? lychee.locale["UPLOAD_IMPORT_FAILED"]
											: matches[2] === "Unsupported file type"
											? lychee.locale["UPLOAD_IMPORT_UNSUPPORTED"]
											: matches[2] === "Could not create album"
											? lychee.locale["UPLOAD_IMPORT_ALBUM_FAILED"]
											: matches[2]
									)
									.show();
								encounteredProblems = true;
							} else if (resp === "Warning: Approaching memory limit") {
								$(".basicModal .rows .row:last-child").before(build.uploadNewFile(lychee.locale["UPLOAD_IMPORT_LOW_MEMORY"]));
								rowCount++;
								$(".basicModal .rows .row:nth-last-child(2) .status").html(lychee.locale["UPLOAD_WARNING"]).addClass("warning");
								$(".basicModal .rows .row:nth-last-child(2) .notice").html(lychee.locale["UPLOAD_IMPORT_LOW_MEMORY_EXPL"]).show();
							}
							$(".basicModal .rows").scrollTop((rowCount - 1) * 40);
						}); // forEach (resp)
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

							if (album.getID() === false) lychee.goto("0");
							else album.load(albumID);

							if (encounteredProblems) {
								// Show close button
								$(".basicModal #basicModal__action.hidden").show();
							} else {
								basicModal.close();
							}
						},
						function (event) {
							// We received a possibly partial response.
							// We need to begin by terminating the data with a
							// '"' so that it can be JSON-parsed.
							let response = this.response;
							if (response.length > 0) {
								if (response.substring(this.response.length - 1) === '"') {
									// This might be either a terminating '"'
									// or it may come from, say, a filename, in
									// which case it would be escaped.
									if (response.length > 1) {
										if (response.substring(this.response.length - 2) === '"') {
											response += '"';
										}
										// else it's a complete response,
										// requiring no termination from us.
									} else {
										// The response is just '"'.
										response += '"';
									}
								} else {
									// This should be the most common case for
									// partial responses.
									response += '"';
								}
							}
							// Parse the response as JSON.  This will remove
							// the surrounding '"' characters, unescape any '"'
							// from the middle, and translate '\n' sequences into
							// newlines.
							let jsonResponse;
							try {
								jsonResponse = JSON.parse(response);
							} catch (e) {
								// Most likely a SyntaxError due to something
								// that went wrong on the server side.
								$(".basicModal .rows .row:last-child .status").html(lychee.locale["UPLOAD_FAILED"]).addClass("error");

								albums.refresh();
								upload.notify(lychee.locale["UPLOAD_COMPLETE"], lychee.locale["UPLOAD_COMPLETE_FAILED"]);

								if (album.getID() === false) lychee.goto("0");
								else album.load(albumID);

								// Show close button
								$(".basicModal #basicModal__action.hidden").show();

								return;
							}
							// The rest of the work is the same as for the full
							// response.
							processIncremental(jsonResponse);
						}
					); // api.post
				} // lychee.api_V2
			}); // upload.show
		}; // action

		let msg = lychee.html`
			<p class='importServer'>
				${lychee.locale["UPLOAD_IMPORT_SERVER_INSTR"]}
				<input class='text' name='path' type='text' placeholder='${lychee.locale["UPLOAD_ABSOLUTE_PATH"]}' value='${lychee.location}uploads/import/'>
			</p>
		`;
		if (lychee.api_V2) {
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
		}

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

				api.post("Import::url", params, function (data) {
					// Same code as in import.url()

					if (data !== true) {
						$(".basicModal .rows .row p.notice").html(lychee.locale["UPLOAD_IMPORT_WARN_ERR"]).show();

						$(".basicModal .rows .row .status").html(lychee.locale["UPLOAD_FINISHED"]).addClass("warning");

						// Show close button
						$(".basicModal #basicModal__action.hidden").show();

						// Log error
						lychee.error(null, params, data);
					} else {
						basicModal.close();
					}

					upload.notify(lychee.locale["UPLOAD_IMPORT_COMPLETE"]);

					albums.refresh();

					if (album.getID() === false) lychee.goto("0");
					else album.load(albumID);
				});
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

/**
 * The Basic Model component.
 *
 * See: {@link https://github.com/LycheeOrg/basicModal}
 *
 * @namespace basicModal
 */

/**
 * Returns an associative object containing the values from all `input` and
 * `select` elements.
 *
 * The properties of the returned object correspond to the `name` attribute
 * of the `input` and `select` elements.
 *
 * @function getValues
 * @memberOf basicModal
 * @returns {Object}
 */

/**
 * Constructs and shows a modal dialog.
 *
 * After the dialog has become ready, the callback `data.callback` is
 * invoked.
 *
 * @function show
 * @memberOf basicModal
 * @param {ModalDialogData} data configuration data for the dialog
 * @returns {boolean} `true` if the dialog became visible
 */

/**
 * Removes (potentially) old error indicators and highlights the indicated
 * input element.
 *
 * @function error
 * @memberOf basicModal
 * @param {string} [nameAttribute] the name of the HTML input element which
 *                                 caused the error and shall be highlighted
 * @returns {void}
 */

/**
 * Determines whether a modal dialog is visible or not.
 *
 * @function visible
 * @memberOf basicModal
 * @returns {boolean}
 */

/**
 * Triggers a virtual "on-click" event on the main action button.
 *
 * The method closes the dialog and calls the registered callback for the main
 * action.
 *
 * @function action
 * @memberOf basicModal
 * @returns {boolean} `true`, if the main action button exists and a click
 *                     event has been triggered; `false` otherwise
 */

/**
 * Triggers a virtual "on-click" event on the cancel button.
 *
 * The method closes the dialog and calls the registered callback for the
 * cancel action.
 *
 * @function cancel
 * @memberOf basicModal
 * @returns {boolean} `true`, if the main action button exists and a click
 *                     event has been triggered; `false` otherwise
 */

/**
 * Removes any (potential) error indicator from the input elements.
 *
 * @function reset
 * @memberOf basicModal
 * @returns {boolean} always `true`
 */

/**
 * Closes the dialog without triggering any action.
 *
 * @function close
 * @memberOf basicModal
 * @param {boolean} [force=false]
 * @returns {boolean} `true`, if the dialog has been visible before and has
 *                     been closed;
 *                    `false`, if no dialog has been visible which could be
 *                    closed
 */

/**
 * @typedef ModalDialogData
 * @property {string}                 [body='']       HTML snippet to be inserted into the content
 *                                                    area of the dialog
 * @property {string}                 [class='']      CSS class to be applied to the content area
 *                                                    of the dialog
 * @property {boolean}                [closable=true] indicates whether the dialog can be closed
 *                                                    via {@link basicModal.close}
 * @property {ModalDialogButtonsData} buttons         configuration data for the main action and
 *                                                    cancel button
 * @property {ModalDialogReadyCB}     [callback=null] callback to be called after the dialog
 *                                                    has become visible and ready for user input
 */

/**
 * @callback ModalDialogReadyCB
 * @param {ModalDialogData} data the configuration data which has been used to construct the dialog
 * @returns {void}
 */

/**
 * @typedef ModalDialogButtonsData
 * @property {ModalDialogButtonData} [action] configuration data for the main action button
 * @property {ModalDialogButtonData} [cancel] configuration data for the cancel button
 */

/**
 * @typedef ModalDialogButtonData
 * @property {string}              [title] the caption of the button
 * @property {string}              [class] CSS class to be applied to the button
 * @property {ModalDialogButtonCB} fn      callback to be called upon an "on-click" event
 */

/**
 * @callback ModalDialogButtonCB
 * @param {Object} [values] an associative object with the values of all HTML
 *                          input elements; see {@link basicModal.getValues}
 * @returns {void}
 */

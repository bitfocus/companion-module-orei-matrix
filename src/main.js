//OREI HDMI MATRIX EXTENDER

import { InstanceBase, Regex, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
//import { UpgradeScripts } from './upgrades.js'  //no current upgrade scripts, but leaving in place for future use
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresetDefinitions } from './presets.js'

class OreiMatrixInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.CHOICES_INPUTS = []
		this.CHOICES_OUTPUTS = []
		this.CHOICES_PRESETS = [
			{ id: '1', label: '1' },
			{ id: '2', label: '2' },
			{ id: '3', label: '3' },
			{ id: '4', label: '4' },
		]
		this.CHOICES_POWER = [
			{ id: '1', label: 'ON' },
			{ id: '0', label: 'OFF' },
		]
		this.CHOICES_STATE = [
			{ id: 'enable', label: 'ENABLE' },
			{ id: 'disable', label: 'DISABLE' },
			{ id: 'toggle', label: 'TOGGLE' },
		]
		this.pollMixerTimer = undefined
		this.selectedInput = 1
		this.outputRoute = {}
		this.outputHDMI = {}
		this.outputCAT = {}
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		await this.configUpdated(this.config)

		const DEFAULT_POLLING_INTERVAL = 750 // milliseconds
		const DEFAULT_TELNET_PORT = 23

		this.config.polling_interval = this.config.polling_interval ?? DEFAULT_POLLING_INTERVAL
		this.config.port = this.config.port ?? DEFAULT_TELNET_PORT

		this.initArrays(this.config.channels)
		this.updateActions()
		this.updateFeedbacks()
		this.checkFeedbacks()
		this.updateVariableDefinitions()

		this.updateMatrixVariables()
		this.updatePresetDefinitions()

		this.init_tcp()
		this.initPolling()
	}

	// When module gets deleted
	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}

		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		// polling is running and polling may have been de-selected by config change or tcp data changed
		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}
		this.config = config

		const DEFAULT_POLLING_INTERVAL = 750 // milliseconds
		const DEFAULT_TELNET_PORT = 23

		this.config.polling_interval = this.config.polling_interval ?? DEFAULT_POLLING_INTERVAL
		this.config.port = this.config.port ?? DEFAULT_TELNET_PORT

		this.initArrays(this.config.channels) // re-initialise data as number of channels could have changed
		this.updateActions()
		this.updateFeedbacks()
		this.checkFeedbacks()
		this.updateVariableDefinitions()

		this.updateMatrixVariables()
		this.updatePresetDefinitions()

		this.init_tcp()
		this.initPolling()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to an OREI HDMI MATRIX EXTENDER',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				default: '192.168.0.3',
				regex: Regex.IP, //this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'IP Port',
				width: 6,
				default: '23',
				regex: Regex.PORT, //this.REGEX_PORT,
			},
			{
				type: 'dropdown',
				id: 'channels',
				label: 'Number of channels',
				default: '4',
				choices: [
					{ id: '4', label: '4' },
					{ id: '8', label: '8' },
				],
			},
			{
				type: 'number',
				id: 'polling_interval',
				label: 'Polling Interval (ms)',
				min: 300,
				max: 30000,
				default: 1000,
				width: 8,
			},
			{
				type: 'checkbox',
				id: 'polled_data',
				label: 'Use polled data from unit :',
				default: true,
				width: 8,
			},
			{
				type: 'checkbox',
				id: 'log_responses',
				label: 'Log returned data :',
				default: false,
				width: 8,
			},
			{
				type: 'checkbox',
				id: 'log_tokens',
				label: 'Log token data :',
				default: false,
				width: 8,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresetDefinitions() {
		UpdatePresetDefinitions(this)
	}

	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.log('debug', status, message)
			})

			this.socket.on('error', (err) => {
				this.log('debug', 'Network error', err)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('connect', () => {
				this.log('debug', 'Connected')
			})

			this.socket.on('data', (receivebuffer) => {
				this.processResponse(receivebuffer)
			})
		}
	}

	processResponse(receivebuffer) {
		if (this.config.log_responses) {
			this.log('debug', 'Response: ' + receivebuffer)
		}
		if (this.config.polled_data) {
			let responses = receivebuffer.toString('utf8').split(/[\r\n]+/)
			for (let response of responses) {
				if (response.length > 0) {
					let tokens = response.split(' ')
					if (this.config.log_tokens) {
						this.log('debug', 'Tokens: ' + tokens)
					}
					/*
					example poll responses from switch:
					input 1 -> output 4
					Enable hdmi output 1 stream
					Disable cat output 4 stream
					*/
					if (tokens[0] == 'input') {
						this.updateRoute(tokens[4], tokens[1])
					} else {
						switch (tokens[1]) {
							case 'hdmi':
								this.updateHDMI(tokens[3], tokens[0].toLowerCase())
								break
							case 'cat':
								this.updateCAT(tokens[3], tokens[0].toLowerCase())
								break
						}
					}
				}
			}
		}
	}

	sendCommand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.isConnected) {
				if (this.config.log_responses) {
					this.log('debug', 'Sending command: ' + cmd)
				}
				this.socket.send(cmd + '\r\n')
			} else {
				this.log('debug', 'Socket not connected :(')
			}
		}
	}

	initPolling() {
		// read switch state, possible changes using controls on the unit or web interface, 0 for all channels
		if (this.pollMixerTimer == undefined) {
			this.pollMixerTimer = setInterval(() => {
				this.sendCommand('r av out 0!')
				this.sendCommand('r hdmi 0 stream!')
				this.sendCommand('r cat 0 stream!')
			}, this.config.polling_interval)
		}
	}

	updateMatrixVariables() {
		let varUpdate = {}
		this.CHOICES_INPUTS.forEach((input) => {
			let list = ''
			for (let key in this.outputRoute) {
				if (this.outputRoute[key] == input.id) {
					list += key + ','
				}
			}
			varUpdate[`Input${input.id}`] = list
		})
		if (this.config.log_tokens) {
			this.log('debug', 'Matrix: ' + JSON.stringify(varUpdate))
		}
		this.setVariableValues(varUpdate)
	}

	updateRoute(output, input) {
		if (this.config.log_tokens) {
			this.log('debug', 'Route: output: ' + output + ' from input: ' + input)
		}
		let varUpdate = {}
		this.outputRoute[output] = input
		varUpdate[`Output${output}`] = input
		this.setVariableValues(varUpdate)
		this.updateMatrixVariables()
		this.checkFeedbacks('Output') // internal action or buttons may have been pressed directly on the hardware or a preset could be recalled
	}

	updateCAT(output, stateToggle) {
		if (stateToggle == 'toggle') {
			this.outputCAT[output] == 'disable' ? (stateToggle = 'enable') : (stateToggle = 'disable')
		}
		this.outputCAT[output] = stateToggle
		this.checkFeedbacks('stateCAT') // internal action or buttons may have been pressed directly on the hardware or a preset could be recalled
		return stateToggle == 'disable' ? '0' : '1'
	}
	updateHDMI(output, stateToggle) {
		if (stateToggle == 'toggle') {
			this.outputHDMI[output] == 'disable' ? (stateToggle = 'enable') : (stateToggle = 'disable')
		}
		this.outputHDMI[output] = stateToggle
		this.checkFeedbacks('stateHDMI') // internal action or buttons may have been pressed directly on the hardware or a preset could be recalled
		return stateToggle == 'disable' ? '0' : '1'
	}

	initArrays(topcount) {
		this.CHOICES_INPUTS = []
		this.CHOICES_OUTPUTS = []
		this.outputRoute = {}
		this.outputCAT = {}
		this.outputHDMI = {}
		if (topcount > 0) {
			for (let i = 1; i <= topcount; i++) {
				let channelObj = {}
				channelObj.id = i.toString()
				channelObj.label = i.toString()
				this.CHOICES_INPUTS.push(channelObj)
				this.CHOICES_OUTPUTS.push(channelObj)
				this.outputRoute[i] = i.toString()
				this.outputCAT[i] = 'enable'
				this.outputHDMI[i] = 'enable'
			}
		}
	}
}

runEntrypoint(OreiMatrixInstance, [])

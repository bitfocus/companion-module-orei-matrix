export function UpdateActions(self) {
	const actions = {
		select_input: {
			name: 'Select Input',
			options: [
				{
					type: 'dropdown',
					label: 'Input Port',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: (action) => {
				self.selectedInput = action.options.input
				self.checkFeedbacks()
			},
		},
		switch_output: {
			name: 'Switch Output',
			options: [
				{
					type: 'dropdown',
					label: 'Output Port',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
			],
			callback: (action) => {
				self.sendCommand('s in ' + self.selectedInput + ' av out ' + action.options.output + '!')
				self.updateRoute(action.options.output, self.selectedInput)
				self.checkFeedbacks()
			},
		},
		input_output: {
			name: 'Input to Output',
			options: [
				{
					type: 'dropdown',
					label: 'Output Port',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
				{
					type: 'dropdown',
					label: 'Input Port',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: (action) => {
				self.sendCommand('s in ' + action.options.input + ' av out ' + action.options.output + '!')
				self.updateRoute(action.options.output, action.options.input)
				self.checkFeedbacks()
			},
		},
		all: {
			name: 'All outputs to selected input',
			options: [
				{
					type: 'checkbox',
					label: 'Use selected (or defined input)',
					id: 'selected',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Input Port',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: (action) => {
				let myInput = self.selectedInput
				if (!action.options.selected) {
					myInput = action.options.input
				}
				self.sendCommand('s in ' + myInput + ' av out 0!')
				for (let key in self.outputRoute) {
					if (key <= self.config.channels) {
						self.updateRoute(key, myInput)
					}
				}
				self.checkFeedbacks()
			},
		},
		preset: {
			name: 'Recall routes from preset number',
			options: [
				{
					type: 'dropdown',
					label: 'Preset number',
					id: 'preset',
					default: '1',
					choices: self.CHOICES_PRESETS,
				},
			],
			callback: (action) => {
				self.sendCommand('s recall preset ' + action.options.preset + '!')
				self.checkFeedbacks()
			},
		},
		save_preset: {
			name: 'Save current routes to preset number',
			options: [
				{
					type: 'dropdown',
					label: 'Preset number',
					id: 'preset',
					default: '1',
					choices: self.CHOICES_PRESETS,
				},
			],
			callback: (action) => {
				self.sendCommand('s save preset ' + action.options.preset + '!')
				self.checkFeedbacks()
			},
		},
		clear_preset: {
			name: 'Clear preset number',
			options: [
				{
					type: 'dropdown',
					label: 'Preset number',
					id: 'preset',
					default: '1',
					choices: self.CHOICES_PRESETS,
				},
			],
			callback: (action) => {
				self.sendCommand('s clear preset ' + action.options.preset + '!')
				self.checkFeedbacks()
			},
		},
		cat_switch: {
			name: 'Enable/Disable CAT output',
			options: [
				{
					type: 'dropdown',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
				{
					type: 'dropdown',
					label: 'Enable / Disable / Toggle',
					id: 'stateToggle',
					default: 'enable',
					choices: self.CHOICES_STATE,
				},
			],
			callback: (action) => {
				self.sendCommand(
					's cat ' +
						action.options.output +
						' stream ' +
						self.updateCAT(action.options.output, action.options.stateToggle) +
						'!',
				)
				self.checkFeedbacks()
			},
		},
		hdmi_switch: {
			name: 'Enable/Disable HDMI output',
			options: [
				{
					type: 'dropdown',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
				{
					type: 'dropdown',
					label: 'Enable / Disable / Toggle',
					id: 'stateToggle',
					default: 'enable',
					choices: self.CHOICES_STATE,
				},
			],
			callback: (action) => {
				self.sendCommand(
					's hdmi ' +
						action.options.output +
						' stream ' +
						self.updateHDMI(action.options.output, action.options.stateToggle) +
						'!',
				)
				self.checkFeedbacks()
			},
		},
		power: {
			name: 'Power control',
			options: [
				{
					type: 'dropdown',
					label: 'Power control',
					id: 'power',
					default: '1', // ON
					choices: self.CHOICES_POWER,
				},
			],
			callback: (action) => {
				self.sendCommand('s power ' + action.options.power + '!')
				self.checkFeedbacks()
			},
		},
	}
	self.setActionDefinitions(actions)
}

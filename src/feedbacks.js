import { combineRgb } from '@companion-module/base'

export function UpdateFeedbacks(self) {
	self.setFeedbackDefinitions({
		Selected: {
			name: 'Selected',
			type: 'boolean',
			//label: 'Status for input',
			description: 'Show feedback selected input',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INPUTS,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.selectedInput == opt.input) {
					return true
				} else {
					return false
				}
			},
		},
		Output: {
			name: 'Output',
			type: 'boolean',
			//label: 'Status for output',
			description: 'Show feedback selected output',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.outputRoute[opt.output] == self.selectedInput) {
					return true
				} else {
					return false
				}
			},
		},
		stateHDMI: {
			name: 'stateHDMI',
			type: 'boolean',
			//label: 'State for HDMI output',
			description: 'Enable state for HDMI output',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.outputHDMI[opt.output] == 'disable') {
					return true
				} else {
					return false
				}
			},
		},
		stateCAT: {
			name: 'stateCAT',
			type: 'boolean',
			//label: 'State for CAT output',
			description: 'Enable state for CAT output',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.outputCAT[opt.output] == 'disable') {
					return true
				} else {
					return false
				}
			},
		},
	})
}

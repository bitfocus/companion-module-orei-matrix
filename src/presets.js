import { combineRgb } from '@companion-module/base'

export function UpdatePresetDefinitions(self) {
	const presets = {}

	const aSelectPreset = (input) => {
		return {
			type: 'button',
			category: 'Select Input',
			name: 'Select',
			style: {
				style: 'text',
				text: `In ${input}\\n> $(${self.config.label}:Input${input})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'select_input',
							options: {
								input: input,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'Selected',
					options: {
						input: input,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	}
	const aSwitchPreset = (output) => {
		return {
			type: 'button',
			category: 'Switch Output',
			name: 'Switch',
			style: {
				style: 'text',
				text: `Out ${output}\\n< $(${self.config.label}:Output${output})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'switch_output',
							options: {
								output: output,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'Output',
					options: {
						output: output,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		}
	}
	const aCATPreset = (output) => {
		return {
			type: 'button',
			category: 'stateCAT',
			name: 'State of CAT output',
			style: {
				style: 'text',
				text: `CAT Out ${output}`,
				size: 'auto',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'cat_switch',
							options: {
								output: output,
								stateToggle: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'stateCAT',
					options: {
						output: output,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	}

	const aHDMIPreset = (output) => {
		return {
			type: 'button',
			category: 'stateHDMI',
			name: 'State of HDMI output',
			style: {
				style: 'text',
				text: `HDMI Out ${output}`,
				size: 'auto',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'hdmi_switch',
							options: {
								output: output,
								stateToggle: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'stateHDMI',
					options: {
						output: output,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	}
	const anAllPreset = (input) => {
		return {
			type: 'button',
			category: 'All',
			name: 'All',
			style: {
				style: 'text',
				text: `All\\n${input}`,
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(32, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'all',
							options: { input: input },
						},
					],
					up: [],
				},
			],
		}
	}

	self.CHOICES_INPUTS.forEach((input) => {
		presets[`Select${input.id}`] = aSelectPreset(input.id)
	})
	self.CHOICES_OUTPUTS.forEach((output) => {
		presets[`Switch${output.id}`] = aSwitchPreset(output.id)
	})
	self.CHOICES_OUTPUTS.forEach((output) => {
		presets[`CAT${output.id}`] = aCATPreset(output.id)
	})
	self.CHOICES_OUTPUTS.forEach((output) => {
		presets[`HDMI${output.id}`] = aHDMIPreset(output.id)
	})
	self.CHOICES_INPUTS.forEach((input) => {
		presets[`All${input.id}`] = anAllPreset(input.id)
	})

	presets['in-to-out'] = {
		type: 'button',
		category: 'In to Out',
		name: 'In to Out',
		style: {
			style: 'text',
			text: 'In to Out',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'input_output',
						options: {
							input: '1',
							output: '1',
							select: false,
						},
					},
				],
				up: [],
			},
		],
	}
	//console.log('setting presets' + JSON.stringify(presets))
	self.setPresetDefinitions(presets)
}

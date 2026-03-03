export function UpdateVariableDefinitions(self) {
	let variables = []
	for (let i = 1; i <= self.config.channels; i++) {
		variables.push({
			variableId: `Input${i}`,
			name: `input_route${i}`,
		})
	}
	self.CHOICES_OUTPUTS.forEach((item) => {
		variables.push({
			variableId: `Output${item.id}`,
			name: `output_route${item.id}`,
		})
	})
	self.setVariableDefinitions(variables)

	let varUpdate = {}
	self.CHOICES_OUTPUTS.forEach((output) => {
		varUpdate[`Output${output.id}`] = self.outputRoute[output.id]
	})
	self.setVariableValues(varUpdate)
}

import { readable } from 'svelte/store'

export const modifierKeys = readable(
	{
		ctrl: false,
		shift: false,
	},
	function start(set) {
		function updateValue(e) {
			set({
				ctrl: e.ctrlKey,
				shift: e.shiftKey,
			})
		}

		function resetValue() {
			set({
				ctrl: false,
				shift: false,
			})
		}

		document.addEventListener('keydown', updateValue)
		document.addEventListener('keyup', updateValue)
		window.addEventListener('blur', resetValue)

		return function stop() {
			document.removeEventListener('keydown', updateValue)
			document.removeEventListener('keyup', updateValue)
			window.removeEventListener('blur', resetValue)
		}
	}
)

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, readonly } from 'vue'

interface Props {
  length?: number
  modelValue?: string
  disabled?: boolean
  hasError?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  modelValue: '',
  disabled: false,
  hasError: false,
  autoFocus: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
  change: [value: string]
}>()

const digits = ref<string[]>(Array(props.length).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const skipSelectIndex = ref<number | null>(null)

const otpValue = computed<string>(() => digits.value.join(''))
const isComplete = computed<boolean>(
  () => otpValue.value.length === props.length
)

const setInputRef = (el: HTMLInputElement | null, index: number): void => {
  if (el) {
    inputRefs.value[index] = el
  }
}

const updateValue = (): void => {
  if (props.disabled) return

  const newValue = otpValue.value
  emit('update:modelValue', newValue)
  emit('change', newValue)

  if (isComplete.value) {
    emit('complete', newValue)
  }
}

const handlePaste = (event: ClipboardEvent): void => {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  event.preventDefault()

  const pastedText = event.clipboardData?.getData('text') || ''
  const numericText = pastedText.replace(/[^0-9]/g, '')

  if (numericText.length === 0) return

  const currentIndex = inputRefs.value.findIndex(ref => ref === event.target)

  const newDigits = [...digits.value]

  for (let i = currentIndex; i < props.length; i++) {
    newDigits[i] = ''
  }

  for (
    let i = 0;
    i < numericText.length && currentIndex + i < props.length;
    i++
  ) {
    newDigits[currentIndex + i] = numericText[i]
  }

  digits.value = newDigits

  const nextEmptyIndex = digits.value.findIndex(digit => !digit)
  const focusTargetIndex =
    nextEmptyIndex !== -1
      ? nextEmptyIndex
      : Math.min(currentIndex + numericText.length, props.length - 1)

  nextTick(() => {
    if (!props.disabled) {
      inputRefs.value[focusTargetIndex]?.focus()
    }
  })

  updateValue()
}

const focusInput = (
  index: number,
  options: { select?: boolean } = {}
): void => {
  if (props.disabled) return
  if (index < 0 || index >= props.length) return

  if (options.select === false) {
    skipSelectIndex.value = index
  } else {
    skipSelectIndex.value = null
  }

  nextTick(() => {
    if (!props.disabled) {
      inputRefs.value[index]?.focus()
    }
  })
}

const removeDigitAt = (startIndex: number): void => {
  const newDigits = [...digits.value]

  for (let i = startIndex; i < props.length - 1; i++) {
    newDigits[i] = newDigits[i + 1]
  }
  newDigits[props.length - 1] = ''

  digits.value = newDigits
  updateValue()
}

const handleInput = (index: number, event: InputEvent): void => {
  if (props.disabled) return

  const target = event.target as HTMLInputElement
  const value = target.value
  const numericValue = value.replace(/[^0-9]/g, '')

  if (value !== numericValue) {
    target.value = numericValue
  }

  if (numericValue) {
    const newDigit = numericValue[numericValue.length - 1]
    const newDigits = [...digits.value]

    newDigits[index] = newDigit
    digits.value = newDigits
    if (index < props.length - 1) {
      nextTick(() => inputRefs.value[index + 1]?.focus())
    }

    target.value = ''
  } else {
    digits.value[index] = ''
  }

  updateValue()
}

const handleKeydown = (index: number, event: KeyboardEvent): void => {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  const isVKey =
    event.code === 'KeyV' ||
    event.key === 'v' ||
    event.key === 'V' ||
    event.key === 'м' ||
    event.key === 'М'

  if ((event.ctrlKey || event.metaKey) && isVKey) {
    return
  }

  if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()

    const newDigits = [...digits.value]
    const currentIsEmpty = digits.value[index] === ''

    if (currentIsEmpty) {
      const firstEmptyIndex = digits.value.findIndex(digit => digit === '')

      if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
        newDigits[firstEmptyIndex] = event.key
        digits.value = newDigits
        updateValue()

        const nextIndex = firstEmptyIndex + 1
        if (nextIndex < props.length) {
          focusInput(nextIndex)
        }
      } else {
        newDigits[index] = event.key
        digits.value = newDigits
        updateValue()

        if (index < props.length - 1) {
          focusInput(index + 1)
        }
      }
    } else {
      newDigits[index] = event.key
      digits.value = newDigits
      updateValue()

      if (index < props.length - 1) {
        focusInput(index + 1)
      }
    }

    return
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    const currentDigit = digits.value[index]
    const previousIndex = index - 1
    const hasPrevious = previousIndex >= 0
    const previousDigit = hasPrevious ? digits.value[previousIndex] : ''

    if (!currentDigit) {
      if (hasPrevious) {
        focusInput(previousIndex, { select: previousDigit !== '' })
      }
      return
    }

    removeDigitAt(index)

    if (hasPrevious) {
      focusInput(previousIndex, { select: true })
    }
  } else if (event.key === 'Delete') {
    event.preventDefault()
    const currentDigit = digits.value[index]
    const nextIndex = index + 1
    const hasNext = nextIndex < props.length
    const nextDigit = hasNext ? digits.value[nextIndex] : ''

    if (!currentDigit) {
      if (hasNext && nextDigit !== '') {
        focusInput(nextIndex)
      }
      return
    }

    removeDigitAt(index)

    nextTick(() => {
      inputRefs.value[index]?.focus()
      inputRefs.value[index]?.select()
    })
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
  } else if (event.key === 'Enter' && isComplete.value) {
    event.preventDefault()
    emit('complete', otpValue.value)
  } else if (
    !/^[0-9]$/.test(event.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
      event.key
    )
  ) {
    event.preventDefault()
  }
}

const handleFocus = (index: number): void => {
  if (props.disabled) return

  nextTick(() => {
    if (skipSelectIndex.value === index) {
      skipSelectIndex.value = null
      return
    }
    inputRefs.value[index]?.select()
  })
}

const clear = (): void => {
  if (props.disabled) return

  digits.value = Array(props.length).fill('')
  updateValue()
  if (props.autoFocus) {
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  }
}

const focus = (index: number = 0): void => {
  if (props.disabled || !inputRefs.value[index]) return

  nextTick(() => {
    inputRefs.value[index]?.focus()
  })
}

const setValue = (value: string): void => {
  if (props.disabled) return

  const cleanValue = value.replace(/[^0-9]/g, '').slice(0, props.length)
  for (let i = 0; i < props.length; i++) {
    digits.value[i] = cleanValue[i] || ''
  }
  updateValue()
}

watch(
  () => props.modelValue,
  (newValue: string) => {
    if (newValue !== otpValue.value) {
      setValue(newValue)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.autoFocus && !props.disabled && typeof document !== 'undefined') {
    setTimeout(() => {
      nextTick(() => {
        if (
          !document.activeElement ||
          document.activeElement === document.body
        ) {
          inputRefs.value[0]?.focus()
        }
      })
    }, 100)
  }
})

defineExpose({
  clear,
  focus,
  setValue,
  isComplete: readonly(isComplete),
  value: readonly(otpValue),
})
</script>

<template>
  <div class="otp-container">
    <div
      class="otp-inputs"
      :class="{ 'has-error': props.hasError, disabled: disabled }"
    >
      <input
        v-for="(_digit, index) in digits"
        :key="index"
        :ref="(el: any) => setInputRef(el as HTMLInputElement | null, index)"
        :value="digits[index]"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        class="otp-digit"
        :class="{ filled: digits[index] }"
        :disabled="disabled"
        :readonly="disabled"
        :tabindex="disabled ? -1 : 0"
        autocomplete="one-time-code"
        @input="handleInput(index, $event as InputEvent)"
        @keydown="handleKeydown(index, $event as KeyboardEvent)"
        @paste="handlePaste($event as ClipboardEvent)"
        @focus="handleFocus(index)"
      />
    </div>
  </div>
</template>

<style>
:root {
  --otp-accent: #0ea5e9;
  --otp-error: #ef4444;
  --otp-border: #d1d5db;
  --otp-bg: #fff;
  --otp-text: #111827;

  --otp-width: 3rem;
  --otp-height: 3rem;
  --otp-radius: 0.5rem;
  --otp-font: 1rem;
  --otp-gap: 0.5rem;

  --otp-mobile-width: 2.5rem;
  --otp-mobile-height: 2.5rem;
  --otp-mobile-font: 0.9rem;

  --otp-focus-ring: 2px;
  --otp-shake-distance: 2px;
  --otp-shake-duration: 0.25s;
}

.otp-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.otp-inputs {
  display: flex;
  gap: var(--otp-gap);
  justify-content: center;
}

.otp-digit {
  width: var(--otp-width);
  height: var(--otp-height);
  border: 1px solid var(--otp-border);
  border-radius: var(--otp-radius);
  text-align: center;
  font-size: var(--otp-font);
  font-weight: 500;
  background: var(--otp-bg);
  color: var(--otp-text);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.otp-digit:focus {
  border-color: var(--otp-accent);
  box-shadow: 0 0 0 var(--otp-focus-ring)
    color-mix(in srgb, var(--otp-accent) 30%, transparent);
}

.otp-digit.filled {
  border-color: var(--otp-accent);
}

.otp-digit:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.otp-inputs.has-error .otp-digit {
  border-color: var(--otp-error);
}
.otp-inputs.has-error .otp-digit:focus {
  box-shadow: 0 0 0 var(--otp-focus-ring)
    color-mix(in srgb, var(--otp-error) 30%, transparent);
}

@media (max-width: 480px) {
  .otp-digit {
    width: var(--otp-mobile-width);
    height: var(--otp-mobile-height);
    font-size: var(--otp-mobile-font);
  }
}

.otp-inputs.has-error {
  animation: shake var(--otp-shake-duration) ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(calc(-1 * var(--otp-shake-distance)));
  }
  75% {
    transform: translateX(var(--otp-shake-distance));
  }
}
</style>

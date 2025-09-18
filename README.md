# Vue OTP Input

A clean, intuitive OTP (One-Time Password) input component for Vue 3.

## Demo

[Live Demo](https://sakhnovkrg.github.io/vue-otp-input/)

## Features

- ✨ Auto-focus and smart navigation
- 📱 Mobile-friendly with touch support
- 🎨 Customizable via CSS variables
- 🚀 Easy to use
- 🔧 TypeScript support
- 📋 Clipboard paste handling
- ⚡ Lightweight with no dependencies

## Installation

```bash
npm install @sakhnovkrg/vue-otp-input
```

## Basic Usage

```vue
<template>
  <div>
    <OTPInput v-model="otp" :length="6" @complete="handleComplete" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { OTPInput } from '@sakhnovkrg/vue-otp-input'
// Optional: Import default styles
import '@sakhnovkrg/vue-otp-input/dist/index.css'

const otp = ref('')

const handleComplete = value => {
  console.log('OTP completed:', value)
}
</script>
```

## Props

| Prop         | Type      | Default | Description                          |
| ------------ | --------- | ------- | ------------------------------------ |
| `modelValue` | `string`  | `""`    | The OTP value (used by v-model)      |
| `length`     | `number`  | `6`     | Number of input fields               |
| `disabled`   | `boolean` | `false` | Disable all inputs                   |
| `hasError`   | `boolean` | `false` | Controls error styling (red borders) |
| `autoFocus`  | `boolean` | `true`  | Auto-focus first input on mount      |

## Events

| Event               | Payload  | Description                        |
| ------------------- | -------- | ---------------------------------- |
| `update:modelValue` | `string` | Emitted when value changes         |
| `complete`          | `string` | Emitted when all fields are filled |
| `change`            | `string` | Emitted on any input change        |

## Methods

Access component methods via template ref:

```vue
<template>
  <OTPInput ref="otpRef" v-model="otp" />
  <button @click="clearOTP">Clear</button>
</template>

<script setup>
import { ref } from 'vue'
import { OTPInput } from '@sakhnovkrg/vue-otp-input'

const otpRef = ref()

const clearOTP = () => {
  otpRef.value?.clear()
}
</script>
```

| Method            | Parameters | Description                       |
| ----------------- | ---------- | --------------------------------- |
| `clear()`         | -          | Clear all inputs                  |
| `focus(index?)`   | `number`   | Focus specific input (default: 0) |
| `setValue(value)` | `string`   | Set OTP value programmatically    |

## Error Handling

The component only provides visual error styling via the `hasError` prop. Error messages should be displayed separately by the parent component:

```vue
<template>
  <div>
    <OTPInput v-model="otp" :has-error="hasError" @change="clearError" />
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
const otp = ref('')
const hasError = ref(false)
const errorMessage = ref('')

// Show error
const showError = () => {
  hasError.value = true
  errorMessage.value = 'Invalid code'
}

// Clear error (automatically called on user input)
const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>
```

## Styling

The component comes with default styles that you can optionally import:

```js
// In your main.js or component
import '@sakhnovkrg/vue-otp-input/dist/index.css'
```

Internally the component renders:

```html
<div class="otp-container">
  <div class="otp-inputs has-error disabled">
    <input class="otp-digit filled" ... />
    <input class="otp-digit" ... />
    <!-- ... -->
  </div>
</div>
```

Dynamic classes:

| Class       | When applied                                    |
| ----------- | ----------------------------------------------- |
| `has-error` | When `hasError` prop is true                    |
| `disabled`  | When `disabled` prop is true                    |
| `filled`    | On each `<input>` that already contains a digit |

For most customizations you only need to override the CSS variables below.  
Use the classes above only if you need deeper or completely custom styling.

Customize appearance using CSS variables:

```css
:root {
  /* Colors */
  --otp-accent: #3b82f6;
  --otp-error: #ef4444;
  --otp-border: #d1d5db;
  --otp-bg: #fff;
  --otp-text: #111827;

  /* Dimensions */
  --otp-width: 3rem;
  --otp-height: 3rem;
  --otp-radius: 0.5rem;
  --otp-font: 1rem;
  --otp-gap: 0.5rem;

  /* Mobile */
  --otp-mobile-width: 2.5rem;
  --otp-mobile-height: 2.5rem;
  --otp-mobile-font: 0.9rem;

  /* Effects */
  --otp-focus-ring: 2px;
  --otp-shake-distance: 2px;
  --otp-shake-duration: 0.25s;
}
```

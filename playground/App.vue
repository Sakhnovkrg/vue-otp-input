<script setup lang="ts">
import { ref, nextTick } from 'vue'
import OTPInput from '../src/OTPInput.vue'

const otpRef = ref<InstanceType<typeof OTPInput> | null>(null)
const value = ref('')
const hasError = ref(false)
const isDisabled = ref(false)
const isLoading = ref(false)
const completedMessage = ref('')
const errorMessage = ref('')

const handleComplete = async (code: string) => {
  isLoading.value = true

  setTimeout(() => {
    const isSuccess = code === '123456'

    if (isSuccess) {
      completedMessage.value = '🎉 OTP verified successfully!'
      value.value = ''
      otpRef.value?.clear()
      isLoading.value = false

      nextTick(() => otpRef.value?.focus())

      setTimeout(() => (completedMessage.value = ''), 800)
    } else {
      value.value = ''
      otpRef.value?.clear()
      isLoading.value = false

      nextTick(() => {
        hasError.value = true
        errorMessage.value = 'Invalid code. Try again.'
        otpRef.value?.focus()
      })
    }
  }, 300)
}

const handleInput = () => {
  if (hasError.value || errorMessage.value) {
    hasError.value = false
    errorMessage.value = ''
  }
}

const fillPreset = () => otpRef.value?.setValue('123456')
const focusInput = () => otpRef.value?.focus()
const clearOtp = () => {
  otpRef.value?.clear()
  value.value = ''
}
const toggleDisabled = () => (isDisabled.value = !isDisabled.value)
const showError = () => {
  hasError.value = true
  errorMessage.value = 'Invalid code'
}
const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <main class="page">
    <section class="page__card">
      <a
        class="page__title-link"
        href="https://github.com/Sakhnovkrg/vue-otp-input"
      >
        <h1 class="page__title">@sakhnovkrg/vue-otp-input</h1>
      </a>

      <Transition name="slide">
        <div v-if="completedMessage" class="page__completed-message">
          {{ completedMessage }}
        </div>
      </Transition>

      <OTPInput
        ref="otpRef"
        v-model="value"
        :has-error="hasError"
        :disabled="isDisabled || isLoading"
        @complete="handleComplete"
        @change="handleInput"
      />

      <div v-if="errorMessage" class="page__error-message">
        {{ errorMessage }}
      </div>

      <div class="page__actions">
        <button class="page__button" :disabled="isLoading" @click="fillPreset">
          Fill 123456
        </button>
        <button class="page__button" :disabled="isLoading" @click="focusInput">
          Focus
        </button>
        <button class="page__button" :disabled="isLoading" @click="clearOtp">
          Clear
        </button>
      </div>

      <div class="page__actions">
        <button
          class="page__button"
          :disabled="isLoading"
          @click="toggleDisabled"
        >
          Toggle Disabled
        </button>
        <button class="page__button" :disabled="isLoading" @click="showError">
          Show Error
        </button>
        <button class="page__button" :disabled="isLoading" @click="clearError">
          Clear Error
        </button>
      </div>
    </section>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

body {
  margin: 0;
}

a {
  color: var(--otp-accent);
  text-decoration: none;
}

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  padding: 24px;
}

.page__card {
  width: min(480px, 100%);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page__title {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #111827;
  transition: 0.15s ease;
}

.page__title-link:hover .page__title {
  color: var(--otp-accent);
}

.page__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.page__button {
  flex: 1 1 140px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #0ea5e9;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.page__button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--otp-accent) 90%, black);
}

.page__button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.page__completed-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 400px;
  width: calc(100% - 40px);
  padding: 12px 16px;
  background: #dcfce7;
  border-radius: 8px;
  color: #166534;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 4px 12px #16653422;
}

.page__error-message {
  color: var(--otp-error);
  text-align: center;
  font-size: 14px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>

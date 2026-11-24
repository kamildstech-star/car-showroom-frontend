<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
})

const { login, loading } = useAuth()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: 'admin@hassanmotors.pk',
  password: '',
  remember: true,
})

const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const handleSubmit = async () => {
  errorMessage.value = null
  fieldErrors.value = {}

  if (!form.email || !form.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  try {
    const res = await login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    })

    if (res.success) {
      const redirect = (route.query.redirect as string) || '/admin'
      await router.push(redirect)
    }
  } catch (err: unknown) {
    const error = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      status?: number
    }

    if (error.status === 429) {
      errorMessage.value = 'Too many failed login attempts. Please wait 1 minute before trying again.'
    } else if (error.data?.errors) {
      fieldErrors.value = error.data.errors
      errorMessage.value = error.data.message || 'Validation failed.'
    } else {
      errorMessage.value = error.data?.message || 'Login failed. Please verify your credentials.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="inline-flex w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center justify-center font-bold text-2xl shadow-xl shadow-emerald-500/10 mb-4">
        HM
      </div>
      <h2 class="text-2xl font-bold tracking-tight text-white">
        Hassan Motors Admin
      </h2>
      <p class="mt-1.5 text-xs text-slate-400">
        Private Showroom Management Portal &middot; Faisalabad
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2"
        >
          <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Email
            </label>
            <div class="mt-1.5">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                placeholder="admin@hassanmotors.pk"
                class="block w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                :class="{ 'border-rose-500': fieldErrors.email }"
              />
            </div>
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-rose-400">
              {{ fieldErrors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div class="mt-1.5">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="Enter admin password"
                class="block w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                :class="{ 'border-rose-500': fieldErrors.password }"
              />
            </div>
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-rose-400">
              {{ fieldErrors.password[0] }}
            </p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.remember"
                name="remember"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
              />
              <label for="remember" class="ml-2 block text-xs text-slate-300">
                Remember session
              </label>
            </div>
            <span class="text-xs text-slate-500 font-mono">Sanctum SPA Cookie</span>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition shadow-emerald-950"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ loading ? 'Authenticating...' : 'Sign in to Dashboard' }}</span>
            </button>
          </div>
        </form>

        <!-- Security Notice -->
        <div class="mt-6 pt-4 border-t border-slate-800 text-center">
          <p class="text-xs text-slate-500">
            Protected with CSRF verification &amp; 5 attempts/min rate limiting. No public registrations.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

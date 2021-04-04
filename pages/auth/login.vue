<script>
import { required } from 'vuelidate/lib/validators'

export default {
  layout: 'auth',

  data () {
    return {
      username: '',
      password: '',
      error: ''
    }
  },

  validations: {
    username: {
      required
    },
    password: {
      required
    }
  },

  methods: {
    async login () {
      this.error = ''
      this.$v.$touch()

      if (!this.$v.$invalid) {
        try {
          await this.$http.post('/api/login', { username: this.username, password: this.password })
          this.$store.commit('account/login', JSON.parse(atob(this.$cookies.get('jwt-payload'))))
          await this.$router.push({ name: 'index' })
        } catch (e) {
          this.error = 'Nepodařilo se přihlásit. Zkuste to znovu.'
        }
      }
    }
  }
}
</script>

<template>
  <form
    novalidate
    @submit.prevent="login"
  >
    <h2 class="mb-3">
      Přihlásit se
    </h2>

    <v-alert
      v-if="error"
      color="red"
      type="error"
    >
      {{ error }}
    </v-alert>

    <VTextField
      v-model="username"
      label="Uživatelské jméno*"
      outlined
    />
    <VTextField
      v-model="password"
      label="Heslo*"
      outlined
      type="password"
    />

    <VBtn @click="$router.push({ name: 'auth-register' })">
      Zaregistrovat
    </VBtn>

    <VBtn
      type="submit"
      color="primary"
    >
      Přihlásit
    </VBtn>
  </form>
</template>

<style lang="scss" scoped>

</style>

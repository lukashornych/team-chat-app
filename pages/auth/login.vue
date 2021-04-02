<script>
import { required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      username: '',
      password: ''
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
    login () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        // todo server documented
      }
    }
  },

  layout: 'auth'
}
</script>

<template>
  <form
    novalidate
    @submit.prevent="login"
  >
    <h2 class="mb-3">Přihlásit se</h2>

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

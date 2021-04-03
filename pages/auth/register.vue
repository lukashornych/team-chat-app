<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      code: '',
      name: '',
      username: '',
      password: ''
    }
  },

  validations: {
    code: {
      required
    },
    name: {
      required,
      minLength: minLength(5)
    },
    username: {
      required,
      minLength: minLength(5)
    },
    password: {
      minLength: minLength(12)
    }
  },

  methods: {
    register () {
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
    @submit.prevent="register"
  >
    <h2 class="mb-3">Zaregistrovat se</h2>

    <VTextField
      v-model="code"
      label="Kód pozvánky*"
      outlined
    />
    <VTextField
      v-model="name"
      label="Zobrazované jméno*"
      outlined
    />
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

    <VBtn @click="$router.push({ name: 'auth-login' })">
      Přihlásit se
    </VBtn>

    <VBtn
      type="submit"
      color="primary"
    >
      Zaregistrovat
    </VBtn>
  </form>
</template>

<style lang="scss" scoped>

</style>

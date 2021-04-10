<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      code: '',
      name: '',
      username: '',
      password: '',
      error: ''
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
      minLength: minLength(8)
    }
  },

  methods: {
    async register () {
      this.error = ''
      this.$v.$touch()

      if (!this.$v.$invalid) {
        // todo
        await this.$http.$post(
          '/api/register',
          {
            code: this.code,
            name: this.name,
            username: this.username,
            password: this.password
          },
          {
            hooks: {
              afterResponse: [
                async (req, opt, res) => {
                  if (res.statusCode === 400) {
                    const err = await res.text()
                    if (err === 'unknown-code') {
                      this.error = 'Neznámý kód'
                    } else if (err === 'user-exists') {
                      this.error = 'Uživatel s tím to uživatelským jménem již existuje.'
                    }
                  }
                }
              ]
            }
          }
        )
        this.$router.push({ name: 'auth-login' })
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

    <v-alert
      v-if="error"
      color="red"
      type="error"
    >
      {{ error }}
    </v-alert>

    <VTextField
      v-model="code"
      label="Kód pozvánky*"
      outlined
    />
    <p
      v-if="$v.code.$error"
    >
      Kód pozvánky je povinný
    </p>
    <VTextField
      v-model="name"
      label="Zobrazované jméno*"
      outlined
    />
    <p
      v-if="$v.name.$error"
    >
      Zobrazované jméno je povinné
    </p>
    <VTextField
      v-model="username"
      label="Uživatelské jméno*"
      outlined
    />
    <p
      v-if="$v.username.$error"
    >
      Uživatelské jméno je povinné
    </p>
    <VTextField
      v-model="password"
      label="Heslo*"
      outlined
      type="password"
    />
    <p
      v-if="$v.password.$error"
    >
      Heslo musí mít alespoň 8 znaků
    </p>

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
